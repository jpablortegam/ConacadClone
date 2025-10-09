'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Code } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, Variants, cubicBezier } from 'framer-motion';

// --- MEJORA 1: Definir constantes fuera del componente ---
// Evita que se redeclaren en cada render.
const navItems = [
  { href: '/sign-in', label: 'Iniciar Sesión', isPrimary: false },
  { href: '/sign-up', label: 'Registrarse', isPrimary: true },
];

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6, x: 80, y: -100, transformOrigin: 'top right' },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300, mass: 0.8, staggerChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    scale: 0.6,
    x: 80,
    y: -100,
    transition: { duration: 0.2, ease: cubicBezier(0.4, 0, 1, 1) },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 300 } },
};


// --- MEJORA 2: Extraer el menú móvil a su propio componente ---
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="mobile-menu-backdrop"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="mobile-menu-modal"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-16 right-4 w-80 rounded-2xl border border-border/50 bg-card/95 p-6 shadow-2xl backdrop-blur-md"
          >
            <motion.div variants={itemVariants} className="mb-6 flex items-center justify-between text-foreground">
              <span className="text-sm font-semibold">Menú</span>
              <motion.button
                onClick={onClose}
                className="hover:bg-accent rounded-full p-1.5 transition-colors"
                aria-label="Cerrar menú"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <X size={18} />
              </motion.button>
            </motion.div>

            <motion.div className="flex flex-col gap-3">
              {/* --- MEJORA 3: Reutilizar el array de navItems --- */}
              {navItems.map((item) => (
                <motion.div variants={itemVariants} key={item.href}>
                  <Link href={item.href} onClick={onClose} className="block">
                    <Button
                      variant={item.isPrimary ? 'default' : 'ghost'}
                      className="h-12 w-full justify-center text-base font-medium transition-colors"
                    >
                      {item.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export default function NavbarPublic() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true }); // Mejora: { passive: true } para rendimiento
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // --- MEJORA 4: Usar classList en lugar de style ---
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    // Cleanup por si el componente se desmonta con el menú abierto
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const headerClasses = `sticky top-0 z-40 transition-all duration-200 ${
    scrolled
      ? 'bg-background/90 shadow-lg backdrop-blur-lg border-b border-border/50'
      : 'bg-background/100'
  }`;

  return (
    <>
      <header className={headerClasses}>
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Code />
            <span className="text-lg font-bold text-foreground">Conacad</span>
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            <ModeToggle />
            {/* --- MEJORA 3: Reutilizar el array de navItems --- */}
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                <Button variant={item.isPrimary ? 'default' : 'ghost'}>
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="relative z-50 flex items-center gap-3 lg:hidden">
            <ModeToggle />
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:bg-accent text-foreground focus:ring-primary rounded-md p-2 transition-colors focus:ring-2 focus:outline-none"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen} // --- MEJORA 5: Accesibilidad ---
              whileTap={{ scale: 0.95 }}
            >
              <motion.div animate={{ rotate: isMobileMenuOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </header>
      
      {/* El componente MobileMenu ahora gestiona su propia animación y visibilidad */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMenu} />
    </>
  );
}