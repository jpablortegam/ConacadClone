"use server"

import { signIn } from "@/lib/auth"


// actions/auth.ts
export async function signInWithGoogle() {
    return signIn('google'); 
}

export async function signInWithGitHub() {
    return signIn('github', {callback: '/dashboard'});
}



