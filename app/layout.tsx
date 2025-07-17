import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import { AppProviders } from './providers';

const geist = Geist({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Conacad - Tu plataforma de aprendizaje',
    template: '%s | Conacad',
  },
  description:
    'Plataforma educativa líder en cursos online. Aprende con expertos, obtén certificaciones y desarrolla nuevas habilidades desde cualquier lugar.',
  keywords: [
    'educación',
    'aprendizaje',
    'cursos online',
    'plataforma educativa',
    'certificaciones',
    'desarrollo profesional',
    'e-learning',
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
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  category: 'education',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={geist.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
