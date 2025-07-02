export function BrouwserStatistics() {
    return (
        <section className="bg-background text-primary  px-4 ">
            <div className="max-w-7xl mx-auto py-12 sm:py-16 md:py-20 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                    Estadísticas de Navegadores
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-secondary-foreground">
                    Aquí puedes ver las estadísticas de uso de los navegadores más populares.
                </p>
                <div className="flex flex-col sm:flex-row sm:justify-center items-center gap-4">
                    {/* Aquí puedes agregar gráficos o tablas con las estadísticas */}
                </div>

            </div>
        </section>
    );
}