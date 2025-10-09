// app/api/avatars/[id]/[size]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureAvatarInStorage, type AvatarSize } from '@/lib/avatars';

const SIZE_MAP = { small: 64, medium: 128, large: 256 } as const;

// ⚠️ sharp → Node runtime
export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string; size: string }> }
) {
  const { id, size } = await context.params;

  const validSize = (
    ['small', 'medium', 'large'].includes(size) ? (size as AvatarSize) : 'medium'
  ) as AvatarSize;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { image: true, name: true },
  });

  if (!user?.image) {
    // Generar una imagen de avatar por defecto usando redirect
    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=${SIZE_MAP[validSize]}&background=random&color=fff&format=png`;
    
    console.log('🔄 User has no image, redirecting to default avatar:', defaultAvatarUrl);
    
    return NextResponse.redirect(defaultAvatarUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  }

  try {
    const urlWithVersion = await ensureAvatarInStorage({
      userId: id,
      upstreamUrl: user.image,
      size: validSize,
    });

    console.log('🔍 Generated URL:', urlWithVersion);

    // Simplemente redirigir - Next.js Image debería poder manejar esto
    return NextResponse.redirect(urlWithVersion, {
      status: 302,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
      },
    });
  } catch (e) {
    console.error('❌ /api/avatars route error', e);
    
    // Fallback: generar avatar por defecto
    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=${SIZE_MAP[validSize]}&background=random&color=fff&format=png`;
    
    console.log('🔄 Falling back to default avatar:', defaultAvatarUrl);
    
    return NextResponse.redirect(defaultAvatarUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  }
}
