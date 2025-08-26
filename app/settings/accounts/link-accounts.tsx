"use client";
import { signIn } from "next-auth/react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { unlinkProvider } from "./actions";


export default function LinkAccounts({ hasGoogle, hasGitHub }: { hasGoogle: boolean; hasGitHub: boolean; }) {
    const [pending, start] = useTransition();


    const link = (provider: "google" | "github") => {
        signIn(provider, { callbackUrl: "/settings/accounts" });
    };


    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {!hasGoogle ? (
                <Button onClick={() => link("google")} disabled={pending} variant="outline" className="h-12">
                    Vincular con Google
                </Button>
            ) : (
                <form action={() => start(() => unlinkProvider("google"))}>
                    <Button type="submit" variant="secondary" className="h-12 w-full">Desvincular Google</Button>
                </form>
            )}


            {!hasGitHub ? (
                <Button onClick={() => link("github")} disabled={pending} variant="outline" className="h-12">
                    Vincular con GitHub
                </Button>
            ) : (
                <form action={() => start(() => unlinkProvider("github"))}>
                    <Button type="submit" variant="secondary" className="h-12 w-full">Desvincular GitHub</Button>
                </form>
            )}
        </div>
    );
}