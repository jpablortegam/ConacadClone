// lib/auth.ts (o donde tengas NextAuth)
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 7 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token, user }) {
      // En JWT, usa token; si algún día vuelves a DB, usa user?.id
      if (session.user && (token?.id || user?.id)) {
        // @ts-ignore (si tu tipo de Session no incluye id)
        session.user.id = (token?.id ?? user?.id) as string;
      }
      return session;
    },
  },

  pages: { signIn: '/sign-in' },
});
