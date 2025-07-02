import React from 'react'

export function BannerPublic() {
    return (
        <section className="bg--background text-primary w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto py-12 sm:py-16 md:py-20 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                    Bienvenido a Conacad
                </h1>
                <p className="text-lg  sm:text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-primary">
                    Explora nuestras características y ofertas diseñadas para potenciar tu aprendizaje
                </p>
                <div className="flex flex-col sm:flex-row sm:justify-center items-center gap-4">
                </div>
            </div>
        </section>
    )
}
