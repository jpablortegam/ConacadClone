"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

// Colores que se adaptan al tema usando CSS variables
const THEME_COLORS = {
  light: [
    "oklch(0.18 0 0)",     // Muy oscuro
    "oklch(0.32 0 0)",     // Oscuro
    "oklch(0.56 0 0)",     // Medio
    "oklch(0.72 0 0)",     // Claro
    "oklch(0.92 0 0)",     // Muy claro
  ],
  dark: [
    "oklch(0.92 0 0)",     // Muy claro (invertido para dark)
    "oklch(0.72 0 0)",     // Claro
    "oklch(0.56 0 0)",     // Medio
    "oklch(0.44 0 0)",     // Oscuro
    "oklch(0.26 0 0)",     // Muy oscuro
  ]
};

type ColorHex = string;

const BUBBLE_CONFIG = {
  respawnDelay: 4000,
  rateLimitInterval: 1000,
  autoPopInterval: 12000,
  mobileBreakpoint: 640,
  // Incrementamos las cantidades para más burbujas
  desktopBubbleCount: 25,
  mobileBubbleCount: 15,
  // Ajustamos tamaños pensando en fotos de estudiantes
  desktopMinRadius: 35,
  desktopMaxRadius: 65,
  mobileMinRadius: 20,
  mobileMaxRadius: 35,
  popScaleEffect: 1.3,
  popAnimationDuration: 15,
  // Animación de spawn suave
  spawnAnimationDuration: 30,
  spawnScaleStart: 0.1,
  particleCount: 6,
  particleMinRadius: 2,
  particleMaxRadius: 5,
  bounceDamping: 0.6,
  friction: 0.995,
  // Configuración para manejar cambios de viewport en móviles
  mobileResizeThreshold: 100,
  resizeDebounceTime: 300,
};

class Bubble {
  x: number;
  y: number;
  radius: number;
  targetRadius: number;
  color: ColorHex;
  isParticle: boolean;
  velocity: { x: number; y: number };
  opacity = 1;
  markForRemoval = false;
  popAnimationProgress = 0;
  spawnAnimationProgress = 0;
  isSpawning = false;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: ColorHex,
    isParticle = false,
    isSpawning = false
  ) {
    this.x = x;
    this.y = y;
    this.targetRadius = Math.max(radius, 1);
    this.radius = isSpawning ? this.targetRadius * BUBBLE_CONFIG.spawnScaleStart : this.targetRadius;
    this.color = color;
    this.isParticle = isParticle;
    this.isSpawning = isSpawning;
    this.velocity = {
      x: (Math.random() - 0.5) * (isParticle ? 4 : 1.5),
      y: (Math.random() - 0.5) * (isParticle ? 4 : 1.5),
    };
    
    if (isSpawning) {
      this.spawnAnimationProgress = 0.01;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    let r = this.radius;
    
    // Aplicar animación de pop
    if (this.popAnimationProgress > 0 && this.popAnimationProgress < 1) {
      const popScale = 1 + (BUBBLE_CONFIG.popScaleEffect - 1) * 
        Math.sin(this.popAnimationProgress * Math.PI);
      r = this.radius * popScale;
    }

    const theme = getCurrentTheme();

    // Sombra adaptativa según el tema
    ctx.shadowBlur = this.isParticle ? 6 : 12;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
    
    if (theme === 'dark') {
      ctx.shadowColor = `rgba(0, 0, 0, ${0.7 * this.opacity})`;
    } else {
      ctx.shadowColor = `rgba(0, 0, 0, ${0.4 * this.opacity})`;
    }

    // Dibujar la burbuja principal
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Quitar sombra para el borde
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Borde adaptativo según el tema
    ctx.lineWidth = this.isParticle ? 1 : 2.5;
    if (theme === 'dark') {
      ctx.strokeStyle = `oklch(0.44 0 0 / ${this.opacity * 0.9})`;
    } else {
      ctx.strokeStyle = `oklch(0.72 0 0 / ${this.opacity * 0.7})`;
    }
    ctx.stroke();

    // Efecto de brillo interior mejorado
    if (theme === 'dark' && !this.isParticle) {
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = this.opacity * 0.4;
      
      const gradient = ctx.createRadialGradient(
        this.x - r * 0.4, this.y - r * 0.4, 0,
        this.x, this.y, r
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();
  }

  update(canvas: HTMLCanvasElement) {
    // Animación de spawn suave
    if (this.isSpawning && this.spawnAnimationProgress < 1) {
      this.spawnAnimationProgress += 1 / BUBBLE_CONFIG.spawnAnimationDuration;
      
      // Usar easing suave para la animación de spawn
      const easeProgress = this.easeOutBack(this.spawnAnimationProgress);
      this.radius = this.targetRadius * (
        BUBBLE_CONFIG.spawnScaleStart + 
        (1 - BUBBLE_CONFIG.spawnScaleStart) * easeProgress
      );
      
      if (this.spawnAnimationProgress >= 1) {
        this.isSpawning = false;
        this.radius = this.targetRadius;
      }
    }

    // Aplicar física solo si no está en animación de spawn inicial
    if (!this.isSpawning || this.spawnAnimationProgress > 0.3) {
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
      }
      if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
        this.velocity.y *= -d;
        this.y = Math.min(
          Math.max(this.y, this.radius),
          canvas.height - this.radius
        );
      }
    }

    // Manejar partículas
    if (this.isParticle) {
      this.opacity -= 0.025;
      this.radius -= 0.15;
      if (this.opacity <= 0 || this.radius <= 0) {
        this.markForRemoval = true;
      }
    } 
    // Manejar animación de pop
    else if (this.popAnimationProgress > 0) {
      this.popAnimationProgress += 1 / BUBBLE_CONFIG.popAnimationDuration;
      if (this.popAnimationProgress >= 1) {
        this.markForRemoval = true;
      }
    }
  }

  // Función de easing para animación suave
  private easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  pop(): Bubble[] {
    if (!this.isParticle) {
      this.popAnimationProgress = 0.01;
    }
    const fragments: Bubble[] = [];
    for (let i = 0; i < BUBBLE_CONFIG.particleCount; i++) {
      const r = Math.random() * (BUBBLE_CONFIG.particleMaxRadius - BUBBLE_CONFIG.particleMinRadius) + BUBBLE_CONFIG.particleMinRadius;
      const fragment = new Bubble(this.x, this.y, r, this.color, true);
      // Darles más velocidad inicial a las partículas
      fragment.velocity = {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8,
      };
      fragments.push(fragment);
    }
    return fragments;
  }
}

