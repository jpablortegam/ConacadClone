'use client';

import { useEffect, useMemo, useRef, Suspense, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import Image from 'next/image';
import { useAvatarImages } from '@/hooks/useAvatarImages';
import styles from './SimpleDomoGallery.module.css';

type CSSCustomProperties = React.CSSProperties & {
  [key: `--${string}`]: string | number;
};

type ImageItem = string | { src: string; alt?: string };

type SimpleDomoGalleryProps = {
  images?: ImageItem[];
  fit?: number;
  minRadius?: number;
  maxRadius?: number;
  segments?: number;
  dragSensitivity?: number;
  grayscale?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  isMobile?: boolean;
};

type ItemDef = {
  src: string;
  alt: string;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

function buildItems(pool: ImageItem[], seg: number, isMobile: boolean = false): ItemDef[] {
  const xCols = Array.from({ length: seg }, (_, i) => -40 + i * 2);

  // Ajustar la distribución vertical para mejor forma de domo
  const evenYs = isMobile 
    ? [-6, -4, -2, 0, 2, 4, 6]  // Menos filas en móvil para imágenes más pequeñas
    : [-9, -7, -5, -3, -1, 1, 3, 5, 7, 9]; // Más filas en desktop
  
  const oddYs = isMobile 
    ? [-5, -3, -1, 1, 3, 5, 7]
    : [-8, -6, -4, -2, 0, 2, 4, 6, 8, 10];

  // Tamaños diferentes para móvil y desktop
  const itemSize = isMobile 
    ? { sizeX: 0.9, sizeY: 0.9 }   // Más pequeñas en móvil para mejor visualización del domo
    : { sizeX: 1.6, sizeY: 1.4 };  // Más grandes en desktop pero manteniendo proporción

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map((y) => ({ x, y, ...itemSize }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) {
    return [];
  }

  const normalizedImages = pool.map((image) => {
    if (typeof image === 'string') {
      return { src: image, alt: '' };
    }
    return { src: image.src || '', alt: image.alt || '' };
  });

  const usedImages = Array.from(
    { length: totalSlots },
    (_, i) => normalizedImages[i % normalizedImages.length]
  );

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt,
  }));
}

