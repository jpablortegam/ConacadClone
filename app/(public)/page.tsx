// app/page.tsx
import NavbarPublic from '@/components/layout/navbars/navbar-public';
import { BannerPublic } from '@/components/layout/banner-public';
import { Footer } from '@/components/layout/footer';
import GallerySection from '@/components/gallery/GallerySection';

export default function Home() {
  return (
    <div className="bg-background text-foreground flex min-h-screen min-w-[320px] flex-col">
      <NavbarPublic />

  
      <main className="flex flex-grow flex-col">
        <BannerPublic />
        <GallerySection />
      </main>

      <Footer />
    </div>
  );
}
