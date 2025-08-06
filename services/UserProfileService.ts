// src/services/RealtimeUserProfileService.ts

import { PrismaClient } from '@prisma/client';

/**
 * Tipo para el perfil de usuario que será usado en las burbujas
 */
export interface UserProfile {
  id: string; // Añadido para tracking
  name: string;
  image: string;
  lastSeen?: Date; // Para mostrar actividad reciente
}

/**
 * Tipo para eventos de actualización en tiempo real
 */
export type ProfileUpdateEvent = {
  type: 'PROFILE_ADDED' | 'PROFILE_UPDATED' | 'PROFILE_REMOVED' | 'USER_ONLINE' | 'USER_OFFLINE';
  profile: UserProfile;
  timestamp: Date;
};

/**
 * Servicio optimizado para manejar perfiles de usuario en tiempo real
 */
class RealtimeUserProfileService {
  private prisma: PrismaClient;
  private cache: Map<string, UserProfile> = new Map();
  private lastCacheUpdate: Date = new Date(0);
  private cacheExpiry: number = 30 * 1000; // 30 segundos
  private subscribers: Set<(event: ProfileUpdateEvent) => void> = new Set();

  // Pool de perfiles para rotación automática
  private profilePool: UserProfile[] = [];
  private currentPoolIndex: number = 0;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.initializeCache();
  }

  /**
   * Inicializa el cache con datos frescos
   */
  private async initializeCache(): Promise<void> {
    try {
      const profiles = await this.fetchProfilesFromDB();
      this.updateCache(profiles);
      console.log(`🚀 Cache inicializado con ${profiles.length} perfiles`);
    } catch (error) {
      console.error('❌ Error inicializando cache:', error);
    }
  }

  /**
   * Actualiza el cache con nuevos perfiles
   */
  private updateCache(profiles: UserProfile[]): void {
    this.cache.clear();
    this.profilePool = profiles;

    profiles.forEach((profile) => {
      this.cache.set(profile.id, profile);
    });

    this.lastCacheUpdate = new Date();
  }

  /**
   * Verifica si el cache está expirado
   */
  private isCacheExpired(): boolean {
    return Date.now() - this.lastCacheUpdate.getTime() > this.cacheExpiry;
  }

  /**
   * Obtiene perfiles desde la base de datos con optimizaciones
   */
  private async fetchProfilesFromDB(): Promise<UserProfile[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        updatedAt: true,
        // Si tienes un campo de última conexión:
        // lastSeen: true,
      },
      where: {
        image: { not: null },
        name: { not: null },
        // Opcional: solo usuarios activos en los últimos 30 días
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: [
        { updatedAt: 'desc' },
        { id: 'asc' }, // Para orden consistente
      ],
      take: 100, // Aumentado para mejor rotación
    });

    return users
      .filter((user): user is { id: string; name: string; image: string; updatedAt: Date } => {
        return user.image !== null && user.name !== null;
      })
      .map((user) => ({
        id: user.id,
        name: user.name,
        image: user.image,
        lastSeen: user.updatedAt,
      }));
  }

  /**
   * 🚀 MÉTODO PRINCIPAL: Obtiene perfiles con cache inteligente
   */
  public async getProfilePictures(forceRefresh: boolean = false): Promise<UserProfile[]> {
    // Si el cache es válido y no se fuerza refresh, usar cache
    if (!forceRefresh && !this.isCacheExpired() && this.profilePool.length > 0) {
      console.log(`⚡ Usando cache (${this.profilePool.length} perfiles)`);
      return [...this.profilePool]; // Retorna copia para evitar mutaciones
    }

    try {
      console.log('🔄 Actualizando perfiles desde DB...');
      const profiles = await this.fetchProfilesFromDB();
      this.updateCache(profiles);

      // Notificar a suscriptores sobre la actualización masiva
      profiles.forEach((profile) => {
        this.notifySubscribers({
          type: 'PROFILE_ADDED',
          profile,
          timestamp: new Date(),
        });
      });

      console.log(`✅ Cache actualizado con ${profiles.length} perfiles`);
      return profiles;
    } catch (error) {
      console.error('❌ Error obteniendo perfiles:', error);
      // Retornar cache anterior si hay error
      return [...this.profilePool];
    }
  }

  /**
   * 🎯 Obtiene un batch rotativo de perfiles (ideal para burbujas)
   */
  public getRotatingBatch(count: number = 20): UserProfile[] {
    if (this.profilePool.length === 0) return [];

    const batch: UserProfile[] = [];

    for (let i = 0; i < count; i++) {
      const profile = this.profilePool[this.currentPoolIndex % this.profilePool.length];
      batch.push(profile);
      this.currentPoolIndex++;
    }

    console.log(`🔄 Batch rotativo: ${batch.length} perfiles (índice: ${this.currentPoolIndex})`);
    return batch;
  }

  /**
   * 📡 Suscribirse a actualizaciones en tiempo real
   */
  public subscribe(callback: (event: ProfileUpdateEvent) => void): () => void {
    this.subscribers.add(callback);
    console.log(`📡 Nuevo suscriptor. Total: ${this.subscribers.size}`);

    // Retorna función de cleanup
    return () => {
      this.subscribers.delete(callback);
      console.log(`📡 Suscriptor removido. Total: ${this.subscribers.size}`);
    };
  }

  /**
   * 📢 Notifica a todos los suscriptores
   */
  private notifySubscribers(event: ProfileUpdateEvent): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('❌ Error notificando suscriptor:', error);
      }
    });
  }

  /**
   * 🔥 Actualización incremental (solo perfiles modificados)
   */
  public async getIncrementalUpdates(): Promise<UserProfile[]> {
    try {
      const updatedProfiles = await this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          updatedAt: true,
        },
        where: {
          image: { not: null },
          updatedAt: { gte: this.lastCacheUpdate },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const newProfiles = updatedProfiles
        .filter((user): user is { id: string; name: string; image: string; updatedAt: Date } => {
          return user.image !== null && user.name !== null;
        })
        .map((user) => ({
          id: user.id,
          name: user.name,
          image: user.image,
          lastSeen: user.updatedAt,
        }));

      // Actualizar cache incrementalmente
      newProfiles.forEach((profile) => {
        const existingIndex = this.profilePool.findIndex((p) => p.id === profile.id);

        if (existingIndex >= 0) {
          // Actualizar existente
          this.profilePool[existingIndex] = profile;
          this.cache.set(profile.id, profile);

          this.notifySubscribers({
            type: 'PROFILE_UPDATED',
            profile,
            timestamp: new Date(),
          });
        } else {
          // Añadir nuevo
          this.profilePool.push(profile);
          this.cache.set(profile.id, profile);

          this.notifySubscribers({
            type: 'PROFILE_ADDED',
            profile,
            timestamp: new Date(),
          });
        }
      });

      console.log(`⚡ Actualización incremental: ${newProfiles.length} perfiles`);
      return newProfiles;
    } catch (error) {
      console.error('❌ Error en actualización incremental:', error);
      return [];
    }
  }

  /**
   * 🎲 Perfiles aleatorios del cache (super rápido)
   */
  public getRandomFromCache(count: number = 20): UserProfile[] {
    if (this.profilePool.length === 0) return [];

    const shuffled = [...this.profilePool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * 📊 Estadísticas del cache
   */
  public getCacheStats(): {
    cacheSize: number;
    lastUpdate: Date;
    isExpired: boolean;
    subscriberCount: number;
    poolRotationIndex: number;
  } {
    return {
      cacheSize: this.cache.size,
      lastUpdate: this.lastCacheUpdate,
      isExpired: this.isCacheExpired(),
      subscriberCount: this.subscribers.size,
      poolRotationIndex: this.currentPoolIndex,
    };
  }

  /**
   * 🔄 Fuerza rotación del pool (mezcla los perfiles)
   */
  public shufflePool(): void {
    this.profilePool.sort(() => Math.random() - 0.5);
    this.currentPoolIndex = 0;
    console.log(`🔀 Pool mezclado: ${this.profilePool.length} perfiles`);
  }

  /**
   * 🧹 Limpieza de recursos
   */
  public cleanup(): void {
    this.cache.clear();
    this.subscribers.clear();
    this.profilePool = [];
    console.log('🧹 Servicio limpiado');
  }

  /**
   * 🚀 MÉTODO PARA COMPONENTE DE BURBUJAS: Auto-refresh inteligente
   */
  public async getProfilesForBubbles(count: number = 20): Promise<{
    profiles: UserProfile[];
    isFromCache: boolean;
    nextRefreshIn: number; // milisegundos
  }> {
    const isFromCache = !this.isCacheExpired() && this.profilePool.length > 0;

    let profiles: UserProfile[];

    if (isFromCache) {
      // Usar rotación si hay suficientes perfiles
      profiles =
        this.profilePool.length > count * 2
          ? this.getRotatingBatch(count)
          : this.getRandomFromCache(count);
    } else {
      // Refresh y obtener nuevos
      const allProfiles = await this.getProfilePictures();
      profiles = allProfiles.slice(0, count);
    }

    const nextRefreshIn = this.cacheExpiry - (Date.now() - this.lastCacheUpdate.getTime());

    return {
      profiles,
      isFromCache,
      nextRefreshIn: Math.max(0, nextRefreshIn),
    };
  }
}

// Singleton instance para uso global
let serviceInstance: RealtimeUserProfileService | null = null;

export const getRealtimeUserProfileService = (
  prisma?: PrismaClient
): RealtimeUserProfileService => {
  if (!serviceInstance && prisma) {
    serviceInstance = new RealtimeUserProfileService(prisma);
  }

  if (!serviceInstance) {
    throw new Error(
      'RealtimeUserProfileService no ha sido inicializado. Proporciona una instancia de PrismaClient.'
    );
  }

  return serviceInstance;
};

export default RealtimeUserProfileService;
