"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

// Definición de tipos para las propiedades de color (RGB)
interface RGBColor {
  r: number;
  g: number;
  b: number;
}

// Clase para representar una burbuja (sin imágenes por ahora)
class Bubble {
  x: number;
  y: number;
  radius: number;
  color: RGBColor;
  isParticle: boolean;
  velocity: { x: number; y: number };
  opacity: number;
  markForRemoval: boolean;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: RGBColor,
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
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = `rgba(100,100,100,${this.opacity})`;
    ctx.stroke();
    ctx.restore();
  }

  update(canvas: HTMLCanvasElement) {
    // Movimiento básico y rebote
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    const bounceDamping = 0.5;
    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
      this.velocity.x *= -bounceDamping;
      this.x = Math.min(
        Math.max(this.x, this.radius),
        canvas.width - this.radius
      );
    }
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      this.velocity.y *= -bounceDamping;
      this.y = Math.min(
        Math.max(this.y, this.radius),
        canvas.height - this.radius
      );
    }

    // Para partículas, desvanecer
    if (this.isParticle) {
      this.opacity -= 0.02;
      this.radius -= 0.1;
      if (this.opacity <= 0 || this.radius <= 0) {
        this.markForRemoval = true;
      }
    }
  }

  pop(): Bubble[] {
    // Cuando revienta, devuelve un array de partículas de explosión
    this.markForRemoval = true;
    const particles: Bubble[] = [];
    for (let i = 0; i < 5; i++) {
      const p = new Bubble(this.x, this.y, Math.random() * 3 + 1, this.color, true);
      particles.push(p);
    }
    return particles;
  }
}

// Genera un color neutro aleatorio
const getRandomNeutralColor = (): RGBColor => {
  const palette = [
    { r: 26, g: 26, b: 26 },
    { r: 51, g: 51, b: 51 },
    { r: 77, g: 77, b: 77 },
    { r: 204, g: 204, b: 204 },
    { r: 245, g: 245, b: 245 },
  ];
  return palette[Math.floor(Math.random() * palette.length)];
};

const CommunitySection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const [_, setTick] = useState(0);

  // Inicializa las burbujas
  const initBubbles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const count = 15;
    const w = canvas.width;
    const h = canvas.height;
    const arr: Bubble[] = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 25 + 25;
      const x = Math.random() * (w - 2 * r) + r;
      const y = Math.random() * (h - 2 * r) + r;
      arr.push(new Bubble(x, y, r, getRandomNeutralColor()));
    }
    bubblesRef.current = arr;
    setTick((t) => t + 1);
  }, []);

  // Ajusta el tamaño del canvas al contenedor
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      initBubbles();
    }
  }, [initBubbles]);

  useEffect(() => {
    // Inicial y listener resize
    requestAnimationFrame(handleResize);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // Bucle de animación
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    let id: number;

    const loop = () => {
      if (!canvas || !ctx) {
        id = requestAnimationFrame(loop);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const list = bubblesRef.current;

      // Actualiza y filtra partículas muertas
      list.forEach((b) => b.update(canvas));
      bubblesRef.current = list.filter((b) => !b.markForRemoval);

      // Dibuja
      bubblesRef.current.forEach((b) => b.draw(ctx));

      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  // Al clic, revienta la primera burbuja que toque
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
        if (!b.isParticle) {
          const dx = x - b.x;
          const dy = y - b.y;
          if (Math.hypot(dx, dy) < b.radius) {
            // revienta y añade partículas
            const parts = b.pop();
            list.splice(i, 1, ...parts);
            break;
          }
        }
      }
      bubblesRef.current = list;
      setTick((t) => t + 1);
    },
    []
  );

  return (
    <section id="comunidad" className="bg-white bg-opacity-90 rounded-lg shadow-xl p-8 mb-10 text-center">
      <h2 className="text-4xl font-extrabold mb-6 text-gray-900">Nuestra Vibrante Comunidad</h2>
      <p className="text-xl text-gray-600 leading-relaxed mb-8">
        ¡Conoce a los rostros detrás de nuestra plataforma! Haz clic en las burbujas para interactuar con ellas.
      </p>
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg overflow-hidden border-2 border-gray-200">
        <canvas ref={canvasRef} onClick={handleClick} className="w-full h-full cursor-pointer block" />
      </div>
      <div className="mt-6 text-sm text-gray-500">
        💡 Tip: Haz clic en las burbujas para hacerlas explotar. ¡Reaparecerán en una nueva ubicación!
      </div>
    </section>
  );
};

export default CommunitySection;
