// lib/bubbles/bubbleUtils.ts
import type { ColorHex } from '@/types/bubbles';
import { TAILWIND_NEUTRAL, BUBBLE_CONFIG } from './bubbleConfig';

// Pool de colores para rotación
const colorPool = TAILWIND_NEUTRAL.concat(TAILWIND_NEUTRAL, TAILWIND_NEUTRAL);
let colorIndex = 0;

/**
 * Obtiene un color neutral aleatorio de la paleta
 */
export const getRandomNeutralColor = (): ColorHex => {
  const color = colorPool[colorIndex % colorPool.length];
  colorIndex++;
  return color;
};

/**
 * Detecta si el dispositivo es móvil basado en user agent y viewport
 */
export const isMobileDevice = (): boolean => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= BUBBLE_CONFIG.mobileBreakpoint
  );
};

/**
 * Calcula si un cambio de tamaño es significativo
 */
export const isSignificantResize = (
  newW: number,
  newH: number,
  oldW: number,
  oldH: number,
  isMobile: boolean
): boolean => {
  const widthChange = Math.abs(newW - oldW);
  const heightChange = Math.abs(newH - oldH);

  if (isMobile) {
    return (
      widthChange > BUBBLE_CONFIG.mobileResizeThreshold ||
      heightChange > BUBBLE_CONFIG.mobileResizeThreshold
    );
  }

  return widthChange > 10 || heightChange > 10;
};

/**
 * Obtiene la configuración de burbuja según el tipo de dispositivo
 */
export const getBubbleSettings = (isMobile: boolean) => {
  return {
    count: isMobile ? BUBBLE_CONFIG.mobileBubbleCount : BUBBLE_CONFIG.desktopBubbleCount,
    minRadius: isMobile ? BUBBLE_CONFIG.mobileMinRadius : BUBBLE_CONFIG.desktopMinRadius,
    maxRadius: isMobile ? BUBBLE_CONFIG.mobileMaxRadius : BUBBLE_CONFIG.desktopMaxRadius,
    targetFPS: isMobile ? 45 : 60,
    gridSize: isMobile ? 80 : 100,
    damping: isMobile ? 0.85 : 0.9,
  };
};

/**
 * Genera una posición aleatoria válida para una burbuja
 */
export const getRandomPosition = (canvasWidth: number, canvasHeight: number, maxRadius: number) => {
  return {
    x: Math.random() * (canvasWidth - 2 * maxRadius) + maxRadius,
    y: Math.random() * (canvasHeight - 2 * maxRadius) + maxRadius,
  };
};

/**
 * Genera un radio aleatorio dentro del rango configurado
 */
export const getRandomRadius = (minRadius: number, maxRadius: number): number => {
  return Math.max(Math.random() * (maxRadius - minRadius) + minRadius, 1);
};

/**
 * Resetea el índice de colores (útil para testing o reinicios)
 */
export const resetColorIndex = (): void => {
  colorIndex = 0;
};
