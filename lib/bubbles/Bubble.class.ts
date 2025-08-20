// lib/bubbles/Bubble.class.ts
import type {
  ColorHex,
  UserProfile,
  Velocity,
  CanvasDimensions,
  MousePosition,
} from '@/types/bubbles';
import { BUBBLE_CONFIG } from './bubbleConfig';

export class Bubble {
  x: number;
  y: number;
  radius: number;
  targetRadius: number;
  color: ColorHex;
  isParticle: boolean;
  velocity: Velocity;
  opacity = 0;
  targetOpacity = 1;
  markForRemoval = false;
  popAnimationProgress = 0;
  spawnAnimationProgress = 0;
  age = 0;

  userProfile: UserProfile | null = null;
  imageLoaded = false;
  imageElement: HTMLImageElement | null = null;
  imageLoadAttempted = false; // ✅ Nuevo: Evitar múltiples intentos de carga

  constructor(
    x: number,
    y: number,
    radius: number,
    color: ColorHex,
    isParticle = false,
    userProfile?: UserProfile
  ) {
    this.x = x;
    this.y = y;
    this.radius = isParticle ? radius : 0;
    this.targetRadius = Math.max(radius, 1);
    this.color = color;
    this.isParticle = isParticle;
    this.userProfile = userProfile || null;

    this.velocity = {
      x: (Math.random() - 0.5) * (isParticle ? 4 : 2),
      y: (Math.random() - 0.5) * (isParticle ? 4 : 2),
    };

    if (isParticle) {
      this.opacity = 1;
      this.targetOpacity = 0;
    }

    // ✅ Solo cargar imagen si tenemos perfil y no es partícula
    if (this.userProfile && !isParticle && !this.imageLoadAttempted) {
      this.loadImage();
    }
  }

  /**
   * Carga la imagen del perfil de usuario con manejo de errores mejorado
   */
  private loadImage(): void {
    if (!this.userProfile || this.imageLoadAttempted) return;

    this.imageLoadAttempted = true; // ✅ Marcar como intentado inmediatamente

    this.imageElement = new Image();
    this.imageElement.crossOrigin = 'anonymous';

    // ✅ Timeout para evitar requests colgados
    const imageUrl = this.userProfile.image; // Capture URL before nullifying
    const timeoutId = setTimeout(() => {
      if (this.imageElement && !this.imageLoaded) {
        this.userProfile = null;
        this.imageLoaded = false;
        console.warn(`⚠️ Timeout cargando imagen: ${imageUrl}`);
      }
    }, 5000);

    this.imageElement.onload = () => {
      clearTimeout(timeoutId);
      this.imageLoaded = true;
    };

    this.imageElement.onerror = (error) => {
      clearTimeout(timeoutId);
      console.warn(`⚠️ Error cargando imagen:`, error);
      this.userProfile = null;
      this.imageLoaded = false;
    };

    // ✅ Agregar cache busting y parámetros de optimización
    if (imageUrl.includes('googleusercontent.com')) {
      // Para imágenes de Google, usar parámetros más conservadores
      this.imageElement.src = imageUrl.replace(/=s\d+-c/, '=s64-c');
    } else {
      this.imageElement.src = imageUrl;
    }
  }

  /**
   * Dibuja la burbuja en el canvas
   */
  draw(ctx: CanvasRenderingContext2D, canvas: CanvasDimensions): void {
    const margin = this.radius + BUBBLE_CONFIG.cullDistance;

    // Culling: no dibujar burbujas fuera del viewport
    if (
      this.x < -margin ||
      this.x > canvas.width + margin ||
      this.y < -margin ||
      this.y > canvas.height + margin
    ) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = this.opacity;

    let r = this.radius;

    // Animación de spawn
    if (this.spawnAnimationProgress < 1) {
      const easeOut = 1 - Math.pow(1 - this.spawnAnimationProgress, 3);
      r = this.targetRadius * easeOut;
    }

    // Animación de pop
    if (this.popAnimationProgress > 0 && this.popAnimationProgress < 1) {
      r =
        this.radius *
        (1 + (BUBBLE_CONFIG.popScaleEffect - 1) * Math.sin(this.popAnimationProgress * Math.PI));
    }

    r = Math.max(r, 0.1);

    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);

    // Dibujar avatar o burbuja simple
    if (this.userProfile && this.imageLoaded && this.imageElement) {
      this.drawAvatar(ctx, r);
    } else {
      this.drawSimpleBubble(ctx, r);
    }

