'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { UserProfile, MousePosition } from '@/types/bubbles';
import {
  Bubble,
  BUBBLE_CONFIG,
  getRandomNeutralColor,
  isMobileDevice,
  isSignificantResize,
  getBubbleSettings,
  getRandomPosition,
  getRandomRadius,
} from '@/lib/bubbles';

interface BubbleCanvasProps {
  userProfiles: UserProfile[];
  isReady: boolean;
}

const BubbleCanvas: React.FC<BubbleCanvasProps> = ({ userProfiles, isReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const respawnQueueRef = useRef<number[]>([]);
  const resizeTimeoutRef = useRef<number | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const mousePositionRef = useRef<MousePosition | null>(null);

  // Estados para el manejo de perfiles
  const usedProfilesRef = useRef<Set<number>>(new Set());
  const profileRotationIndexRef = useRef<number>(0);
  const lastDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const isMobileRef = useRef<boolean>(false);
  const spawnCounterRef = useRef<number>(0);

  // Inicializar detección de móvil
  useEffect(() => {
    isMobileRef.current = isMobileDevice();
  }, []);

  const getRandomProfile = useCallback((): UserProfile | null => {
    if (userProfiles.length === 0) return null;

    if (userProfiles.length >= 10) {
      const profile = userProfiles[profileRotationIndexRef.current % userProfiles.length];
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

      const randomProfile = availableProfiles[Math.floor(Math.random() * availableProfiles.length)];
      const originalIndex = userProfiles.findIndex((p) => p === randomProfile);
      usedProfilesRef.current.add(originalIndex);
      return randomProfile;
    }
  }, [userProfiles]);

  const createBubbleProgressively = useCallback(
    (w: number, h: number) => {
      const isMobile = w < BUBBLE_CONFIG.mobileBreakpoint;
      const settings = getBubbleSettings(isMobile);

      const r = getRandomRadius(settings.minRadius, settings.maxRadius);
      const { x, y } = getRandomPosition(w, h, settings.maxRadius);

      let profile: UserProfile | null = null;
      const shouldBeProfile =
        userProfiles.length > 0 && Math.random() < BUBBLE_CONFIG.profileBubbleRatio;

      if (shouldBeProfile) {
        profile = getRandomProfile();
      }

      const bubble = new Bubble(x, y, r, getRandomNeutralColor(), false, profile || undefined);
      bubblesRef.current.push(bubble);
    },
    [getRandomProfile, userProfiles.length]
  );

  const initBubbles = useCallback(
    (w: number, h: number) => {
      const isMobile = w < BUBBLE_CONFIG.mobileBreakpoint;
      const settings = getBubbleSettings(isMobile);

      bubblesRef.current = [];
      spawnCounterRef.current = 0;
      usedProfilesRef.current.clear();

      const spawnInterval = setInterval(() => {
        if (spawnCounterRef.current < settings.count) {
          createBubbleProgressively(w, h);
          spawnCounterRef.current++;
        } else {
          clearInterval(spawnInterval);
          console.log(`✅ ${settings.count} burbujas creadas exitosamente`);
        }
      }, 150);
    },
    [createBubbleProgressively]
  );

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
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    if (ctx && dpr !== 1) {
      ctx.scale(dpr, dpr);
    }

    isMobileRef.current = isMobileDevice();

    const oldDimensions = lastDimensionsRef.current;
    if (
      !oldDimensions ||
      isSignificantResize(w, h, oldDimensions.width, oldDimensions.height, isMobileRef.current)
    ) {
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
  }, [initBubbles, isReady]);

  // Manejar resize del window
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
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

  // Loop principal de animación
  useEffect(() => {
    if (!isReady) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    let lastTime = 0;
    const settings = getBubbleSettings(isMobileRef.current);
    const frameInterval = 1000 / settings.targetFPS;

    // Resolver colisión entre dos burbujas
    const resolveCollision = (
      b1: Bubble,
      b2: Bubble,
      settings: ReturnType<typeof getBubbleSettings>
    ) => {
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

        const vx1 = b1.velocity.x;
        const vy1 = b1.velocity.y;

        b1.velocity.x = b2.velocity.x * settings.damping;
        b1.velocity.y = b2.velocity.y * settings.damping;
        b2.velocity.x = vx1 * settings.damping;
        b2.velocity.y = vy1 * settings.damping;

        // Agregar algo de ruido para evitar comportamientos repetitivos
        b1.velocity.x += (Math.random() - 0.5) * 0.5;
        b1.velocity.y += (Math.random() - 0.5) * 0.5;
        b2.velocity.x += (Math.random() - 0.5) * 0.5;
        b2.velocity.y += (Math.random() - 0.5) * 0.5;
      }
    };

    // Sistema de colisiones con grid espacial
    const handleCollisions = (
      normalBubbles: Bubble[],
      w: number,
      h: number,
      settings: ReturnType<typeof getBubbleSettings>
    ) => {
      const cols = Math.ceil(w / settings.gridSize);
      const rows = Math.ceil(h / settings.gridSize);
      const grid: Bubble[][] = Array(cols * rows)
        .fill(null)
        .map(() => []);

      // Poblar grid
      for (const bubble of normalBubbles) {
        const col = Math.floor(bubble.x / settings.gridSize);
        const row = Math.floor(bubble.y / settings.gridSize);
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
          grid[row * cols + col].push(bubble);
        }
      }

      const checkedPairs = new Set<string>();

      // Verificar colisiones
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cellIndex = row * cols + col;
          const cellBubbles = grid[cellIndex];

          // Verificar celdas adyacentes
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr;
              const newCol = col + dc;

              if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
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

                    resolveCollision(b1, b2, settings);
                  }
                }
              }
            }
          }
        }
      }
    };

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

      // Actualizar y filtrar burbujas
      for (const bubble of bubblesRef.current) {
        bubble.update({ width: w, height: h }, mousePositionRef.current || undefined);

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

      // Detección de colisiones optimizada con grid espacial
      const normalBubbles = activeBubbles.filter((b) => !b.isParticle);
      if (normalBubbles.length > 0) {
        handleCollisions(normalBubbles, w, h, settings);
      }

      // Dibujar todas las burbujas
      activeBubbles.forEach((bubble) => bubble.draw(ctx, { width: w, height: h }));

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isReady]);

  // Sistema de colisiones con grid espacial
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCollisions = (
    normalBubbles: Bubble[],
    w: number,
    h: number,
    settings: ReturnType<typeof getBubbleSettings>
  ) => {
    const cols = Math.ceil(w / settings.gridSize);
    const rows = Math.ceil(h / settings.gridSize);
    const grid: Bubble[][] = Array(cols * rows)
      .fill(null)
      .map(() => []);

    // Poblar grid
    for (const bubble of normalBubbles) {
      const col = Math.floor(bubble.x / settings.gridSize);
      const row = Math.floor(bubble.y / settings.gridSize);
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        grid[row * cols + col].push(bubble);
      }
    }

    const checkedPairs = new Set<string>();

    // Verificar colisiones
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellIndex = row * cols + col;
        const cellBubbles = grid[cellIndex];

        // Verificar celdas adyacentes
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
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

                  resolveCollision(b1, b2, settings);
                }
              }
            }
          }
        }
      }
    }
  };

  // Resolver colisión entre dos burbujas
  const resolveCollision = (
    b1: Bubble,
    b2: Bubble,
    settings: ReturnType<typeof getBubbleSettings>
  ) => {
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

      const vx1 = b1.velocity.x;
      const vy1 = b1.velocity.y;

      b1.velocity.x = b2.velocity.x * settings.damping;
      b1.velocity.y = b2.velocity.y * settings.damping;
      b2.velocity.x = vx1 * settings.damping;
      b2.velocity.y = vy1 * settings.damping;

      // Agregar algo de ruido para evitar comportamientos repetitivos
      b1.velocity.x += (Math.random() - 0.5) * 0.5;
      b1.velocity.y += (Math.random() - 0.5) * 0.5;
      b2.velocity.x += (Math.random() - 0.5) * 0.5;
      b2.velocity.y += (Math.random() - 0.5) * 0.5;
    }
  };

  // Auto-pop de burbujas
  useEffect(() => {
    if (!isReady) return;

    const id = setInterval(() => {
      const poppableBubbles = bubblesRef.current.filter(
        (b) => !b.isParticle && b.popAnimationProgress === 0 && b.spawnAnimationProgress >= 1
      );

      if (!poppableBubbles.length) return;

      const bubble = poppableBubbles[Math.floor(Math.random() * poppableBubbles.length)];
      const particles = bubble.pop();

      bubblesRef.current = bubblesRef.current
        .filter((x) => x !== bubble)
        .concat(bubble, ...particles);

      respawnQueueRef.current.push(Date.now() + BUBBLE_CONFIG.respawnDelay);
    }, BUBBLE_CONFIG.autoPopInterval);

    return () => clearInterval(id);
  }, [isReady]);

  // Sistema de respawn
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

  // Manejo de eventos del mouse
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isReady) return;

      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();

      mousePositionRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [isReady]
  );

  const handleMouseLeave = useCallback(() => {
    mousePositionRef.current = null;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    },
    [isReady]
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'block' }}
    />
  );
};

export default BubbleCanvas;