// Funciones utilitarias optimizadas
const getCurrentTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

const getRandomThemeColor = (): ColorHex => {
  const theme = getCurrentTheme();
  const colors = THEME_COLORS[theme];
  return colors[Math.floor(Math.random() * colors.length)];
};

const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const CommunitySection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const respawnQueueRef = useRef<number[]>([]);
  const resizeTimeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const lastDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const isMobileRef = useRef<boolean>(false);
  const [, forceUpdate] = useState({});

  // Detectar si es móvil al montar
  useEffect(() => {
    isMobileRef.current = isMobileDevice();
  }, []);

  // Listener optimizado para cambios de tema
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      const themeChanged = mutations.some(mutation => 
        mutation.type === 'attributes' && 
        mutation.attributeName === 'class' &&
        mutation.target === document.documentElement
      );
      
      if (themeChanged) {
        forceUpdate({});
        // Actualizar colores de burbujas existentes de forma más eficiente
        bubblesRef.current.forEach(bubble => {
          if (!bubble.isParticle) {
            bubble.color = getRandomThemeColor();
          }
        });
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Función optimizada para crear burbujas con mejor distribución
  const createBubble = useCallback((w: number, h: number, isSpawning = false): Bubble => {
    const isMobile = w < BUBBLE_CONFIG.mobileBreakpoint;
    const minR = isMobile ? BUBBLE_CONFIG.mobileMinRadius : BUBBLE_CONFIG.desktopMinRadius;
    const maxR = isMobile ? BUBBLE_CONFIG.mobileMaxRadius : BUBBLE_CONFIG.desktopMaxRadius;
    
    const r = Math.random() * (maxR - minR) + minR;
    
    // Mejor distribución espacial evitando bordes
    const margin = r + 10;
    const x = Math.random() * (w - 2 * margin) + margin;
    const y = Math.random() * (h - 2 * margin) + margin;
    
    return new Bubble(x, y, r, getRandomThemeColor(), false, isSpawning);
  }, []);

  // Initialize bubbles with better spacing
  const initBubbles = useCallback((w: number, h: number) => {
    const isMobile = w < BUBBLE_CONFIG.mobileBreakpoint;
    const count = isMobile ? BUBBLE_CONFIG.mobileBubbleCount : BUBBLE_CONFIG.desktopBubbleCount;

    const newBubbles: Bubble[] = [];
    const maxAttempts = count * 3; // Evitar bucles infinitos
    
    for (let i = 0; i < count && newBubbles.length < count; i++) {
      let attempts = 0;
      let bubble: Bubble;
      let validPosition = false;
      
      do {
        bubble = createBubble(w, h);
        validPosition = true;
        
        // Verificar que no se superponga con burbujas existentes
        for (const existing of newBubbles) {
          const distance = Math.hypot(bubble.x - existing.x, bubble.y - existing.y);
          const minDistance = bubble.radius + existing.radius + 5; // Pequeño margen
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }
        
        attempts++;
      } while (!validPosition && attempts < maxAttempts);
      
      if (validPosition) {
        newBubbles.push(bubble);
      }
    }
    
    bubblesRef.current = newBubbles;
  }, [createBubble]);

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

  // Loop de animación optimizado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fondo sutil mejorado
      const theme = getCurrentTheme();
      ctx.fillStyle = theme === 'dark' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Actualizar burbujas
      bubblesRef.current.forEach(bubble => bubble.update(canvas));
      
      // Filtrar burbujas que deben ser removidas
      const activeBubbles = bubblesRef.current.filter(bubble => 
        !bubble.markForRemoval || 
        (bubble.popAnimationProgress > 0 && bubble.popAnimationProgress < 1)
      );

      // Detección de colisiones optimizada
      const nonParticleBubbles = activeBubbles.filter(b => !b.isParticle);
      for (let i = 0; i < nonParticleBubbles.length; i++) {
        const b1 = nonParticleBubbles[i];
        for (let j = i + 1; j < nonParticleBubbles.length; j++) {
          const b2 = nonParticleBubbles[j];
          
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius;
          
          if (dist < minDist && dist > 0) {
            const angle = Math.atan2(dy, dx);
            const overlap = (minDist - dist) / 2;
            const moveX = Math.cos(angle) * overlap;
            const moveY = Math.sin(angle) * overlap;
            
            b1.x -= moveX;
            b1.y -= moveY;
            b2.x += moveX;
            b2.y += moveY;
            
            // Intercambio de velocidades con amortiguación
            const dampening = 0.85;
            const vx1 = b1.velocity.x;
            const vy1 = b1.velocity.y;
            b1.velocity.x = b2.velocity.x * dampening;
            b1.velocity.y = b2.velocity.y * dampening;
            b2.velocity.x = vx1 * dampening;
            b2.velocity.y = vy1 * dampening;
          }
        }
      }

      // Dibujar todas las burbujas
      activeBubbles.forEach(bubble => bubble.draw(ctx));
      bubblesRef.current = activeBubbles;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Auto-pop interval optimizado
  useEffect(() => {
    const autoPopInterval = setInterval(() => {
      const poppableBubbles = bubblesRef.current.filter(
        b => !b.isParticle && b.popAnimationProgress === 0 && !b.isSpawning
      );
      
      if (poppableBubbles.length === 0) return;
      
      const bubble = poppableBubbles[Math.floor(Math.random() * poppableBubbles.length)];
      const particles = bubble.pop();
      
      bubblesRef.current = bubblesRef.current
        .filter(b => b !== bubble)
        .concat(bubble, ...particles);
      
      respawnQueueRef.current.push(Date.now() + BUBBLE_CONFIG.respawnDelay);
    }, BUBBLE_CONFIG.autoPopInterval);
    
    return () => clearInterval(autoPopInterval);
  }, []);

  // Respawn interval con animación suave
  useEffect(() => {
    const respawnInterval = setInterval(() => {
      const now = Date.now();
      const queue = respawnQueueRef.current;
      
      while (queue.length && queue[0] <= now) {
        queue.shift();
        const canvas = canvasRef.current;
        if (!canvas) continue;
        
        const newBubble = createBubble(canvas.width, canvas.height, true);
        bubblesRef.current.push(newBubble);
      }
    }, BUBBLE_CONFIG.rateLimitInterval);
    
    return () => clearInterval(respawnInterval);
  }, [createBubble]);

  // Click handler optimizado
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Buscar la burbuja clickeada (desde atrás hacia adelante para mejor UX)
    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const bubble = bubblesRef.current[i];
      
      if (bubble.isParticle || bubble.popAnimationProgress > 0) continue;
      
      const distance = Math.hypot(x - bubble.x, y - bubble.y);
      if (distance < bubble.radius) {
        const particles = bubble.pop();
        bubblesRef.current = bubblesRef.current
          .filter(b => b !== bubble)
          .concat(bubble, ...particles);
        
        respawnQueueRef.current.push(Date.now() + BUBBLE_CONFIG.respawnDelay);
        break;
      }
    }
  }, []);

  return (
    <section
      id="comunidad"
      className="bg-background bg-opacity-90 rounded-lg shadow-xl p-8 mb-10 text-center"
    >
      <h2 className="text-3xl font-extrabold mb-6 text-primary">
        🎓 Nuestra Comunidad Estudiantil
      </h2>
      <div className="relative w-full h-96 bg-200 rounded-lg overflow-hidden border-2 border-gray-200">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          style={{ display: "block", cursor: "pointer" }}
          aria-label="Animación interactiva de burbujas representando estudiantes"
        />
      </div>
      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        💡 <strong>Interactúa:</strong> Haz clic en las burbujas para conocer más sobre nuestros estudiantes. 
        ¡Las burbujas representan a nuestra vibrante comunidad académica!
      </div>
    </section>
  );
};

export default CommunitySection;