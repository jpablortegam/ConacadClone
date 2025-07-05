import { useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    const messages: Record<string, string> = {
        OAuthAccountNotLinked: 'Este correo ya está asociado a otro método de autenticación. Intenta iniciar sesión con ese proveedor.',
        Configuration: 'Error de configuración del servidor de autenticación.',
        AccessDenied: 'Acceso denegado.',
        default: 'Ha ocurrido un error al iniciar sesión.'
    }

    return (
        <div className="max-w-md mx-auto mt-10 text-center">
            <h1 className="text-2xl font-bold text-red-600">Error de inicio de sesión</h1>
            <p className="mt-4 text-gray-700">
                {messages[error ?? 'default']}
            </p>
            <a href="/login" className="mt-6 inline-block text-blue-600 underline">
                Volver al inicio de sesión
            </a>
        </div>
    )
}
