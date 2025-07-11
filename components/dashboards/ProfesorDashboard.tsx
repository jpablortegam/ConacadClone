import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Calendar, Clock } from "lucide-react"

const PageDashboard = async () => {
    const session = await auth()

    if (!session || !session.user) {
        redirect("/sign-in")
    }

    const currentTime = new Date().getTime()
    if (session.expires && new Date(session.expires).getTime() < currentTime) {
        redirect("/sign-in")
    }

    // Formatear fechas
    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Asegúrate de que session.user.role esté disponible gracias a las modificaciones en auth.ts
    // y next-auth.d.ts.

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard Profesores</h1>
                <form
                    action={async () => {
                        "use server"
                        const currentSession = await auth()
                        if (!currentSession) {
                            redirect("/sign-in")
                        }
                        await signOut()
                    }}
                >
                    <Button type="submit" variant="outline">
                        Cerrar Sesión
                    </Button>
                </form>
            </div>

            {/* Información del Usuario */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Información del Usuario
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            {/* Nombre del Usuario */}
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Nombre:</span>
                                <span>{session.user?.name || 'No especificado'}</span>
                            </div>

                            {/* Email del Usuario */}
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Email:</span>
                                <span>{session.user?.email}</span>
                            </div>

                            {/* Implementación del Rol */}
                            {/* Verifica que session.user.role exista antes de mostrarlo */}
                            <div className="flex items-center gap-2">
                                {/* Puedes usar User o un ícono diferente para el rol */}
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Rol:</span>
                                {/* Accedemos directamente a session.user?.role */}
                                <span>{session.user?.role || 'No asignado'}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Sesión expira:</span>
                                <span className="text-sm">
                                    {session.expires ? formatDate(session.expires) : 'No especificado'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">ID de Usuario:</span>
                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {session.user?.id}
                                </code>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PageDashboard