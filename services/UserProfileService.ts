// src/services/UserProfileService.ts

import { PrismaClient } from '@prisma/client';

/**
 * Tipo para el perfil de usuario que será usado en las burbujas
 */
export interface UserProfile {
  name: string;
  image: string;
}

/**
 * Servicio para manejar la lógica relacionada con los perfiles de usuario.
 */
class UserProfileService {
  private prisma: PrismaClient;

  /**
   * Inicializa el servicio con una instancia de PrismaClient.
   * @param prisma - La instancia de PrismaClient.
   */
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Obtiene una lista de todos los avatares de usuario.
   * Devuelve un array de objetos con el nombre del usuario y la URL de la imagen.
   * @returns Una promesa que se resuelve con un array de objetos de perfil.
   */
  public async getProfilePictures(): Promise<UserProfile[]> {
    try {
      const users = await this.prisma.user.findMany({
        // Selecciona solo los campos 'name' e 'image' para optimizar la consulta
        select: {
          name: true,
          image: true,
        },
        // Opcional: limitar la cantidad para mejor rendimiento
        take: 50, // Máximo 50 perfiles para las burbujas
        // Opcional: ordenar por usuarios más activos o recientes
        orderBy: [
          { updatedAt: 'desc' }, // Más recientes primero
          // { name: 'asc' }, // O alfabéticamente
        ],
        // Opcional: filtrar usuarios activos
        where: {
          // Solo usuarios con imagen
          image: {
            not: null,
          },
          // Opcional: solo usuarios activos o verificados
          // emailVerified: { not: null },
          // status: 'ACTIVE', // Si tienes un campo de status
        },
      });

      // Filtra y mapea los usuarios que tienen imagen válida
      const profiles = users
        .filter((user): user is { name: string; image: string } => {
          return user.image !== null && user.image !== '' && user.name !== null && user.name !== '';
        })
        .map((user) => ({
          name: user.name,
          image: user.image,
        }));

      console.log(`✅ Cargados ${profiles.length} perfiles de usuario para burbujas`);
      return profiles;
    } catch (error) {
      console.error('❌ Error al obtener las fotos de perfil:', error);

      // En lugar de throw, podemos retornar array vacío para que las burbujas funcionen
      // throw new Error('No se pudieron obtener las fotos de perfil.');

      // Retornar array vacío para que el componente funcione con burbujas normales
      return [];
    }
  }

  /**
   * Obtiene perfiles de usuario con paginación (útil para cargas dinámicas)
   * @param page - Número de página (empezando en 1)
   * @param limit - Cantidad de perfiles por página
   * @returns Promesa con array de perfiles y metadatos de paginación
   */
  public async getProfilePicturesPaginated(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    profiles: UserProfile[];
    totalCount: number;
    hasMore: boolean;
    currentPage: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      // Obtener el total de usuarios con imagen
      const totalCount = await this.prisma.user.count({
        where: {
          image: { not: null },
        },
      });

      // Obtener usuarios paginados
      const users = await this.prisma.user.findMany({
        select: {
          name: true,
          image: true,
        },
        where: {
          image: { not: null },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      });

      const profiles = users
        .filter((user): user is { name: string; image: string } => {
          return user.image !== null && user.name !== null;
        })
        .map((user) => ({
          name: user.name,
          image: user.image,
        }));

      return {
        profiles,
        totalCount,
        hasMore: skip + profiles.length < totalCount,
        currentPage: page,
      };
    } catch (error) {
      console.error('❌ Error al obtener perfiles paginados:', error);
      return {
        profiles: [],
        totalCount: 0,
        hasMore: false,
        currentPage: page,
      };
    }
  }

  /**
   * Obtiene perfiles aleatorios (útil para variedad en las burbujas)
   * @param count - Cantidad de perfiles aleatorios a obtener
   * @returns Promesa con array de perfiles aleatorios
   */
  public async getRandomProfilePictures(count: number = 20): Promise<UserProfile[]> {
    try {
      // Nota: En PostgreSQL puedes usar ORDER BY RANDOM()
      // En MySQL sería ORDER BY RAND()
      // Aquí uso una aproximación que funciona en ambos

      const users = await this.prisma.user.findMany({
        select: {
          name: true,
          image: true,
        },
        where: {
          image: { not: null },
        },
        take: count * 2, // Tomar más para tener variedad después del filtrado
      });

      // Filtrar y mezclar aleatoriamente
      const validProfiles = users
        .filter((user): user is { name: string; image: string } => {
          return user.image !== null && user.name !== null;
        })
        .map((user) => ({
          name: user.name,
          image: user.image,
        }))
        .sort(() => Math.random() - 0.5) // Mezcla aleatoria
        .slice(0, count); // Tomar solo la cantidad solicitada

      return validProfiles;
    } catch (error) {
      console.error('❌ Error al obtener perfiles aleatorios:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas de perfiles (útil para debugging)
   * @returns Promesa con estadísticas de perfiles
   */
  public async getProfileStats(): Promise<{
    totalUsers: number;
    usersWithImages: number;
    usersWithoutImages: number;
    percentageWithImages: number;
  }> {
    try {
      const totalUsers = await this.prisma.user.count();
      const usersWithImages = await this.prisma.user.count({
        where: { image: { not: null } },
      });
      const usersWithoutImages = totalUsers - usersWithImages;
      const percentageWithImages =
        totalUsers > 0 ? Math.round((usersWithImages / totalUsers) * 100) : 0;

      return {
        totalUsers,
        usersWithImages,
        usersWithoutImages,
        percentageWithImages,
      };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return {
        totalUsers: 0,
        usersWithImages: 0,
        usersWithoutImages: 0,
        percentageWithImages: 0,
      };
    }
  }
}

// Exporta la clase para que pueda ser utilizada en otras partes de tu aplicación
export default UserProfileService;
