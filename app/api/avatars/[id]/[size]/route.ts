// app/api/avatars/[id]/[size]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureAvatarInStorage, type AvatarSize } from '@/lib/avatars';

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
    select: { image: true },
  });

  if (!user?.image) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const urlWithVersion = await ensureAvatarInStorage({
      userId: id,
      upstreamUrl: user.image,
      size: validSize,
    });

    // Redirigimos al objeto público (que ya es immutable).
    // Aquí usamos cache corto para la redirección (no immutable).
    return NextResponse.redirect(urlWithVersion, {
      status: 302,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
      },
    });
  } catch (e) {
    console.error('❌ /api/avatars route error', e);
    return new NextResponse('Bad Gateway', { status: 502 });
  }
}