function GalleryContent({
  fit = 1,
  minRadius = 750,
  maxRadius = 1000,
  segments = 60,
  dragSensitivity = 25,
  grayscale = false,
  autoRotate = true,
  autoRotateSpeed = 0.2,
  images,
  isMobile = false,
}: SimpleDomoGalleryProps) {
  const { images: avatarImages, loading } = useAvatarImages(segments, 'small');

  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastDragTimeRef = useRef(0);
  const draggingRef = useRef(false);

  const finalImages = useMemo(() => {
    if (avatarImages.length > 0) {
      return avatarImages.map((src, index) => ({
        src,
        alt: `Avatar ${index + 1}`,
      }));
    }
    if (images && images.length > 0) {
      return images;
    }
    return [];
  }, [avatarImages, images]);

  const items = useMemo(() => {
    return buildItems(finalImages, segments, isMobile);
  }, [finalImages, segments, isMobile]);

  const applyTransform = useCallback((xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  }, []);

  useEffect(() => {
    if (!autoRotate) return;

    let frameId: number;

    const rotate = () => {
      if (!draggingRef.current) {
        if (Math.abs(velocityRef.current.y) > 0.01) {
          velocityRef.current.y *= 0.98;
          rotationRef.current.y += velocityRef.current.y;
        } else {
          rotationRef.current.y += autoRotateSpeed;
        }

        applyTransform(rotationRef.current.x, rotationRef.current.y);
      }
      frameId = requestAnimationFrame(rotate);
    };

    frameId = requestAnimationFrame(rotate);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [autoRotate, autoRotateSpeed, applyTransform]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let timeoutId: NodeJS.Timeout;

    const ro = new ResizeObserver((entries) => {
      // Debounce resize para evitar cálculos excesivos
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const cr = entries[0].contentRect;
        const w = Math.max(1, cr.width);
        const h = Math.max(1, cr.height);
        const minDim = Math.min(w, h);

        let radius = minDim * fit;
        radius = Math.max(minRadius, Math.min(maxRadius, radius));

        root.style.setProperty('--radius', `${radius}px`);
        root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');

        applyTransform(rotationRef.current.x, rotationRef.current.y);
      }, 16); // ~60fps
    });

    ro.observe(root);
    return () => {
      ro.disconnect();
      clearTimeout(timeoutId);
    };
  }, [fit, minRadius, maxRadius, grayscale, applyTransform]);

  const lastPosRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useGesture(
    {
      onDragStart: ({ event }) => {
        draggingRef.current = true;
        velocityRef.current = { x: 0, y: 0 };

        const evt = event as PointerEvent;
        lastPosRef.current = { x: evt.clientX, y: evt.clientY, time: Date.now() };
        lastDragTimeRef.current = Date.now();
      },
      onDrag: ({ event, last }) => {
        if (!draggingRef.current || !lastPosRef.current) return;

        const evt = event as PointerEvent;
        const currentTime = Date.now();
        const deltaTime = Math.max(1, currentTime - lastPosRef.current.time);

        const dx = evt.clientX - lastPosRef.current.x;
        const dy = evt.clientY - lastPosRef.current.y;

        const vx = dy / deltaTime / dragSensitivity;
        const vy = dx / deltaTime / dragSensitivity;

        const nextX = Math.max(-15, Math.min(15, rotationRef.current.x - dy / dragSensitivity));
        const nextY = rotationRef.current.y + dx / dragSensitivity;

        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);

        lastPosRef.current = { x: evt.clientX, y: evt.clientY, time: currentTime };

        if (last) {
          velocityRef.current = { x: vx * 16, y: vy * 16 };
          draggingRef.current = false;
          lastPosRef.current = null;
        }
      },
    },
    { target: mainRef, eventOptions: { passive: false } }
  );

  if (loading && finalImages.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-600">Cargando galería...</p>
        </div>
      </div>
    );
  }

  if (finalImages.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No hay imágenes disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`${styles.sphereRoot} relative h-full w-full`}
      style={
        {
          '--segments-x': segments,
          '--segments-y': segments,
        } as CSSCustomProperties
      }
    >
      <main
        ref={mainRef}
        className={`${styles.main} absolute inset-0 grid cursor-grab place-items-center overflow-hidden select-none active:cursor-grabbing`}
      >
        <div className={styles.stage}>
          <div ref={sphereRef} className={styles.sphere}>
            {items.map((it, i) => {
              if (!it.src) return null;

              return (
                <div
                  key={`${it.x}-${it.y}-${i}`}
                  className={`${styles.sphereItem} absolute m-auto`}
                  style={
                    {
                      '--offset-x': it.x,
                      '--offset-y': it.y,
                      '--item-size-x': it.sizeX,
                      '--item-size-y': it.sizeY,
                    } as CSSCustomProperties
                  }
                >
                  <div className={`${styles.itemImage} relative`}>
                    <Image
                      src={it.src}
                      alt={it.alt}
                      fill
                      sizes={isMobile ? "50px" : "(max-width: 1024px) 120px, 160px"}
                      className="object-cover"
                      priority={i < 4}
                      loading={i < 4 ? 'eager' : 'lazy'}
                      quality={isMobile ? 45 : 60}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const parent = target.closest(`.${styles.sphereItem}`) as HTMLElement;
                        if (parent) {
                          parent.style.display = 'none';
                        }
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SimpleDomoGallery(props: SimpleDomoGalleryProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600">Cargando galería...</p>
          </div>
        </div>
      }
    >
      <GalleryContent {...props} />
    </Suspense>
  );
}
