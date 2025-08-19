// types/bubbles.ts
export type ColorHex = string;

export interface UserProfile {
  name: string;
  image: string;
}

export interface ApiAvatar {
  name?: string;
  image: string;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface BubbleConstructorParams {
  x: number;
  y: number;
  radius: number;
  color: ColorHex;
  isParticle?: boolean;
  userProfile?: UserProfile;
}

export interface BubbleUpdateParams {
  canvas: CanvasDimensions;
  mousePos?: MousePosition;
}

export interface BubbleDrawParams {
  ctx: CanvasRenderingContext2D;
  canvas: CanvasDimensions;
}

export interface UseUserProfilesReturn {
  userProfiles: UserProfile[];
  isLoading: boolean;
  error: string | null;
}

export interface CommunitySeccionProps {
  profilePictures?: UserProfile[];
}

// Configuración de colores
export interface ColorConfig {
  neutralPalette: ColorHex[];
  colorPool: ColorHex[];
}

// Configuración de burbujas
export interface BubbleConfigType {
  // Timing
  respawnDelay: number;
  rateLimitInterval: number;
  autoPopInterval: number;

  // Responsive
  mobileBreakpoint: number;

  // Cantidad de burbujas
  desktopBubbleCount: number;
  mobileBubbleCount: number;

  // Tamaños
  desktopMinRadius: number;
  desktopMaxRadius: number;
  mobileMinRadius: number;
  mobileMaxRadius: number;

  // Animaciones
  popScaleEffect: number;
  popAnimationDuration: number;
  spawnAnimationDuration: number;

  // Partículas
  particleCount: number;
  particleMinRadius: number;
  particleMaxRadius: number;
  maxParticles: number;

  // Física
  bounceDamping: number;
  friction: number;

  // Interacción con mouse
  mouseRepelRadius: number;
  mouseRepelForce: number;
  maxRepelDistance: number;

  // Rendering
  cullDistance: number;

  // Resize
  mobileResizeThreshold: number;
  resizeDebounceTime: number;

  // Avatar styling
  avatarPadding: number;
  avatarBorderWidth: number;
  profileBubbleRatio: number;
}
