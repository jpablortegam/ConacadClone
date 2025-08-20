// app/page.tsx
import { Suspense } from 'react';
import NavbarPublic from '@/components/layout/navbars/navbar-public';
import { BannerPublic } from '@/components/layout/banner-public';
import { Footer } from '@/components/layout/footer';
// ✅ Cambio principal: Nuevo import desde la estructura refactorizada
import { CommunitySection } from '@/components/community';

// Componente de fallback mientras carga CommunitySection
function CommunityFallback() {
  return (
    <section className="bg-card/90 border-border/20 container mx-auto mb-10 rounded-lg border p-8 px-4 text-center shadow-lg backdrop-blur-sm transition-all duration-300 dark:shadow-2xl dark:shadow-black/25">
      <h2 className="text-primary mb-6 text-4xl font-extrabold">Nuestra Comunidad</h2>

      <div className="bg-muted/30 dark:bg-muted/10 border-border/50 dark:border-border/30 relative h-96 w-full overflow-hidden rounded-lg border-2 transition-colors duration-300">
        {/* Skeleton básico */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground flex items-center gap-3">
            <div className="border-primary/30 border-t-primary h-4 w-4 animate-spin rounded-full border-2" />
            <span className="text-sm">Preparando comunidad...</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen min-w-[320px] flex-col">
      {/* Contenido crítico que carga inmediatamente */}
      <NavbarPublic />
      <BannerPublic />

      <main>
        {/* 
          Suspense boundary asegura que el contenido crítico se renderice primero.
          CommunitySection se carga de forma no bloqueante después.
        */}
        <Suspense fallback={<CommunityFallback />}>
          <CommunitySection />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
