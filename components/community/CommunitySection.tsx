"use client";

import React, { useMemo, useState, useEffect } from "react";
import type { CommunitySeccionProps } from '@/types/bubbles';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import BubblesSkeleton from './BubblesSkeleton';
import BubbleCanvas from './BubbleCanvas';

const CommunitySection: React.FC<CommunitySeccionProps> = ({
    profilePictures = [],
}) => {
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
            className="
        container mx-auto px-4
        bg-card/90 backdrop-blur-sm
        border border-border/20 rounded-lg
        shadow-lg dark:shadow-2xl dark:shadow-black/25
        p-8 mb-10 text-center
        transition-all duration-300
      "
        >
            <h2 className="text-4xl font-extrabold mb-6 text-primary">
                Nuestra Comunidad
            </h2>

            <div
                className="
          relative w-full h-96
          bg-muted/30 dark:bg-muted/10
          rounded-lg overflow-hidden
          border-2 border-border/50 dark:border-border/30
          transition-colors duration-300
        "
            >
                {/* Overlay de carga mejorado */}
                {!isReady && <BubblesSkeleton />}

                {/* Mensaje de error si falla la carga de API (opcional) */}
                {error && isReady && userProfiles.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
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
                <BubbleCanvas
                    userProfiles={userProfiles}
                    isReady={isReady}
                />
            </div>
        </section>
    );
};

export default CommunitySection;