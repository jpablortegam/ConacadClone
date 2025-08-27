// app/page.tsx
import { Suspense } from 'react';
import NavbarPublic from '@/components/layout/navbars/navbar-public';
import { BannerPublic } from '@/components/layout/banner-public';
import { Footer } from '@/components/layout/footer';
import { CommunitySection } from '@/components/community';

export default function Home() {
  return (
    <div className="flex min-h-screen min-w-[320px] flex-col">
      <NavbarPublic />
      <BannerPublic />

      <main>
        <Suspense>
          <CommunitySection />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};