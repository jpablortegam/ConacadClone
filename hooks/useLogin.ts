'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export function useLogin() {
  const router = useRouter();

  const handleSignIn = async (provider: 'google' | 'github') => {
    const res = await signIn(provider, {
      redirect: false,
      callbackUrl: '/dashboard',
    });
    if (res?.url) {
      router.replace(res.url);
    }
  };

  return { handleSignIn };
}
