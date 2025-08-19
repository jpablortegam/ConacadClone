// app/api/avatars/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ajusta la ruta según tu configuración

interface AvatarResponse {
  id: string;
  name: string | null;
  image: string;
  needsSync?: boolean;
}

interface ApiResponse {
  avatars: AvatarResponse[];
  total: number;
  timestamp: number;
}

// Función para formatear URLs de imagen según el tamaño
function formatImageUrl(originalUrl: string | null, size: string): string | null {
  if (!originalUrl) return null;

  try {
    // Para GitHub avatares
    if (originalUrl.includes('avatars.githubusercontent.com')) {
      const sizeMap = {
        small: '64',
        medium: '128',
        large: '256',
      };
      const targetSize = sizeMap[size as keyof typeof sizeMap] || '128';

      // Si ya tiene parámetro de tamaño, reemplazarlo
      if (originalUrl.includes('&s=') || originalUrl.includes('?s=')) {
        return originalUrl.replace(/[?&]s=\d+/, `&s=${targetSize}`);
      } else {
        // Agregar parámetro de tamaño
        const separator = originalUrl.includes('?') ? '&' : '?';
        return `${originalUrl}${separator}s=${targetSize}`;
      }
    }

    // Para Google avatares
    if (originalUrl.includes('googleusercontent.com')) {
      const sizeMap = {
        small: 's64-c',
        medium: 's128-c',
        large: 's256-c',
      };
      const targetSize = sizeMap[size as keyof typeof sizeMap] || 's128-c';

      // Reemplazar el parámetro de tamaño existente
      return originalUrl.replace(/=s\d+-c/, `=${targetSize}`);
    }

    // Para otros proveedores, devolver la URL original
    return originalUrl;
  } catch (error) {
    console.warn('Error formatting image URL:', error);
    return originalUrl;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Máximo 50
    const size = searchParams.get('size') || 'medium'; // small, medium, large

    // Obtener usuarios aleatorios con imágenes usando una consulta optimizada
    const users = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string | null;
        image: string | null;
      }>
    >`
      SELECT id, name, image
      FROM users 
      WHERE image IS NOT NULL 
        AND image != ''
      ORDER BY RANDOM() 
      LIMIT ${limit}
    `;

    // Formatear las respuestas
    const avatars: AvatarResponse[] = users
      .filter((user) => user.image) // Filtro adicional por seguridad
      .map((user) => ({
        id: user.id,
        name: user.name || 'Usuario',
        image: formatImageUrl(user.image, size) || user.image!,
      }));

    const response: ApiResponse = {
      avatars,
      total: avatars.length,
      timestamp: Date.now(),
    };

    // Headers para optimización de cache
    const headers = {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
      'Content-Type': 'application/json',
    };

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error('❌ Error in /api/avatars:', error);

    // Respuesta de error estructurada
    const errorResponse = {
      avatars: [],
      total: 0,
      timestamp: Date.now(),
      error: 'Failed to fetch avatars',
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    });
  }
}

// Endpoint POST para actualizar sincronización (opcional)
export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 });
    }

    // Since imageLastSync doesn't exist in schema, we'll just update the updatedAt field
    const result = await prisma.user.updateMany({
      where: {
        id: {
          in: userIds,
        },
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update sync timestamps' }, { status: 500 });
  }
}
