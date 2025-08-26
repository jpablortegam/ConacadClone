// lib/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 5 * 60 },
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
  callbacks: {
    async jwt({ token, user }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (user) token.id = (user as any).id;
      return token;
    },

    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (session.user && token?.id) (session.user as any).id = token.id as string;
      return session;
    },
  },
  events: {
    async linkAccount({ user, account }) {
      // import dinámico (solo en Node, solo cuando se dispara)
      const { sendLinkNoticeEmail } = await import('@/lib/mail');
      const token = randomBytes(32).toString('hex');
      const identifier = `unlink:${account.provider}:${account.providerAccountId}:${user.id}`;

      await prisma.verificationToken.create({
        data: { identifier, token, expires: new Date(Date.now() + 30 * 60 * 1000) },
      });

      if (user.email) {
        await sendLinkNoticeEmail({
          to: user.email,
          userName: user.name ?? user.email,
          provider: account.provider,
          unlinkUrl: `${process.env.NEXTAUTH_URL}/api/account/unlink?token=${token}`,
        });
      }
    },
  },
  pages: { signIn: '/sign-in' },
});
