import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";


export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
    maxAge: 7 * 24 * 60 * 60, 
    updateAge: 24 * 60 * 60, 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user){
        token.id = user.id;
      }
      return token;
    },
    async session({ session, user }) {
      if (user && user.id) {
         session.user.id = user.id;

         const userWithRole = await prisma.user.findUnique({
          where: { 
            id: Number(user.id) 
          },
          include: { role: true }, 
        });
          if (userWithRole?.role) {
          session.user.role = userWithRole.role.name;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
});