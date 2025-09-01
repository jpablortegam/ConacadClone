import 'server-only';

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { prisma } from '@/lib/prisma';
import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';
import type { User as NextAuthUser } from 'next-auth';
import type { Account } from '@auth/core/types';
import type { AdapterUser } from '@auth/core/adapters';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async linkAccount({
      user,
      account,
    }: {
      user: NextAuthUser | AdapterUser;
      account: Account;
      profile?: unknown;
    }) {
      const { randomBytes } = await import('crypto');
      const { sendLinkNoticeEmail } = await import('@/lib/mail');

      const token = randomBytes(32).toString('hex');
      const identifier = `unlink:${account.provider}:${account.providerAccountId}:${user.id}`;

      await prisma.verificationToken.create({
        data: { identifier, token, expires: new Date(Date.now() + 5 * 60 * 1000) },
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
