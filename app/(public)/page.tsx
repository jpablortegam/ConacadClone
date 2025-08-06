// app/page.tsx (Componente Servidor)
import NavbarPublic from '@/components/layout/navbars/navbar-public';
import { BannerPublic } from '@/components/layout/banner-public';
import { Footer } from '@/components/layout/footer';
import CommunitySection from '@/components/layout/bubble-panel';
import UserProfileService, { UserProfile } from '@/services/UserProfileService';
import { prisma } from '@/lib/prisma';

// Crear instancia del servicio
const userProfileService = new UserProfileService(prisma);

export default async function Home() {
  // ✅ OPCIÓN 1: Llamar directamente al servicio (RECOMENDADO - más eficiente)
  let profilePictures: UserProfile[] | undefined;
  try {
    profilePictures = await userProfileService.getProfilePictures();
  } catch (error) {
    console.error('Error cargando perfiles en página:', error);
    profilePictures = []; // Fallback a array vacío
  }

  return (
    <div className="flex min-h-screen min-w-[320px] flex-col">
      <NavbarPublic />
      <BannerPublic />

      <main>
        {/* ✅ Pasar los DATOS, no la función */}
        <CommunitySection profilePictures={profilePictures} />
      </main>

      <Footer />
    </div>
  );
}