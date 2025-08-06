"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";

// Paleta Neutral de Tailwind en hex para burbujas sin imagen
const TAILWIND_NEUTRAL = [
  "#1A1A1A",
  "#333333",
  "#4D4D4D",
  "#CCCCCC",
  "#F5F5F5",
];

type ColorHex = string;
type UserProfile = {
  name: string;
  image: string;
};

const BUBBLE_CONFIG = {
  respawnDelay: 3000,
  rateLimitInterval: 500,
  autoPopInterval: 8000,
  mobileBreakpoint: 640,
  desktopBubbleCount: 20,
  mobileBubbleCount: 12,
  desktopMinRadius: 25,
  desktopMaxRadius: 50,
  mobileMinRadius: 10,
  mobileMaxRadius: 20,
  popScaleEffect: 1.2,
  popAnimationDuration: 15,
  particleCount: 4,
  particleMinRadius: 1,
  particleMaxRadius: 4,
  bounceDamping: 0.3,
  friction: 0.995,
  mobileResizeThreshold: 100,
  resizeDebounceTime: 200,
  spawnAnimationDuration: 30,
  maxParticles: 50,
  cullDistance: 100,
  mouseRepelRadius: 0,
  mouseRepelForce: 0,
  maxRepelDistance: 0,
  // Configuraciones para avatares
  avatarPadding: 1, // Padding interno para las imágenes
  avatarBorderWidth: 3, // Grosor del borde
  profileBubbleRatio: 0.7, // Porcentaje de burbujas que serán perfiles
} as const;

class Bubble {
  x: number;
  y: number;
  radius: number;
  targetRadius: number;
  color: ColorHex;
  isParticle: boolean;
  velocity: { x: number; y: number };
  opacity = 0;
  targetOpacity = 1;
  markForRemoval = false;
  popAnimationProgress = 0;
  spawnAnimationProgress = 0;
  age = 0;

  // Propiedades para avatares
  userProfile: UserProfile | null = null;
  imageLoaded = false;
  imageElement: HTMLImageElement | null = null;

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

