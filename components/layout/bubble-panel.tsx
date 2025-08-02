"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

// Paleta Neutral de Tailwind en hex
const TAILWIND_NEUTRAL = [
  "#1A1A1A", // neutral-900
  "#333333", // neutral-700
  "#4D4D4D", // neutral-600
  "#CCCCCC", // neutral-300
  "#F5F5F5", // neutral-100
];

type ColorHex = string;

// Clase para representar una burbuja
class Bubble {
  x: number;
  y: number;
  radius: number;
  color: ColorHex;
  isParticle: boolean;
  velocity: { x: number; y: number };
  opacity: number;
  markForRemoval: boolean;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: ColorHex,
    isParticle = false
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.isParticle = isParticle;
    this.velocity = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    };
    this.opacity = 1;
    this.markForRemoval = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = `rgba(100,100,100,${this.opacity})`;
    ctx.stroke();
    ctx.restore();
  }

  update(canvas: HTMLCanvasElement) {
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    const damping = 0.5;
    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
      this.velocity.x *= -damping;
      this.x = Math.min(
        Math.max(this.x, this.radius),
        canvas.width - this.radius
      );
    }
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      this.velocity.y *= -damping;
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
    }
  }

  pop(): Bubble[] {
    this.markForRemoval = true;
    const fragments: Bubble[] = [];
    for (let i = 0; i < 5; i++) {
      fragments.push(
        new Bubble(this.x, this.y, Math.random() * 3 + 1, this.color, true)
      );
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
  const isResizingRef = useRef(false);
  const resizeTimeoutRef = useRef<number | null>(null);
  const [, setTick] = useState(0);

  const respawnDelay = 5000;
  const rateLimitInterval = 1000;
  const autoPopInterval = 10000;
  const mobileBreakpoint = 640;

  // Inicializa burbujas según tamaño (móvil vs desktop)
  const initBubbles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width: w, height: h } = canvas;
    const count = w < mobileBreakpoint ? 8 : 15;
    const minR = w < mobileBreakpoint ? 10 : 25;
    const maxR = w < mobileBreakpoint ? 20 : 50;

    const arr: Bubble[] = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random() * (maxR - minR) + minR;
      const x = Math.random() * (w - 2 * r) + r;
      const y = Math.random() * (h - 2 * r) + r;
      arr.push(new Bubble(x, y, r, getRandomNeutralColor()));
    }
    bubblesRef.current = arr;
    setTick((t) => t + 1);
  }, []);

  // Ajusta canvas al contenedor con debounce para esperar al tamaño final
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    isResizingRef.current = true;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = window.setTimeout(() => {
      initBubbles();
      isResizingRef.current = false;
    }, 300);
  }, [initBubbles]);

  useEffect(() => {
    requestAnimationFrame(handleResize);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [handleResize]);

  // Animación y colisiones
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d")!;
    let frameId: number;

    const animate = () => {
      if (isResizingRef.current || !canvas || !ctx) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubblesRef.current.forEach((b) => b.update(canvas));
      const list = bubblesRef.current.filter((b) => !b.markForRemoval);

      // Colisiones
      for (let i = 0; i < list.length; i++) {
        const b1 = list[i];
        if (b1.isParticle) continue;
        for (let j = i + 1; j < list.length; j++) {
          const b2 = list[j];
          if (b2.isParticle) continue;
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius;
          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const overlap = (minDist - dist) / 2;
            const shiftX = Math.cos(angle) * overlap;
            const shiftY = Math.sin(angle) * overlap;
            b1.x -= shiftX;
            b1.y -= shiftY;
            b2.x += shiftX;
            b2.y += shiftY;
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

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Procesa la cola de respawn a rateLimitInterval
  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      const queue = respawnQueueRef.current;
      if (queue.length && queue[0] <= now) {
        queue.shift(); // tomar un respawn pendiente
        const canvas = canvasRef.current!;
        const w = canvas.width;
        const h = canvas.height;
        const r = Math.random() * 25 + 25;
        const x = Math.random() * (w - 2 * r) + r;
        const y = Math.random() * (h - 2 * r) + r;
        bubblesRef.current.push(new Bubble(x, y, r, getRandomNeutralColor()));
        setTick((t) => t + 1);
      }
    }, rateLimitInterval);
    return () => clearInterval(interval);
  }, []);

  // Auto-pop: cada autoPopInterval explota una burbuja al azar
  useEffect(() => {
    const autoPop = window.setInterval(() => {
      const list = bubblesRef.current.filter((b) => !b.isParticle);
      if (list.length === 0) return;
      const target = list[Math.floor(Math.random() * list.length)];
      const particles = target.pop();
      bubblesRef.current = bubblesRef.current
        .filter((b) => b !== target)
        .concat(particles);
      // encolar respawn
      respawnQueueRef.current.push(Date.now() + respawnDelay);
      setTick((t) => t + 1);
    }, autoPopInterval);
    return () => clearInterval(autoPop);
  }, []);

  // Clic: pop + encolar respawn
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const list = [...bubblesRef.current];
      for (let i = list.length - 1; i >= 0; i--) {
        const b = list[i];
        if (b.isParticle) continue;
        if (Math.hypot(x - b.x, y - b.y) < b.radius) {
          const parts = b.pop();
          list.splice(i, 1, ...parts);
          respawnQueueRef.current.push(Date.now() + respawnDelay);
          break;
        }
      }
      bubblesRef.current = list;
      setTick((t) => t + 1);
    },
    []
  );

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
          className="w-full h-full cursor-pointer block"
        />
      </div>
      <div className="mt-6 text-sm text-gray-500">
        💡 Tip: Haz clic en las burbujas para hacerlas explotar. ¡Muchas se
        autodescubrirán y reaparecerán también!
      </div>
    </section>
  );
};

export default CommunitySection;
