import React from 'react';

export function BannerPublic() {
  return (
    <section className="bg--background text-primary w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-12 text-center sm:py-16 md:py-20">
        <h1 className="mb-4 text-3xl leading-tight font-bold sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
          Bienvenido a Conacad
        </h1>
        <p className="text-primary mx-auto mb-8 max-w-2xl text-lg sm:text-xl md:text-2xl">
          Explora nuestras características y ofertas diseñadas para potenciar tu aprendizaje
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"></div>
      </div>
    </section>
  );
}
