import NavbarPublic from '@/components/layout/navbars/navbar-public';
import { BannerPublic } from '@/components/layout/banner-public';
import { Footer } from '@/components/layout/footer';
import CommunitySection from '@/components/layout/bubble-panel';
const studentImageUrls = [
  "https://miapi.com/estudiante/1.png",
  "https://miapi.com/estudiante/2.png",
  /* … */
];

export default function Home() {
  return (
    <div className="flex min-h-screen min-w-[320px] flex-col">
      {/* Opción 1: Min-width en el contenedor principal */}
      <NavbarPublic />

      <BannerPublic />

      {/* Main con ancho mínimo también */}
      <main className="container mx-auto min-w-0 flex-grow px-4 py-16">
         <CommunitySection />
      </main>

      <Footer />
    </div>
  );
}
