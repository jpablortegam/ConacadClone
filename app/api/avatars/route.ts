export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AvatarResponse {
  id: string;
  name: string | null;
  image: string; // URL a nuestro proxy
}
interface ApiResponse {
  avatars: AvatarResponse[];
  total: number;
  timestamp: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const size = (searchParams.get('size') || 'medium') as 'small' | 'medium' | 'large';

    const users = await prisma.$queryRaw<
      Array<{ id: string; name: string | null; image: string | null }>
    >`
      SELECT id, name, image
      FROM users
      WHERE image IS NOT NULL AND image != ''
      ORDER BY RANDOM()
      LIMIT ${limit}
    `;

    const avatars: AvatarResponse[] = users
      .filter((u) => u.image)
      .map((u) => ({
        id: u.id,
        name: u.name || 'Usuario',
        image: `/api/avatars/${u.id}/${size}`, // ruta de tu estructura
      }));

    const payload: ApiResponse = { avatars, total: avatars.length, timestamp: Date.now() };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    console.error('❌ /api/avatars error', e);
    return NextResponse.json(
      { avatars: [], total: 0, timestamp: Date.now(), error: 'Failed to fetch avatars' },
      { status: 500, headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'application/json' } }
    );
  }
}
