import NavbarPublic from '@/components/layout/navbars/navbar-public';
import { BannerPublic } from '@/components/layout/banner-public';
import { Footer } from '@/components/layout/footer';
import { BrouwserStatistics } from '@/components/widgets/browsers';

export default function Home() {
  return (
    <div className="flex min-h-screen min-w-[320px] flex-col">
      {/* Opción 1: Min-width en el contenedor principal */}
      <NavbarPublic />

      <BannerPublic />

      {/* Main con ancho mínimo también */}
      <main className="container mx-auto min-w-0 flex-grow px-4 py-16">
        <BrouwserStatistics />
        {/* Aquí puedes agregar más contenido o componentes */}
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Contenido adicional</h2>
          <p className="text-secondary-foreground text-lg">
            Aquí puedes ihoihoihcoihoihsoihoi más contenido o componentes según sea necesario.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
