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

// Tipo de color ahora string (hex)
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
    // Movimiento
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Rebote en paredes
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

    // Partículas se desvanecen
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

// Selecciona un color al azar de la paleta
const getRandomNeutralColor = (): ColorHex =>
  TAILWIND_NEUTRAL[
    Math.floor(Math.random() * TAILWIND_NEUTRAL.length)
  ];

const CommunitySection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const isResizingRef = useRef(false);
  const resizeTimeoutRef = useRef<number | null>(null);
  const [, setTick] = useState(0);

  // Inicializa burbujas
  const initBubbles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width: w, height: h } = canvas;
    const arr: Bubble[] = [];
    for (let i = 0; i < 15; i++) {
      const r = Math.random() * 25 + 25;
      const x = Math.random() * (w - 2 * r) + r;
      const y = Math.random() * (h - 2 * r) + r;
      arr.push(new Bubble(x, y, r, getRandomNeutralColor()));
    }
    bubblesRef.current = arr;
    setTick((t) => t + 1);
  }, []);

  // Ajusta canvas al contenedor, con debounce para evitar repaints durante resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    // Indicamos que está en resizing
    isResizingRef.current = true;
    // Actualizamos tamaño inmediatamente
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    // Debounce: solo tras 300ms sin más resize, inicializamos y reanudamos
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = window.setTimeout(() => {
      initBubbles();
      isResizingRef.current = false;
    }, 300);
  }, [initBubbles]);

  useEffect(() => {
    // Inicial y listener
    requestAnimationFrame(handleResize);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [handleResize]);

  // Animación con detección de colisiones
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    let frameId: number;

    const animate = () => {
      // Mientras esté en resize, no pintamos nada
      if (isResizingRef.current || !canvas || !ctx) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Actualiza posición y filtra partículas muertas
      bubblesRef.current.forEach((b) => b.update(canvas));
      const list = bubblesRef.current.filter((b) => !b.markForRemoval);

      // Colisiones entre burbujas no-partícula
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
            // Separación y rebote
            const angle = Math.atan2(dy, dx);
            const overlap = (minDist - dist) / 2;
            const shiftX = Math.cos(angle) * overlap;
            const shiftY = Math.sin(angle) * overlap;
            b1.x -= shiftX;
            b1.y -= shiftY;
            b2.x += shiftX;
            b2.y += shiftY;
            const v1x = b1.velocity.x;
            const v1y = b1.velocity.y;
            b1.velocity.x = b2.velocity.x * 0.8;
            b1.velocity.y = b2.velocity.y * 0.8;
            b2.velocity.x = v1x * 0.8;
            b2.velocity.y = v1y * 0.8;
          }
        }
      }

      // Dibuja
      list.forEach((b) => b.draw(ctx));
      bubblesRef.current = list;

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Al hacer clic, revienta la primera burbuja tocada
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
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
        💡 Tip: Haz clic en las burbujas para hacerlas explotar. ¡Reaparecerán en
        una nueva ubicación!
      </div>
    </section>
  );
};

export default CommunitySection;
