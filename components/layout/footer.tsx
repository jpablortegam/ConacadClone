import { IconoGitHub } from '@/components/icons/IconoGitHub';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 py-2 text-white">
      <div className="container mx-auto flex flex-col items-center justify-between px-2 md:flex-row md:items-start">
        {/* Logo + texto */}
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">Conacad</h1>
          <div className="flex gap-6 py-2">
            {/* Aquí puedes agregar iconos de redes sociales */}
            <a href="#" className="text-gray-400 transition hover:text-white" title="GitHub">
              <svg className="h-4 w-4" fill="currentColor">
                <IconoGitHub className="h-2 w-2" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 transition hover:text-white" title="GitHub">
              <svg className="h-4 w-4" fill="currentColor">
                <IconoGitHub className="h-2 w-2" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 transition hover:text-white" title="GitHub">
              <svg className="h-4 w-4" fill="currentColor">
                <IconoGitHub className="h-2 w-2" />
              </svg>
            </a>
          </div>
        </div>

        {/* Enlaces */}
        <nav className="gap-6 px-4 py-4 text-gray-400">
          <a href="#" className="px-4 transition hover:text-white">
            Contacto
          </a>
          <a href="#" className="px-4 transition hover:text-white">
            Privacidad
          </a>
          <a href="#" className="px-4 transition hover:text-white">
            Términos
          </a>
        </nav>
      </div>
    </footer>
  );
};
