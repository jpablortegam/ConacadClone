export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureAvatarInStorage, type AvatarSize } from '@/lib/avatars';

const SIZE_MAP = { small: 64, medium: 128, large: 256 } as const;

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
      ORDER BY RANDOM()
      LIMIT ${limit}
    `;

    const avatars: AvatarResponse[] = await Promise.all(
      users.map(async (u) => {
        let imageUrl: string;
        
        if (u.image) {
          try {
            // Generar URL directa de Supabase
            imageUrl = await ensureAvatarInStorage({
              userId: u.id,
              upstreamUrl: u.image,
              size: size as AvatarSize,
            });
          } catch (error) {
            console.error(`Error processing avatar for user ${u.id}:`, error);
            // Fallback a avatar por defecto
            imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&size=${SIZE_MAP[size as AvatarSize]}&background=random&color=fff&format=png`;
          }
        } else {
          // Usuario sin imagen - generar avatar por defecto
          imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&size=${SIZE_MAP[size as AvatarSize]}&background=random&color=fff&format=png`;
        }
        
        return {
          id: u.id,
          name: u.name || 'Usuario',
          image: imageUrl, // URL directa, no proxy
        };
      })
    );

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
