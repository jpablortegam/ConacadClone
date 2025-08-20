// lib/avatars.ts
import sharp from 'sharp';
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

/** Asegura la variante en Storage; si falta la descarga, redimensiona y sube. */
export async function ensureAvatarInStorage(params: {
  userId: string;
  upstreamUrl: string;
  size: AvatarSize;
}) {
  const sizePx = SIZE_MAP[params.size];
  const fileName = `${params.userId}_${sizePx}.jpg`;
  const dir = `users/${params.userId}`;
  const objectPath = `${dir}/${fileName}`;

  // Existe ya?
  const { data: existing } = await supabaseServer.storage
    .from('avatars')
    .list(dir, { search: fileName });

  if (existing?.find((f: { name: string }) => f.name === fileName)) return publicUrl(objectPath);

  // Descargar origen normalizado
  const normalized = normalizeUpstreamUrl(params.upstreamUrl, sizePx);
  const original = await fetchWithBackoffToBuffer(normalized);

  // Redimensionar
  const out = await sharp(original)
    .resize(sizePx, sizePx, { fit: 'cover' })
    .jpeg({ quality: 82 })
    .toBuffer();

  // Subir con cache fuerte
  const { error } = await supabaseServer.storage.from('avatars').upload(objectPath, out, {
    upsert: true,
    contentType: 'image/jpeg',
    cacheControl: '31536000, immutable',
  });

  if (error) throw error;
  return publicUrl(objectPath);
}
