'use client';

import { useState, useEffect, useMemo, memo, useRef } from 'react';
import dynamic from 'next/dynamic';

// Lazy load del componente pesado con loading optimizado
const SimpleDomoGallery = dynamic(() => import('@/components/gallery/SimpleDomoGallery'), {
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
    </div>
  ),
  ssr: false,
});

const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < breakpoint);
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [breakpoint]);

  return isMobile;
};

const GallerySection = memo(() => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const galleryProps = useMemo(
    () => ({
      fit: isMobile ? 0.75 : 0.8,
      minRadius: isMobile ? 200 : 320,
      maxRadius: isMobile ? 280 : 550,
      segments: isMobile ? 45 : 35,
      autoRotateSpeed: isMobile ? 0.08 : 0.12,
      grayscale: false,
      autoRotate: true,
      isMobile, // Pasar el estado móvil al componente
    }),
    [isMobile]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-background w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-16">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-4xl font-bold sm:text-5xl">
            Galería de la Comunidad
          </h2>
          <div className="via-primary mx-auto mt-8 h-1 w-32 rounded-full bg-gradient-to-r from-transparent to-transparent"></div>
        </div>

        <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-xl">
          <div
            className="bg-card relative h-[400px] sm:h-[550px] lg:h-[650px] xl:h-[700px]"
            style={{
              contain: 'layout style paint',
            }}
          >
            {isVisible ? (
              <SimpleDomoGallery {...galleryProps} />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

GallerySection.displayName = 'GallerySection';

export default GallerySection;
