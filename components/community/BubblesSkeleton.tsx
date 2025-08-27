import React from 'react';

/**
 * Componente de carga skeleton optimizado para las burbujas
 * Muestra un estado de carga atractivo mientras se cargan los perfiles
 */
export const BubblesSkeleton: React.FC = () => (
  <div className="bg-background/60 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px]">
    <div className="flex flex-col items-center gap-4">
      {/* Burbujas skeleton animadas */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`from-primary/20 to-primary/5 border-border/20 h-8 w-8 animate-pulse rounded-full border bg-gradient-to-br`}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.5s',
            }}
          />
        ))}
      </div>

      {/* Texto de carga */}
      <div className="text-muted-foreground flex items-center gap-3">
        <div className="border-primary/30 border-t-primary h-4 w-4 animate-spin rounded-full border-2" />
        <span className="text-sm font-medium">Conectando con la comunidad...</span>
      </div>

      {/* Indicador de progreso sutil */}
      <div className="bg-muted h-1 w-32 overflow-hidden rounded-full">
        <div className="from-primary/50 to-primary h-full animate-pulse bg-gradient-to-r" />
      </div>
    </div>
  </div>
);

export default BubblesSkeleton;
