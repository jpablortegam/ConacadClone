import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  webpack(config: Configuration, options: { dev: boolean; isServer: boolean }): Configuration {
    const { dev, isServer } = options;

    if (!dev && !isServer) {
      // 1. Asegura que exista config.optimization
      config.optimization = config.optimization || {};

      // 2. Concatena tu ImageMinimizerPlugin al array de minimizers
      const existing = config.optimization.minimizer ?? [];
      config.optimization.minimizer = [
        ...existing,
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: [
                ['optipng', { optimizationLevel: 5 }],
                ['mozjpeg', { quality: 75 }],
              ],
            },
          },
        }),
      ];
    }

    return config;
  },
};

export default nextConfig;
