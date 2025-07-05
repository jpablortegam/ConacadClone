import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"

const PageDashboard = async () => {
    const session = await auth()


    if (!session || !session.user) {
        redirect("/sign-in")
    }

    const currentTime = new Date().getTime()
    if (session.expires && new Date(session.expires).getTime() < currentTime) {
        redirect("/sign-in")
    }

    return (
        <>
            <h1>Dashboard</h1>
            {/* ✅ Solo mostrar datos seguros */}
            <p>Bienvenido, {session.user?.name}</p>
            <p>Email: {session.user?.email}</p>

            {/* ✅ Mostrar solo información no sensible para debugging */}
            {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 p-4 bg--foreground rounded">
                    <summary >Debug Info (Solo desarrollo)</summary>
                    <pre className="text-xs">
                        {JSON.stringify({
                            name: session.user?.name,
                            email: session.user?.email,
                            expires: session.expires
                        }, null, 2)}
                    </pre>
                </details>
            )}

            {/* ✅ Server Action con validación */}
            <form
                action={async () => {
                    "use server"

                    // Validar sesión antes de cerrar
                    const currentSession = await auth()
                    if (!currentSession) {
                        redirect("/sign-in")
                    }

                    await signOut()
                }}
            >
                <Button type="submit">Sign Out</Button>
            </form>
        </>
    )
}

export default PageDashboard