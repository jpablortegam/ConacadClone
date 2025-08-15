// app/page.tsx (Componente Servidor optimizado)
import NavbarPublic from '@/components/layout/navbars/navbar-public';
import { BannerPublic } from '@/components/layout/banner-public';
import { Footer } from '@/components/layout/footer';
import CommunitySection from '@/components/layout/bubble-panel';

export default function Home() {
  return (
    <div className="flex min-h-screen min-w-[320px] flex-col">
      <NavbarPublic />
      <BannerPublic />

      <main>
        {/* ✅ El componente ahora maneja su propio fetch con cache */}
        <CommunitySection />
      </main>

      <Footer />
    </div>
  );
}