"use client" // This tells Next.js to render this component on the client-side

import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"

import { signIn } from "next-auth/react"

export default function Dashboard() {
    const { data: session } = useSession()

    return (
        <nav>
            {session ? (
                <p>Welcome, {session.user?.name || "User"}!</p>
            ) : (
                <div>
                    <p>Not logged in.</p>
                    <button onClick={() => signIn("github", { redirectTo: "/dashboard" })}>
                        Sign In
                    </button>
                </div>

            )}
            <div className="flex flex-col items-center justify-center h-screen">
                <button onClick={() => signOut()}>Sign Out</button>
            </div>
        </nav >
    )
}