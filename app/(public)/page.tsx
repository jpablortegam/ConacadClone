import NavbarPublic from '@/components/layout/navbars/navbar-public';
import { BannerPublic } from '@/components/layout/banner-public';
import { Footer } from '@/components/layout/footer';
import CommunitySection from '@/components/layout/bubble-panel';


export default function Home() {
  return (
    <div className="flex min-h-screen min-w-[320px] flex-col">
      {/* Opción 1: Min-width en el contenedor principal */}
      <NavbarPublic />
      <BannerPublic />

      {/* Main con ancho mínimo también */}
      <main>
         <CommunitySection />
      </main>

      <Footer />
    </div>
  );
}
