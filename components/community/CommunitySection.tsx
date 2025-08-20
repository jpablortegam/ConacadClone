'use client';

import React, { useMemo, useState, useEffect } from 'react';
import type { CommunitySeccionProps } from '@/types/bubbles';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import BubblesSkeleton from './BubblesSkeleton';
import BubbleCanvas from './BubbleCanvas';

const CommunitySection: React.FC<CommunitySeccionProps> = ({ profilePictures = [] }) => {
  // Hook para cargar usuarios de forma no bloqueante
  const { userProfiles: apiUserProfiles, isLoading, error } = useUserProfiles();

  // Estado para controlar si el componente está listo
  const [isReady, setIsReady] = useState(false);

  // ✅ FIX: Usar useMemo para combinar perfiles y evitar el bucle infinito
  const userProfiles = useMemo(() => {
    const combined = [...profilePictures, ...apiUserProfiles];
    if (combined.length > 0) {
      console.log(`✅ Total perfiles disponibles: ${combined.length}`);
    }
    return combined;
  }, [profilePictures, apiUserProfiles]);

  // Marcar como listo cuando termine de cargar
  useEffect(() => {
    if (!isLoading) {
      // Pequeño delay para asegurar que el render principal ya haya terminado
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <section
      id="comunidad"
      className="bg-card/90 border-border/20 container mx-auto mb-10 rounded-lg border p-8 px-4 text-center shadow-lg backdrop-blur-sm transition-all duration-300 dark:shadow-2xl dark:shadow-black/25"
    >
      <h2 className="text-primary mb-6 text-4xl font-extrabold">Nuestra Comunidad</h2>

      <div className="bg-muted/30 dark:bg-muted/10 border-border/50 dark:border-border/30 relative h-96 w-full overflow-hidden rounded-lg border-2 transition-colors duration-300">
        {/* Overlay de carga mejorado */}
        {!isReady && <BubblesSkeleton />}

        {/* Mensaje de error si falla la carga de API (opcional) */}
        {error && isReady && userProfiles.length === 0 && (
          <div className="bg-background/40 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="text-muted-foreground flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Modo sin conexión</p>
                <p className="text-xs opacity-75">Mostrando burbujas básicas</p>
              </div>
            </div>
          </div>
        )}

        {/* Canvas de burbujas */}
        <BubbleCanvas userProfiles={userProfiles} isReady={isReady} />
      </div>
    </section>
  );
};

export default CommunitySection;
