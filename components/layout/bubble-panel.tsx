"use client";

import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";

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

type ApiAvatar = {
  name?: string;
  image: string;
};

const BUBBLE_CONFIG = {
  respawnDelay: 3000,
  rateLimitInterval: 500,
  autoPopInterval: 8000,
  mobileBreakpoint: 640,
  desktopBubbleCount: 20,
  mobileBubbleCount: 15,
  desktopMinRadius: 25,
  desktopMaxRadius: 50,
  mobileMinRadius: 20,
  mobileMaxRadius: 35,
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
  avatarPadding: 1,
  avatarBorderWidth: 3,
  profileBubbleRatio: 0.7,
} as const;

// Hook personalizado para cargar usuarios de forma no bloqueante
const useUserProfiles = () => {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchUsers = async () => {
      try {
        // Delay inicial para no bloquear el render principal
        timeoutId = setTimeout(async () => {
          if (!mounted) return;

          try {
            const response = await fetch('/api/avatars?limit=25&size=medium');

            if (!response.ok) {
              throw new Error('Failed to fetch user profiles');
            }

            const data = await response.json();

            if (!mounted) return;

            // Transformar los datos al formato esperado
            const profiles: UserProfile[] = data.avatars?.map((avatar: ApiAvatar) => ({
              name: avatar.name || 'Usuario',
              image: avatar.image
            })) || [];

            setUserProfiles(profiles);
            console.log(`✅ Cargados ${profiles.length} perfiles desde la API`);
          } catch (fetchError) {
            if (mounted) {
              console.warn('⚠️ Error cargando perfiles:', fetchError);
              setError(fetchError instanceof Error ? fetchError.message : 'Error desconocido');
              setUserProfiles([]);
            }
          } finally {
            if (mounted) {
              setIsLoading(false);
            }
          }
        }, 300);
      } catch (err) {
        if (mounted) {
          console.warn('⚠️ Error en setup:', err);
          setError(err instanceof Error ? err.message : 'Error desconocido');
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    // Cleanup function
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Empty dependency array - solo se ejecuta una vez

  return { userProfiles, isLoading, error };
};

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
      this.userProfile = null;
      this.imageLoaded = false;
    };
    this.imageElement.src = this.userProfile.image;
  }

  draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const margin = this.radius + BUBBLE_CONFIG.cullDistance;
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

    if (this.spawnAnimationProgress < 1) {
      const easeOut = 1 - Math.pow(1 - this.spawnAnimationProgress, 3);
      r = this.targetRadius * easeOut;
    }

    if (this.popAnimationProgress > 0 && this.popAnimationProgress < 1) {
      r =
        this.radius *
        (1 +
          (BUBBLE_CONFIG.popScaleEffect - 1) *
          Math.sin(this.popAnimationProgress * Math.PI));
    }

    r = Math.max(r, 0.1);

    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);

    if (this.userProfile && this.imageLoaded && this.imageElement) {
      ctx.clip();
      ctx.fillStyle = "#f8f9fa";
      ctx.fill();
      const imgRadius = r - BUBBLE_CONFIG.avatarPadding;
      const imgSize = imgRadius * 2;
      ctx.drawImage(
        this.imageElement,
        this.x - imgRadius,
        this.y - imgRadius,
        imgSize,
        imgSize
      );
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = this.opacity;

      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.lineWidth = BUBBLE_CONFIG.avatarBorderWidth;
      ctx.strokeStyle = `rgba(59, 130, 246, ${this.opacity * 0.8})`;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        this.x,
        this.y,
        r - BUBBLE_CONFIG.avatarBorderWidth / 2,
        0,
        Math.PI * 2
      );
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.6})`;
      ctx.stroke();
    } else {
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
      this.radius =
        this.targetRadius * (1 - Math.pow(1 - this.spawnAnimationProgress, 3));
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
        const force =
          (1 - distance / BUBBLE_CONFIG.maxRepelDistance) *
          BUBBLE_CONFIG.mouseRepelForce;
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
      if (this.opacity <= 0 || this.radius <= 0.1) {
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
      const validRadius = Math.max(r, 0.5);
      fragments.push(new Bubble(this.x, this.y, validRadius, this.color, true));
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
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= BUBBLE_CONFIG.mobileBreakpoint
  );
};

// Componente de carga skeleton optimizado
const BubblesSkeleton: React.FC = () => (
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

interface CommunitySeccionProps {
  profilePictures?: UserProfile[];
}

const CommunitySection: React.FC<CommunitySeccionProps> = ({
  profilePictures = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const respawnQueueRef = useRef<number[]>([]);
  const resizeTimeoutRef = useRef<number | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const mousePositionRef = useRef<{ x: number; y: number } | null>(null);

  // Hook para cargar usuarios de forma no bloqueante
  const { userProfiles: apiUserProfiles, isLoading, error } = useUserProfiles();

  // Estados locales
  const usedProfilesRef = useRef<Set<number>>(new Set());
  const profileRotationIndexRef = useRef<number>(0);
  const lastDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const isMobileRef = useRef<boolean>(false);
  const spawnCounterRef = useRef<number>(0);

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

  useEffect(() => {
    isMobileRef.current = isMobileDevice();
  }, []);

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

  const getRandomProfile = useCallback((): UserProfile | null => {
    if (userProfiles.length === 0) return null;
    if (userProfiles.length >= 10) {
      const profile =
        userProfiles[profileRotationIndexRef.current % userProfiles.length];
      profileRotationIndexRef.current++;
      if (profileRotationIndexRef.current >= userProfiles.length * 2) {
        profileRotationIndexRef.current = 0;
        console.log(`🔀 Reiniciando rotación de perfiles`);
      }
      return profile;
    } else {
      if (usedProfilesRef.current.size >= userProfiles.length) {
        usedProfilesRef.current.clear();
        console.log(`🔄 Reset: todos los perfiles usados, reiniciando pool`);
      }
      const availableProfiles = userProfiles.filter(
        (_, index) => !usedProfilesRef.current.has(index)
      );
      if (availableProfiles.length === 0) return null;
      const randomProfile =
        availableProfiles[Math.floor(Math.random() * availableProfiles.length)];
      const originalIndex = userProfiles.findIndex((p) => p === randomProfile);
      usedProfilesRef.current.add(originalIndex);
      return randomProfile;
    }
  }, [userProfiles]);

  const createBubbleProgressively = useCallback(
    (w: number, h: number) => {
      const isMobile = w < BUBBLE_CONFIG.mobileBreakpoint;
      const minR = isMobile
        ? BUBBLE_CONFIG.mobileMinRadius
        : BUBBLE_CONFIG.desktopMinRadius;
      const maxR = isMobile
        ? BUBBLE_CONFIG.mobileMaxRadius
        : BUBBLE_CONFIG.desktopMaxRadius;

      const r = Math.max(Math.random() * (maxR - minR) + minR, 1);
      const x = Math.random() * (w - 2 * maxR) + maxR;
      const y = Math.random() * (h - 2 * maxR) + maxR;

      let profile: UserProfile | null = null;
      const shouldBeProfile =
        userProfiles.length > 0 &&
        Math.random() < BUBBLE_CONFIG.profileBubbleRatio;

      if (shouldBeProfile) {
        profile = getRandomProfile();
      }

      const bubble = new Bubble(
        x,
        y,
        r,
        getRandomNeutralColor(),
        false,
        profile || undefined
      );
      bubblesRef.current.push(bubble);
    },
    [getRandomProfile, userProfiles.length]
  );

  const initBubbles = useCallback(
    (w: number, h: number) => {
      const isMobile = w < BUBBLE_CONFIG.mobileBreakpoint;
      const count = isMobile
        ? BUBBLE_CONFIG.mobileBubbleCount
        : BUBBLE_CONFIG.desktopBubbleCount;

      bubblesRef.current = [];
      spawnCounterRef.current = 0;
      usedProfilesRef.current.clear();

      const spawnInterval = setInterval(() => {
        if (spawnCounterRef.current < count) {
          createBubbleProgressively(w, h);
          spawnCounterRef.current++;
        } else {
          clearInterval(spawnInterval);
          console.log(`✅ ${count} burbujas creadas exitosamente`);
        }
      }, 150);
    },
    [createBubbleProgressively]
  );

  const isSignificantResize = useCallback((newW: number, newH: number): boolean => {
    if (!lastDimensionsRef.current) return true;

    const { width: oldW, height: oldH } = lastDimensionsRef.current;
    const widthChange = Math.abs(newW - oldW);
    const heightChange = Math.abs(newH - oldH);

    if (isMobileRef.current) {
      return (
        widthChange > BUBBLE_CONFIG.mobileResizeThreshold ||
        heightChange > BUBBLE_CONFIG.mobileResizeThreshold
      );
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

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d");
    if (ctx && dpr !== 1) {
      ctx.scale(dpr, dpr);
    }

    isMobileRef.current = isMobileDevice();

    if (isSignificantResize(w, h)) {
      lastDimensionsRef.current = { width: w, height: h };

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        if (isReady) {
          initBubbles(w, h);
        }
      }, BUBBLE_CONFIG.resizeDebounceTime);
    }
  }, [initBubbles, isSignificantResize, isReady]);

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

  // Inicializar burbujas solo cuando esté listo
  useEffect(() => {
    if (isReady && canvasRef.current) {
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      if (parent) {
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        initBubbles(w, h);
      }
    }
  }, [isReady, initBubbles]);

  useEffect(() => {
    if (!isReady) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let lastTime = 0;
    const targetFPS = isMobileRef.current ? 45 : 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime < frameInterval) {
        animationIdRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      const activeBubbles: Bubble[] = [];
      let particleCount = 0;

      for (const bubble of bubblesRef.current) {
        bubble.update(
          { width: w, height: h } as HTMLCanvasElement,
          mousePositionRef.current || undefined
        );

        if (bubble.markForRemoval) continue;

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

      const normalBubbles = activeBubbles.filter((b) => !b.isParticle);

      if (normalBubbles.length > 0) {
        const gridSize = isMobileRef.current ? 80 : 100;
        const cols = Math.ceil(w / gridSize);
        const rows = Math.ceil(h / gridSize);
        const grid: Bubble[][] = Array(cols * rows)
          .fill(null)
          .map(() => []);

        for (const bubble of normalBubbles) {
          const col = Math.floor(bubble.x / gridSize);
          const row = Math.floor(bubble.y / gridSize);
          if (col >= 0 && col < cols && row >= 0 && row < rows) {
            grid[row * cols + col].push(bubble);
          }
        }

        const checkedPairs = new Set<string>();

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const cellIndex = row * cols + col;
            const cellBubbles = grid[cellIndex];

            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const newRow = row + dr;
                const newCol = col + dc;

                if (
                  newRow >= 0 &&
                  newRow < rows &&
                  newCol >= 0 &&
                  newCol < cols
                ) {
                  const adjacentIndex = newRow * cols + newCol;
                  const adjacentBubbles = grid[adjacentIndex];

                  for (const b1 of cellBubbles) {
                    for (const b2 of adjacentBubbles) {
                      if (b1 === b2) continue;

                      const pairKey =
                        b1.x < b2.x
                          ? `${b1.x},${b1.y}-${b2.x},${b2.y}`
                          : `${b2.x},${b2.y}-${b1.x},${b1.y}`;
                      if (checkedPairs.has(pairKey)) continue;
                      checkedPairs.add(pairKey);

                      const dx = b2.x - b1.x;
                      const dy = b2.y - b1.y;
                      const dist = Math.hypot(dx, dy);
                      const minD = b1.radius + b2.radius;

                      if (dist < minD && dist > 0.1) {
                        const angle = Math.atan2(dy, dx);
                        const overlap = (minD - dist) / 2;
                        const sx = Math.cos(angle) * overlap;
                        const sy = Math.sin(angle) * overlap;

                        b1.x -= sx;
                        b1.y -= sy;
                        b2.x += sx;
                        b2.y += sy;

                        const damping = isMobileRef.current ? 0.85 : 0.9;
                        const vx1 = b1.velocity.x;
                        const vy1 = b1.velocity.y;

                        b1.velocity.x = b2.velocity.x * damping;
                        b1.velocity.y = b2.velocity.y * damping;
                        b2.velocity.x = vx1 * damping;
                        b2.velocity.y = vy1 * damping;

                        b1.velocity.x += (Math.random() - 0.5) * 0.5;
                        b1.velocity.y += (Math.random() - 0.5) * 0.5;
                        b2.velocity.x += (Math.random() - 0.5) * 0.5;
                        b2.velocity.y += (Math.random() - 0.5) * 0.5;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      activeBubbles.forEach((bubble) =>
        bubble.draw(ctx, { width: w, height: h } as HTMLCanvasElement)
      );

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;

    const id = setInterval(() => {
      const poppableBubbles = bubblesRef.current.filter(
        (b) =>
          !b.isParticle &&
          b.popAnimationProgress === 0 &&
          b.spawnAnimationProgress >= 1
      );

      if (!poppableBubbles.length) return;

      const bubble =
        poppableBubbles[Math.floor(Math.random() * poppableBubbles.length)];
      const particles = bubble.pop();

      bubblesRef.current = bubblesRef.current
        .filter((x) => x !== bubble)
        .concat(bubble, ...particles);

      respawnQueueRef.current.push(Date.now() + BUBBLE_CONFIG.respawnDelay);
    }, BUBBLE_CONFIG.autoPopInterval);

    return () => clearInterval(id);
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;

    const id = setInterval(() => {
      const now = Date.now();
      const queue = respawnQueueRef.current;

      while (queue.length && queue[0] <= now) {
        queue.shift();
        const canvas = canvasRef.current!;
        const dpr = window.devicePixelRatio || 1;
        createBubbleProgressively(canvas.width / dpr, canvas.height / dpr);
      }
    }, BUBBLE_CONFIG.rateLimitInterval);

    return () => clearInterval(id);
  }, [createBubbleProgressively, isReady]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isReady) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    mousePositionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, [isReady]);

  const handleMouseLeave = useCallback(() => {
    mousePositionRef.current = null;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isReady) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
        .filter((x) => x !== closestBubble)
        .concat(closestBubble, ...particles);

      respawnQueueRef.current.push(Date.now() + BUBBLE_CONFIG.respawnDelay);
    }
  }, [isReady]);

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

        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ display: "block" }}
        />
      </div>
    </section>
  );
};

export default CommunitySection;