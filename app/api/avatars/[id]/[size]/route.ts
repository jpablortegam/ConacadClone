// app/api/avatars/[id]/[size]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureAvatarInStorage, AvatarSize } from '@/lib/avatars';

// ⚠️ usa sharp → Node runtime
export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; size: AvatarSize } }
) {
  const { id } = params;
  const size: AvatarSize = (
    ['small', 'medium', 'large'].includes(params.size) ? params.size : 'medium'
  ) as AvatarSize;

  const user = await prisma.user.findUnique({ where: { id }, select: { image: true } });
  if (!user?.image) return new NextResponse('Not found', { status: 404 });

  try {
    const url = await ensureAvatarInStorage({ userId: id, upstreamUrl: user.image, size });
    return NextResponse.redirect(url, {
      status: 302,
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch {
    return new NextResponse('Bad Gateway', { status: 502 });
  }
}
