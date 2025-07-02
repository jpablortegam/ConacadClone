import { IconoGitHub } from "@/components/icons/IconoGitHub";

export const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-6">
            <div className="container mx-auto px-4 flex flex-col items-center md:flex-row md:items-start justify-between">
                {/* Logo + texto */}
                <div className="text-center md:text-left space-y-1">
                    <h1 className="text-2xl font-bold">Conacad</h1>
                    <div className="flex gap-6 py-2">
                        {/* Aquí puedes agregar iconos de redes sociales */}
                        <a href="#" className="text-gray-400 hover:text-white transition" title="GitHub">
                            <svg className="w-4 h-4" fill="currentColor">
                                <IconoGitHub className="w-2 h-2" />
                            </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition" title="GitHub">
                            <svg className="w-4 h-4" fill="currentColor">
                                <IconoGitHub className="w-2 h-2" />
                            </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition" title="GitHub">
                            <svg className="w-4 h-4" fill="currentColor">
                                <IconoGitHub className="w-2 h-2" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Enlaces */}
                <nav className="gap-6 px-4 py-4 text-gray-400">
                    <a href="#" className="hover:text-white transition px-4">Contacto</a>
                    <a href="#" className="hover:text-white transition px-4">Privacidad</a>
                    <a href="#" className="hover:text-white transition px-4">Términos</a>
                </nav>
            </div>
        </footer>
    )
}
