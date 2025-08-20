// app/api/avatars/[id]/[size]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureAvatarInStorage, type AvatarSize } from '@/lib/avatars';

// ⚠️ usa sharp → Node runtime
export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  context: { params: { id: string; size: string } } // 👈 tipado explícito y simple
) {
  const { id, size } = context.params;

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
    const url = await ensureAvatarInStorage({
      userId: id,
      upstreamUrl: user.image,
      size: validSize,
    });

    return NextResponse.redirect(url, {
      status: 302,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Bad Gateway', { status: 502 });
  }
}