    ctx.restore();
  }

  /**
   * Dibuja una burbuja con avatar
   */
  private drawAvatar(ctx: CanvasRenderingContext2D, radius: number): void {
    try {
      // Recortar para el avatar
      ctx.clip();
      ctx.fillStyle = '#f8f9fa';
      ctx.fill();

      // Dibujar imagen solo si está completamente cargada
      if (this.imageElement?.complete && this.imageElement.naturalWidth > 0) {
        const imgRadius = radius - BUBBLE_CONFIG.avatarPadding;
        const imgSize = imgRadius * 2;
        ctx.drawImage(this.imageElement, this.x - imgRadius, this.y - imgRadius, imgSize, imgSize);
      }

      ctx.restore();
      ctx.save();
      ctx.globalAlpha = this.opacity;

      // Borde principal
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.lineWidth = BUBBLE_CONFIG.avatarBorderWidth;
      ctx.strokeStyle = `rgba(59, 130, 246, ${this.opacity * 0.8})`;
      ctx.stroke();

      // Borde interno
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius - BUBBLE_CONFIG.avatarBorderWidth / 2, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.6})`;
      ctx.stroke();
    } catch (error) {
      console.warn('⚠️ Error dibujando avatar:', error);
      // Fallback a burbuja simple
      this.drawSimpleBubble(ctx, radius);
    }
  }

  /**
   * Dibuja una burbuja simple sin avatar
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private drawSimpleBubble(ctx: CanvasRenderingContext2D, radius: number): void {
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = `rgba(100,100,100,${this.opacity})`;
    ctx.stroke();
  }

  /**
   * Actualiza la lógica de la burbuja
   */
  update(canvas: CanvasDimensions, mousePos?: MousePosition): void {
    this.age++;

    // Animación de spawn
    if (this.spawnAnimationProgress < 1) {
      this.spawnAnimationProgress += 1 / BUBBLE_CONFIG.spawnAnimationDuration;
      this.radius = this.targetRadius * (1 - Math.pow(1 - this.spawnAnimationProgress, 3));
    }

    // Actualizar opacidad
    if (this.opacity < this.targetOpacity) {
      this.opacity += (this.targetOpacity - this.opacity) * 0.1;
    } else if (this.opacity > this.targetOpacity) {
      this.opacity += (this.targetOpacity - this.opacity) * 0.05;
    }

    // Repulsión del mouse
    if (mousePos && !this.isParticle && this.popAnimationProgress === 0) {
      this.handleMouseRepulsion(mousePos);
    }

    // Aplicar fricción y mover
    this.velocity.x *= BUBBLE_CONFIG.friction;
    this.velocity.y *= BUBBLE_CONFIG.friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Manejo de colisiones con bordes
    this.handleBoundaryCollisions(canvas);

    // Actualizar estado según tipo de burbuja
    if (this.isParticle) {
      this.updateParticle();
    } else if (this.popAnimationProgress > 0) {
      this.updatePopAnimation();
    }
  }

  /**
   * Maneja la repulsión del mouse
   */
  private handleMouseRepulsion(mousePos: MousePosition): void {
    const dx = this.x - mousePos.x;
    const dy = this.y - mousePos.y;
    const distance = Math.hypot(dx, dy);

    if (distance < BUBBLE_CONFIG.maxRepelDistance && distance > 0) {
      const force = (1 - distance / BUBBLE_CONFIG.maxRepelDistance) * BUBBLE_CONFIG.mouseRepelForce;
      const repelX = (dx / distance) * force;
      const repelY = (dy / distance) * force;

      this.velocity.x += repelX;
      this.velocity.y += repelY;
    }
  }

  /**
   * Maneja las colisiones con los bordes del canvas
   */
  private handleBoundaryCollisions(canvas: CanvasDimensions): void {
    const d = BUBBLE_CONFIG.bounceDamping;

    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
      this.velocity.x *= -d;
      this.x = Math.min(Math.max(this.x, this.radius), canvas.width - this.radius);
      this.velocity.y += (Math.random() - 0.5) * 0.5;
    }

    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      this.velocity.y *= -d;
      this.y = Math.min(Math.max(this.y, this.radius), canvas.height - this.radius);
      this.velocity.x += (Math.random() - 0.5) * 0.5;
    }
  }

  /**
   * Actualiza el estado de las partículas
   */
  private updateParticle(): void {
    this.opacity -= 0.02;
    this.radius -= 0.1;
    if (this.opacity <= 0 || this.radius <= 0.1) {
      this.markForRemoval = true;
    }
  }

  /**
   * Actualiza la animación de explosión
   */
  private updatePopAnimation(): void {
    this.popAnimationProgress += 1 / BUBBLE_CONFIG.popAnimationDuration;
    if (this.popAnimationProgress >= 1) {
      this.markForRemoval = true;
    }
  }

  /**
   * Hace explotar la burbuja creando partículas
   */
  pop(): Bubble[] {
    if (!this.isParticle) {
      this.popAnimationProgress = 0.01;
    }

    const fragments: Bubble[] = [];
    for (let i = 0; i < BUBBLE_CONFIG.particleCount; i++) {
      const r =
        Math.random() * (BUBBLE_CONFIG.particleMaxRadius - BUBBLE_CONFIG.particleMinRadius) +
        BUBBLE_CONFIG.particleMinRadius;
      const validRadius = Math.max(r, 0.5);
      fragments.push(new Bubble(this.x, this.y, validRadius, this.color, true));
    }

    return fragments;
  }
}
