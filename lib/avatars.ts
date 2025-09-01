// lib/avatars.ts
import sharp from 'sharp';
import crypto from 'crypto';
import { supabaseServer } from '@/lib/supabase/supabaseServer';

const SIZE_MAP = { small: 64, medium: 128, large: 256 } as const;
export type AvatarSize = keyof typeof SIZE_MAP;

export function normalizeUpstreamUrl(url: string, sizePx: number) {
  if (!url) return url;
  if (url.includes('googleusercontent.com')) return url.replace(/=s\d+-c/, `=s${sizePx}-c`);
  if (url.includes('avatars.githubusercontent.com')) {
    if (url.includes('?s=')) return url.replace(/([?&])s=\d+/, `$1s=${sizePx}`);
    return url + (url.includes('?') ? `&s=${sizePx}` : `?s=${sizePx}`);
  }
  return url;
}

async function fetchWithBackoffToBuffer(url: string) {
  let delay = 250;
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
      continue;
    }
    throw new Error(`Upstream ${res.status}`);
  }
  throw new Error('Too many retries');
}

function publicUrl(objectPath: string) {
  const { data } = supabaseServer.storage.from('avatars').getPublicUrl(objectPath);
  return data.publicUrl;
}

async function getStoredHash(dir: string) {
  const hashPath = `${dir}/hash.txt`;
  const { data, error } = await supabaseServer.storage.from('avatars').download(hashPath);
  if (error || !data) return null;

  // `data` es un Blob en runtime server; lo convertimos a texto sin usar `any`.
  const text = await new Response(data).text();
  const trimmed = text.trim();
  return trimmed.length ? trimmed : null;
}

async function setStoredHash(dir: string, hash: string) {
  const hashPath = `${dir}/hash.txt`;
  // Usamos Uint8Array para evitar Blob/any; Supabase acepta ArrayBuffer/Uint8Array.
  const body = new TextEncoder().encode(hash);
  await supabaseServer.storage.from('avatars').upload(hashPath, body, {
    upsert: true,
    cacheControl: 'no-store',
    contentType: 'text/plain; charset=utf-8',
  });
}

function contentHash(buf: Buffer) {
  return crypto.createHash('sha1').update(buf).digest('hex');
}

/**
 * Asegura la variante en Storage; re-sube sólo si cambió el contenido.
 * Devuelve URL pública con ?v=<hash>
 */
export async function ensureAvatarInStorage(params: {
  userId: string;
  upstreamUrl: string;
  size: AvatarSize;
}) {
  const sizePx = SIZE_MAP[params.size];
  const dir = `users/${params.userId}`;

  // 1 key por tamaño, extensión y tipo correctos
  const fileName = `${params.userId}_${sizePx}.webp`;
  const objectPath = `${dir}/${fileName}`;

  // Descargar origen normalizado
  const normalized = normalizeUpstreamUrl(params.upstreamUrl, sizePx);
  const original = await fetchWithBackoffToBuffer(normalized);

  // Hash del original (sirve como versión)
  const hash = contentHash(original);

  // Si el hash coincide, no re-subimos — devolvemos URL con ?v=
  const prevHash = await getStoredHash(dir);
  const urlBase = publicUrl(objectPath);
  if (prevHash === hash) {
    return `${urlBase}?v=${hash}`;
  }

  // Redimensionar + convertir a WebP real
  const out = await sharp(original)
    .resize(sizePx, sizePx, { fit: 'cover' })
    .webp({ quality: 82 })
    .toBuffer();

  // Subir sobrescribiendo la misma key (sin crear versiones en disco)
  const { error } = await supabaseServer.storage.from('avatars').upload(objectPath, out, {
    upsert: true,
    contentType: 'image/webp',
    cacheControl: '31536000, immutable',
  });
  if (error) throw error;

  // Guardar nuevo hash
  await setStoredHash(dir, hash);

  // Devolver URL con cache-busting
  return `${urlBase}?v=${hash}`;
}
