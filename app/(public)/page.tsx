// app/page.tsx
import { Suspense } from 'react';
import NavbarPublic from '@/components/layout/navbars/navbar-public';
import { BannerPublic } from '@/components/layout/banner-public';
import { Footer } from '@/components/layout/footer';
import CommunitySection from '@/components/layout/bubble-panel';

// Componente de fallback mientras carga CommunitySection
function CommunityFallback() {
  return (
    <section className="container mx-auto px-4 bg-card/90 backdrop-blur-sm border border-border/20 rounded-lg shadow-lg dark:shadow-2xl dark:shadow-black/25 p-8 mb-10 text-center transition-all duration-300">
      <h2 className="text-4xl font-extrabold mb-6 text-primary">
        Nuestra Comunidad
      </h2>

      <div className="relative w-full h-96 bg-muted/30 dark:bg-muted/10 rounded-lg overflow-hidden border-2 border-border/50 dark:border-border/30 transition-colors duration-300">
        {/* Skeleton básico */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm">Preparando comunidad...</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>Haz clic en las burbujas para interactuar • Mueve el cursor para verlas en acción</p>
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