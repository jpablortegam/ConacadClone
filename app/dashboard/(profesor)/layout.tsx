import { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function ProfesorGroupLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: { select: { name: true } } },
  });

  if (user?.role?.name !== 'profesor') {
    redirect('/dashboard'); // vuelve al dashboard base (switch por rol)
  }

  return <>{children}</>;
}
