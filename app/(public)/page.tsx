import NavbarPublic from "@/components/layout/navbars/navbar-public";
import { BannerPublic } from "@/components/layout/banner-public";
import { Footer } from "@/components/layout/footer";
import { BrouwserStatistics } from "@/components/widgets/browsers";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen min-w-[320px]">
      {/* Opción 1: Min-width en el contenedor principal */}
      <NavbarPublic />

      <BannerPublic />

      {/* Main con ancho mínimo también */}
      <main className="flex-grow container mx-auto px-4 py-16 min-w-0">
        <BrouwserStatistics />
        {/* Aquí puedes agregar más contenido o componentes */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Contenido adicional</h2>
          <p className="text-lg text-secondary-foreground">
            Aquí puedes ihoihoihcoihoihsoihoi más contenido o componentes según sea necesario.
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}