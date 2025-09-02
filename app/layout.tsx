// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import { ThemeProviderWrapper } from './providers';

const geist = Geist({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Conacad',
    template: '%s | Conacad',
  },
  description: 'Plataforma educativa',
  keywords: [
    'educación',
    'aprendizaje',
    'cursos online',
    'plataforma educativa',
    'conacad',
    'conacad.com',
    'formación',
  ],
  authors: [{ name: 'Conacad Team', url: 'https://conacad.com' }],
  creator: 'Conacad Team',
  publisher: 'Conacad',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://conacad.com'),
  alternates: {
    canonical: '/',
    languages: {
      'es-ES': '/es',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'Conacad - Tu plataforma de aprendizaje',
    description:
      'Plataforma educativa líder en cursos online. Aprende con expertos y desarrolla nuevas habilidades.',
    url: 'https://conacad.com',
    siteName: 'Conacad',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Conacad - Plataforma de aprendizaje online',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@conacad',
    creator: '@conacad',
    title: 'Conacad - Tu plataforma de aprendizaje',
    description:
      'Plataforma educativa líder en cursos online. Aprende con expertos y desarrolla nuevas habilidades.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  category: 'education',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={geist.className}>
        <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
      </body>
    </html>
  );
}
