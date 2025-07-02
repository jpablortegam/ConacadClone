import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET!,
}

// Crea el handler y expórtalo para GET y POST
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }


// actions/auth.ts
import { signIn as nextAuthSignIn } from "next-auth/react"

export function signInWithGitHub() {
  return nextAuthSignIn("github")
}

export function signInWithGoogle() {
  return nextAuthSignIn("google") 
}