    // Cargar imagen si es un perfil
    if (this.userProfile && !isParticle) {
      this.loadImage();
    }
  }

  private loadImage() {
    if (!this.userProfile) return;

    this.imageElement = new Image();
    this.imageElement.crossOrigin = "anonymous";
    this.imageElement.onload = () => {
      this.imageLoaded = true;
    };
    this.imageElement.onerror = () => {
      // Si falla la carga, usar color sólido
      this.userProfile = null;
      this.imageLoaded = false;
    };
    this.imageElement.src = this.userProfile.image;
  }

  draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const margin = this.radius + BUBBLE_CONFIG.cullDistance;
    if (this.x < -margin ||
      this.x > canvas.width + margin ||
      this.y < -margin ||
      this.y > canvas.height + margin) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = this.opacity;

    let r = this.radius;

    if (this.spawnAnimationProgress < 1) {
      const easeOut = 1 - Math.pow(1 - this.spawnAnimationProgress, 3);
      r = this.targetRadius * easeOut;
    }

    if (this.popAnimationProgress > 0 && this.popAnimationProgress < 1) {
      r = this.radius * (1 + (BUBBLE_CONFIG.popScaleEffect - 1) *
        Math.sin(this.popAnimationProgress * Math.PI));
    }

    // Dibujar la burbuja
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);

    if (this.userProfile && this.imageLoaded && this.imageElement) {
      // Crear un clipping path circular para la imagen
      ctx.clip();

      // Dibujar fondo blanco/suave para la imagen
      ctx.fillStyle = "#f8f9fa";
      ctx.fill();

      // Calcular dimensiones para la imagen
      const imgRadius = r - BUBBLE_CONFIG.avatarPadding;
      const imgSize = imgRadius * 2;

      // Dibujar la imagen centrada y recortada en círculo
      ctx.drawImage(
        this.imageElement,
        this.x - imgRadius,
        this.y - imgRadius,
        imgSize,
        imgSize
      );

      // Restaurar el path para el borde
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = this.opacity;

      // Dibujar borde más prominente para perfiles
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.lineWidth = BUBBLE_CONFIG.avatarBorderWidth;
      ctx.strokeStyle = `rgba(59, 130, 246, ${this.opacity * 0.8})`; // Azul para perfiles
      ctx.stroke();

      // Borde interno sutil
      ctx.beginPath();
      ctx.arc(this.x, this.y, r - BUBBLE_CONFIG.avatarBorderWidth / 2, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.6})`;
      ctx.stroke();
    } else {
      // Burbuja normal con color sólido
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(100,100,100,${this.opacity})`;
      ctx.stroke();
    }

    ctx.restore();
  }

  update(canvas: HTMLCanvasElement, mousePos?: { x: number; y: number }) {
    this.age++;

    if (this.spawnAnimationProgress < 1) {
      this.spawnAnimationProgress += 1 / BUBBLE_CONFIG.spawnAnimationDuration;
      this.radius = this.targetRadius *
        (1 - Math.pow(1 - this.spawnAnimationProgress, 3));
    }

    if (this.opacity < this.targetOpacity) {
      this.opacity += (this.targetOpacity - this.opacity) * 0.1;
    } else if (this.opacity > this.targetOpacity) {
      this.opacity += (this.targetOpacity - this.opacity) * 0.05;
    }

    if (mousePos && !this.isParticle && this.popAnimationProgress === 0) {
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

    this.velocity.x *= BUBBLE_CONFIG.friction;
    this.velocity.y *= BUBBLE_CONFIG.friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    const d = BUBBLE_CONFIG.bounceDamping;
    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
      this.velocity.x *= -d;
      this.x = Math.min(
        Math.max(this.x, this.radius),
        canvas.width - this.radius
      );
      this.velocity.y += (Math.random() - 0.5) * 0.5;
    }
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      this.velocity.y *= -d;
      this.y = Math.min(
        Math.max(this.y, this.radius),
        canvas.height - this.radius
      );
      this.velocity.x += (Math.random() - 0.5) * 0.5;
    }

    if (this.isParticle) {
      this.opacity -= 0.02;
      this.radius -= 0.1;
      if (this.opacity <= 0 || this.radius <= 0) {
        this.markForRemoval = true;
      }
    } else if (this.popAnimationProgress > 0) {
      this.popAnimationProgress += 1 / BUBBLE_CONFIG.popAnimationDuration;
      if (this.popAnimationProgress >= 1) {
        this.markForRemoval = true;
      }
    }
  }

  pop(): Bubble[] {
    if (!this.isParticle) {
      this.popAnimationProgress = 0.01;
    }
    const fragments: Bubble[] = [];
    for (let i = 0; i < BUBBLE_CONFIG.particleCount; i++) {
      const r =
        Math.random() *
        (BUBBLE_CONFIG.particleMaxRadius -
          BUBBLE_CONFIG.particleMinRadius) +
        BUBBLE_CONFIG.particleMinRadius;
      // Las partículas usan el color de la burbuja original
      fragments.push(new Bubble(this.x, this.y, r, this.color, true));
    }
    return fragments;
  }
}

const colorPool = TAILWIND_NEUTRAL.concat(TAILWIND_NEUTRAL, TAILWIND_NEUTRAL);
let colorIndex = 0;

const getRandomNeutralColor = (): ColorHex => {
  const color = colorPool[colorIndex % colorPool.length];
  colorIndex++;
  return color;
};

const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// ✅ INTERFAZ CORREGIDA - Recibe los datos, no la función
interface CommunitySeccionProps {
  profilePictures?: UserProfile[]; // Array de perfiles, no función
}

