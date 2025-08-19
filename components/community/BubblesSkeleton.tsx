// components/community/BubblesSkeleton.tsx
import React from 'react';

/**
 * Componente de carga skeleton optimizado para las burbujas
 * Muestra un estado de carga atractivo mientras se cargan los perfiles
 */
export const BubblesSkeleton: React.FC = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] z-10">
        <div className="flex flex-col items-center gap-4">
            {/* Burbujas skeleton animadas */}
            <div className="flex gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                    <div
                        key={i}
                        className={`
              w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/5 
              rounded-full animate-pulse border border-border/20
            `}
                        style={{
                            animationDelay: `${i * 0.2}s`,
                            animationDuration: '1.5s'
                        }}
                    />
                ))}
            </div>

            {/* Texto de carga */}
            <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-sm font-medium">Conectando con la comunidad...</span>
            </div>

            {/* Indicador de progreso sutil */}
            <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary/50 to-primary animate-pulse" />
            </div>
        </div>
    </div>
);

export default BubblesSkeleton;