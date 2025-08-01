'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Code } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, Variants, cubicBezier } from 'framer-motion';

export default function NavbarPublic() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isMobileMenuOpen]);

  // Variantes mejoradas para el backdrop
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.15,
        ease: 'easeIn',
      },
    },
  };

  // Variantes para el modal que sale desde la esquina superior derecha
  const modalVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.4,
      x: 100,
      y: -80,
      transformOrigin: 'top right',
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transformOrigin: 'top right',
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        mass: 0.8,
        when: 'beforeChildren',
        staggerChildren: 0.08,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.4,
      x: 100,
      y: -80,
      transformOrigin: 'top right',
      transition: {
        duration: 0.2,
        ease: cubicBezier(0.4, 0, 1, 1),
      },
    },
  };

  // Variantes mejoradas para los items del menú
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      x: 30,
      rotateY: -15,
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
      },
    },
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-primary-foreground/90 shadow-lg backdrop-blur-lg'
            : 'bg-primary-foreground/100'
        }`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Code size={28} />
            <span className="text-lg font-bold">Conacad</span>
          </Link>

          {/* Menú escritorio */}
          <div className="hidden items-center gap-3 lg:flex">
            <ModeToggle />
            <Link href="/sign-in">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Registrarse</Button>
            </Link>
          </div>

          {/* Toggle móvil */}
          <div className="relative z-50 flex items-center gap-3 lg:hidden">
            <ModeToggle />
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:bg-accent focus:ring-primary rounded-md p-2 transition-colors focus:ring-2 focus:outline-none"
              aria-label="Toggle mobile menu"
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Modal móvil mejorado */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={closeMenu}
          >
            {/* Contenedor posicionado en la esquina superior derecha */}
            <div className="absolute top-6 right-6">
              <motion.div
                variants={modalVariants}
                className="bg-primary-foreground/95 border-border/50 w-90 rounded-2xl border p-16 shadow-2xl backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
                style={{
                  boxShadow:
                    '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Header del modal */}
                <motion.div
                  variants={itemVariants}
                  className="mb-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Code size={20} />
                    <span className="text-sm font-semibold">Menú</span>
                  </div>
                </motion.div>

                {/* Items del menú */}
                <motion.div className="flex flex-col gap-3">
                  <motion.div variants={itemVariants}>
                    <Link href="/sign-in" onClick={closeMenu} className="block">
                      <Button
                        variant="ghost"
                        className="hover:bg-accent/50 h-12 w-full justify-center text-left transition-colors"
                      >
                        Iniciar Sesión
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Link href="/sign-up" onClick={closeMenu} className="block">
                      <Button className="bg-primary hover:bg-primary/90 h-12 w-full transition-colors">
                        Registrarse
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
