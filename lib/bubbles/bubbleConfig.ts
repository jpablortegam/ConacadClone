// lib/bubbles/bubbleConfig.ts
import type { BubbleConfigType, ColorHex } from '@/types/bubbles';

// Paleta Neutral de Tailwind en hex para burbujas sin imagen
export const TAILWIND_NEUTRAL: ColorHex[] = ['#1A1A1A', '#333333', '#4D4D4D', '#CCCCCC', '#F5F5F5'];

export const BUBBLE_CONFIG: BubbleConfigType = {
  // Timing
  respawnDelay: 4000, // ✅ Aumentado de 3000 a 4000
  rateLimitInterval: 750, // ✅ Aumentado de 500 a 750
  autoPopInterval: 10000, // ✅ Aumentado de 8000 a 10000

  // Responsive
  mobileBreakpoint: 640,

  // Cantidad de burbujas (reducida)
  desktopBubbleCount: 15, // ✅ Reducido de 20 a 15
  mobileBubbleCount: 10, // ✅ Reducido de 15 a 10

  // Tamaños
  desktopMinRadius: 25,
  desktopMaxRadius: 50,
  mobileMinRadius: 20,
  mobileMaxRadius: 35,

  // Animaciones
  popScaleEffect: 1.2,
  popAnimationDuration: 15,
  spawnAnimationDuration: 30,

  // Partículas
  particleCount: 4,
  particleMinRadius: 1,
  particleMaxRadius: 4,
  maxParticles: 50,

  // Física
  bounceDamping: 0.3,
  friction: 0.995,

  // Interacción con mouse
  mouseRepelRadius: 0,
  mouseRepelForce: 0,
  maxRepelDistance: 0,

  // Rendering
  cullDistance: 100,

  // Resize
  mobileResizeThreshold: 100,
  resizeDebounceTime: 300, // ✅ Aumentado de 200 a 300

  // Avatar styling
  avatarPadding: 1,
  avatarBorderWidth: 3,
  profileBubbleRatio: 0.4, // ✅ Reducido de 0.7 a 0.4 (menos avatares = menos requests)
} as const;
