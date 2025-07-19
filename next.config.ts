import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuración de imágenes para Next.js
  images: {
    // Esto le dice a Next.js que intente servir imágenes en formatos AVIF y WebP
    // si el navegador lo soporta. Esta es la clave para tus necesidades.
    formats: ['image/avif', 'image/webp'],
    // Si usas imágenes de dominios externos, asegúrate de añadirlos aquí:
    // domains: ['ejemplo.com', 'otracdn.com'],
  },

  // ¡Elimina completamente la función webpack si quieres usar Turbopack!
  // Si la dejas, Next.js te seguirá advirtiendo que tienes configuración de Webpack
  // pero estás usando Turbopack, lo que puede causar confusión o errores.
  //
  // webpack(config: Configuration, options: { dev: boolean; isServer: boolean }): Configuration {
  //   const { dev, isServer } = options;
  //   if (!dev && !isServer) {
  //     config.optimization = config.optimization || {};
  //     const existing = config.optimization.minimizer ?? [];
  //     config.optimization.minimizer = [
  //       ...existing,
  //       new ImageMinimizerPlugin({
  //         minimizer: {
  //           implementation: ImageMinimizerPlugin.imageminMinify,
  //           options: {
  //             plugins: [
  //               ['optipng', { optimizationLevel: 5 }],
  //               ['mozjpeg', { quality: 75 }],
  //             ],
  //           },
  //         },
  //       }),
  //     ];
  //   }
  //   return config;
  // },
};

export default nextConfig;
