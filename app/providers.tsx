// app/providers.tsx
"use client"; // This component needs to be a Client Component

import { SessionProvider } from "next-auth/react";

export function NextAuthSessionProvider({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}