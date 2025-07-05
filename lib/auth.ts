// app/api/auth/[...nextauth]/route.ts o donde definas el auth
'use server-only'

import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import PostgresAdapter from "@auth/pg-adapter"
import getPool from "@/lib/database"

const pool = getPool()

const authOptions = {
  adapter: PostgresAdapter(pool),
  trustHost: true,
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
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
}

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions)
