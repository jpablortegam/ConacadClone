"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

// Paleta Neutral de Tailwind en hex
const TAILWIND_NEUTRAL = [
  "#1A1A1A",
  "#333333",
  "#4D4D4D",
  "#CCCCCC",
  "#F5F5F5",
];

type ColorHex = string;

const BUBBLE_CONFIG = {
  respawnDelay: 5000,
  rateLimitInterval: 1000,
  autoPopInterval: 10000,
  mobileBreakpoint: 640,
  desktopBubbleCount: 15,
  mobileBubbleCount: 8,
  desktopMinRadius: 25,
  desktopMaxRadius: 50,
  mobileMinRadius: 10,
  mobileMaxRadius: 20,
  popScaleEffect: 1.2,
  popAnimationDuration: 10,
  particleCount: 5,
  particleMinRadius: 1,
  particleMaxRadius: 4,
  bounceDamping: 0.5,
  friction: 0.99,
};

class Bubble {
  x: number;
  y: number;
  radius: number;
  color: ColorHex;
  isParticle: boolean;
  velocity: { x: number; y: number };
  opacity = 1;
  markForRemoval = false;
  popAnimationProgress = 0;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: ColorHex,
    isParticle = false
  ) {
    this.x = x;
    this.y = y;
    this.radius = Math.max(radius, 1);
    this.color = color;
    this.isParticle = isParticle;
    this.velocity = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    let r = this.radius;
    if (this.popAnimationProgress > 0 && this.popAnimationProgress < 1) {
      r =
        this.radius *
        (1 +
          (BUBBLE_CONFIG.popScaleEffect - 1) *
            Math.sin(this.popAnimationProgress * Math.PI));
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = `rgba(100,100,100,${this.opacity})`;
    ctx.stroke();
    ctx.restore();
  }

  update(canvas: HTMLCanvasElement) {
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
      fragments.push(new Bubble(this.x, this.y, r, this.color, true));
    }
    return fragments;
  }
}

const getRandomNeutralColor = (): ColorHex =>
  TAILWIND_NEUTRAL[
    Math.floor(Math.random() * TAILWIND_NEUTRAL.length)
  ];

const CommunitySection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const respawnQueueRef = useRef<number[]>([]);
  const resizeTimeoutRef = useRef<number | null>(null);

  // Initialize or reflow bubbles based on canvas size
  const initBubbles = useCallback((w: number, h: number) => {
    const isMobile = w < BUBBLE_CONFIG.mobileBreakpoint;
    const count = isMobile
      ? BUBBLE_CONFIG.mobileBubbleCount
      : BUBBLE_CONFIG.desktopBubbleCount;
    const minR = isMobile
      ? BUBBLE_CONFIG.mobileMinRadius
      : BUBBLE_CONFIG.desktopMinRadius;
    const maxR = isMobile
      ? BUBBLE_CONFIG.mobileMaxRadius
      : BUBBLE_CONFIG.desktopMaxRadius;

    const newB: Bubble[] = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random() * (maxR - minR) + minR;
      const x = Math.random() * (w - 2 * r) + r;
      const y = Math.random() * (h - 2 * r) + r;
      newB.push(new Bubble(x, y, r, getRandomNeutralColor()));
    }
    bubblesRef.current = newB;
  }, []);

  // Handle resize: update buffer size, debounce initBubbles
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

    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = window.setTimeout(() => {
      initBubbles(w, h);
    }, 200);
  }, [initBubbles]);

  // Set up resize listener and initial sizing
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

  // Animation loop with collisions
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let rafId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubblesRef.current.forEach((b) => b.update(canvas));
      const list = bubblesRef.current.filter(
        (b) =>
          !b.markForRemoval ||
          (b.popAnimationProgress > 0 && b.popAnimationProgress < 1)
      );

      // collisions
      for (let i = 0; i < list.length; i++) {
        const b1 = list[i];
        if (b1.isParticle) continue;
        for (let j = i + 1; j < list.length; j++) {
          const b2 = list[j];
          if (b2.isParticle) continue;
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minD = b1.radius + b2.radius;
          if (dist < minD) {
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
            b1.velocity.x = b2.velocity.x * 0.8;
            b1.velocity.y = b2.velocity.y * 0.8;
            b2.velocity.x = vx1 * 0.8;
            b2.velocity.y = vy1 * 0.8;
          }
        }
      }

      list.forEach((b) => b.draw(ctx));
      bubblesRef.current = list;

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [handleResize, initBubbles]);

  // Auto-pop interval
  useEffect(() => {
    const id = setInterval(() => {
      const list = bubblesRef.current.filter(
        (b) => !b.isParticle && b.popAnimationProgress === 0
      );
      if (!list.length) return;
      const b = list[Math.floor(Math.random() * list.length)];
      const parts = b.pop();
      bubblesRef.current = bubblesRef.current
        .filter((x) => x !== b)
        .concat(b, ...parts);
      respawnQueueRef.current.push(
        Date.now() + BUBBLE_CONFIG.respawnDelay
      );
    }, BUBBLE_CONFIG.autoPopInterval);
    return () => clearInterval(id);
  }, []);

  // Respawn interval
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const queue = respawnQueueRef.current;
      while (queue.length && queue[0] <= now) {
        queue.shift();
        const canvas = canvasRef.current!;
        const w = canvas.width,
          h = canvas.height;
        const r =
          Math.random() *
            (BUBBLE_CONFIG.desktopMaxRadius -
              BUBBLE_CONFIG.desktopMinRadius) +
          BUBBLE_CONFIG.desktopMinRadius;
        const x = Math.random() * (w - 2 * r) + r;
        const y = Math.random() * (h - 2 * r) + r;
        bubblesRef.current.push(
          new Bubble(x, y, r, getRandomNeutralColor())
        );
      }
    }, BUBBLE_CONFIG.rateLimitInterval);
    return () => clearInterval(id);
  }, []);

  // Click handler with proper scaling
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const b = bubblesRef.current[i];
      if (b.isParticle || b.popAnimationProgress > 0) continue;
      if (Math.hypot(x - b.x, y - b.y) < b.radius) {
        const parts = b.pop();
        bubblesRef.current = bubblesRef.current
          .filter((x) => x !== b)
          .concat(b, ...parts);
        respawnQueueRef.current.push(
          Date.now() + BUBBLE_CONFIG.respawnDelay
        );
        break;
      }
    }
  }, []);

  return (
    <section
      id="comunidad"
      className="bg-background bg-opacity-90 rounded-lg shadow-xl p-8 mb-10 text-center"
    >
      <h2 className="text-4xl font-extrabold mb-6 text-primary">
        Nuestra Vibrante Comunidad
      </h2>
      <p className="text-xl text-primary leading-relaxed mb-8">
        ¡Conoce a los rostros detrás de nuestra plataforma! Haz clic en las
        burbujas para interactuar con ellas.
      </p>
      <div className="relative w-full h-96 bg-200 rounded-lg overflow-hidden border-2 border-gray-200">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          style={{ display: "block" }}
          aria-label="Animación interactiva de burbujas"
        />
      </div>
      <div className="mt-6 text-sm text-gray-500">
        💡 Tip: Haz clic en las burbujas para hacerlas explotar. ¡Algunas
        explotarán solas y reaparecerán!
      </div>
    </section>
  );
};

export default CommunitySection;
