export function BrouwserStatistics() {
  return (
    <section className="bg-background text-primary px-4">
      <div className="mx-auto max-w-7xl py-12 text-center sm:py-16 md:py-20">
        <h1 className="mb-4 text-3xl leading-tight font-bold sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
          Estadísticas de Navegadores
        </h1>
        <p className="text-secondary-foreground mx-auto mb-8 max-w-2xl text-lg sm:text-xl md:text-2xl">
          Aquí puedes ver las estadísticas de uso de los navegadores más populares.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {/* Aquí puedes agregar gráficos o tablas con las estadísticas */}
        </div>
      </div>
    </section>
  );
}