const CommunitySection: React.FC<CommunitySeccionProps> = ({
  profilePictures = [] // Default a array vacío
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const respawnQueueRef = useRef<number[]>([]);
  const resizeTimeoutRef = useRef<number | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const mousePositionRef = useRef<{ x: number; y: number } | null>(null);

  // ✅ Estado simplificado - usar directamente los props
  const [userProfiles] = useState<UserProfile[]>(profilePictures);
  const usedProfilesRef = useRef<Set<number>>(new Set());

  const lastDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const isMobileRef = useRef<boolean>(false);
  const spawnCounterRef = useRef<number>(0);

  useEffect(() => {
    isMobileRef.current = isMobileDevice();
  }, []);

  // ✅ Actualizar perfiles cuando cambian los props
  useEffect(() => {
    if (profilePictures && profilePictures.length > 0) {
      // Si hay nuevos perfiles, reiniciar el conjunto de perfiles usados
      usedProfilesRef.current.clear();
      console.log(`✅ Cargados ${profilePictures.length} perfiles para burbujas`);
    }
  }, [profilePictures]);

  // Función para obtener un perfil aleatorio no usado
  const getRandomProfile = useCallback((): UserProfile | null => {
    if (userProfiles.length === 0) return null;

    // Si ya usamos todos los perfiles, reiniciar
    if (usedProfilesRef.current.size >= userProfiles.length) {
      usedProfilesRef.current.clear();
    }

    // Filtrar perfiles no usados
    const availableProfiles = userProfiles.filter((_, index) =>
      !usedProfilesRef.current.has(index)
    );

    if (availableProfiles.length === 0) return null;

    const randomProfile = availableProfiles[Math.floor(Math.random() * availableProfiles.length)];
    const originalIndex = userProfiles.findIndex(p => p === randomProfile);
    usedProfilesRef.current.add(originalIndex);

    return randomProfile;
  }, [userProfiles]);

  const createBubbleProgressively = useCallback((w: number, h: number) => {
    const isMobile = w < BUBBLE_CONFIG.mobileBreakpoint;
    const minR = isMobile ? BUBBLE_CONFIG.mobileMinRadius : BUBBLE_CONFIG.desktopMinRadius;
    const maxR = isMobile ? BUBBLE_CONFIG.mobileMaxRadius : BUBBLE_CONFIG.desktopMaxRadius;

    const r = Math.random() * (maxR - minR) + minR;
    const x = Math.random() * (w - 2 * maxR) + maxR;
    const y = Math.random() * (h - 2 * maxR) + maxR;

    // Decidir si será un perfil de usuario o burbuja normal
    const shouldBeProfile = userProfiles.length > 0 && Math.random() < BUBBLE_CONFIG.profileBubbleRatio;
    const profile = shouldBeProfile ? getRandomProfile() : null;

    const bubble = new Bubble(x, y, r, getRandomNeutralColor(), false, profile || undefined);
    bubblesRef.current.push(bubble);
  }, [getRandomProfile, userProfiles.length]);

  const initBubbles = useCallback((w: number, h: number) => {
    const isMobile = w < BUBBLE_CONFIG.mobileBreakpoint;
    const count = isMobile ? BUBBLE_CONFIG.mobileBubbleCount : BUBBLE_CONFIG.desktopBubbleCount;

    bubblesRef.current = [];
    spawnCounterRef.current = 0;
    usedProfilesRef.current.clear();

    const spawnInterval = setInterval(() => {
      if (spawnCounterRef.current < count) {
        createBubbleProgressively(w, h);
        spawnCounterRef.current++;
      } else {
        clearInterval(spawnInterval);
      }
    }, 150);

  }, [createBubbleProgressively]);

  const isSignificantResize = useCallback((newW: number, newH: number): boolean => {
    if (!lastDimensionsRef.current) return true;

    const { width: oldW, height: oldH } = lastDimensionsRef.current;
    const widthChange = Math.abs(newW - oldW);
    const heightChange = Math.abs(newH - oldH);

    if (isMobileRef.current) {
      return widthChange > BUBBLE_CONFIG.mobileResizeThreshold ||
        heightChange > BUBBLE_CONFIG.mobileResizeThreshold;
    }

    return widthChange > 10 || heightChange > 10;
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight;

    canvas.width = w;
    canvas.height = h;
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    if (isSignificantResize(w, h)) {
      lastDimensionsRef.current = { width: w, height: h };

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        initBubbles(w, h);
      }, BUBBLE_CONFIG.resizeDebounceTime);
    }
  }, [initBubbles, isSignificantResize]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const activeBubbles: Bubble[] = [];
      let particleCount = 0;

      for (const bubble of bubblesRef.current) {
        bubble.update(canvas, mousePositionRef.current || undefined);

        if (bubble.markForRemoval) {
          continue;
        }

        if (bubble.isParticle) {
          particleCount++;
          if (particleCount <= BUBBLE_CONFIG.maxParticles) {
            activeBubbles.push(bubble);
          }
        } else {
          activeBubbles.push(bubble);
        }
      }

      bubblesRef.current = activeBubbles;

      const normalBubbles = activeBubbles.filter(b => !b.isParticle);
      for (let i = 0; i < normalBubbles.length; i++) {
        const b1 = normalBubbles[i];
        for (let j = i + 1; j < normalBubbles.length; j++) {
          const b2 = normalBubbles[j];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minD = b1.radius + b2.radius;

          if (dist < minD && dist > 0) {
            const angle = Math.atan2(dy, dx);
            const overlap = (minD - dist) / 2;
            const sx = Math.cos(angle) * overlap;
            const sy = Math.sin(angle) * overlap;

            b1.x -= sx;
            b1.y -= sy;
            b2.x += sx;
            b2.y += sy;

            const vx1 = b1.velocity.x;
            const vy1 = b1.velocity.y;
            b1.velocity.x = b2.velocity.x * 0.9;
            b1.velocity.y = b2.velocity.y * 0.9;
            b2.velocity.x = vx1 * 0.9;
            b2.velocity.y = vy1 * 0.9;
          }
        }
      }

      activeBubbles.forEach(bubble => bubble.draw(ctx, canvas));

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const poppableBubbles = bubblesRef.current.filter(
        b => !b.isParticle && b.popAnimationProgress === 0 && b.spawnAnimationProgress >= 1
      );

      if (!poppableBubbles.length) return;

      const bubble = poppableBubbles[Math.floor(Math.random() * poppableBubbles.length)];
      const particles = bubble.pop();

      bubblesRef.current = bubblesRef.current
        .filter(x => x !== bubble)
        .concat(bubble, ...particles);

      respawnQueueRef.current.push(Date.now() + BUBBLE_CONFIG.respawnDelay);
    }, BUBBLE_CONFIG.autoPopInterval);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const queue = respawnQueueRef.current;

      while (queue.length && queue[0] <= now) {
        queue.shift();
        const canvas = canvasRef.current!;
        createBubbleProgressively(canvas.width, canvas.height);
      }
    }, BUBBLE_CONFIG.rateLimitInterval);

    return () => clearInterval(id);
  }, [createBubbleProgressively]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    mousePositionRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mousePositionRef.current = null;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    let closestBubble: Bubble | null = null;
    let closestDistance = Infinity;

    for (const bubble of bubblesRef.current) {
      if (bubble.isParticle || bubble.popAnimationProgress > 0) continue;

      const distance = Math.hypot(x - bubble.x, y - bubble.y);
      if (distance < bubble.radius && distance < closestDistance) {
        closestBubble = bubble;
        closestDistance = distance;
      }
    }

    if (closestBubble) {
      const particles = closestBubble.pop();
      bubblesRef.current = bubblesRef.current
        .filter(x => x !== closestBubble)
        .concat(closestBubble, ...particles);

      respawnQueueRef.current.push(Date.now() + BUBBLE_CONFIG.respawnDelay);
    }
  }, []);

  return (
    <section
      id="comunidad"
      className="bg-background bg-opacity-90 rounded-lg shadow-xl p-8 mb-10 text-center"
    >
      <h2 className="text-4xl font-extrabold mb-6 text-primary">
        Nuestra Comunidad
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        {userProfiles.length > 0
          ? `${userProfiles.length} miembros activos • Haz clic en las burbujas para interactuar`
          : "Cargando comunidad..."
        }
      </p>
      <div className="relative w-full h-96 bg-200 rounded-lg overflow-hidden border-2 border-gray-200">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ display: "block" }}
          aria-label="Animación interactiva de burbujas con avatares de usuarios - Las burbujas se alejan del cursor y puedes hacer clic para explotarlas"
        />
      </div>
    </section>
  );
};

export default CommunitySection;