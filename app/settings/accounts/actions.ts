'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function unlinkProvider(provider: 'google' | 'github') {
  const session = await auth();
  if (!session?.user?.id) throw new Error('No session');

  const userId = session.user.id;
  const accountsCount = await prisma.account.count({ where: { userId } });
  if (accountsCount <= 1) {
    throw new Error('No puedes desvincular el último método de acceso.');
  }

  await prisma.account.deleteMany({ where: { userId, provider } });
  await prisma.session.deleteMany({ where: { userId } });

  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'ACCOUNT_UNLINKED',
        entity: 'Account',
        entityId: provider,
        details: { provider },
      },
    });
  } catch {}

  revalidatePath('/settings/accounts');
}
