export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });

  const vt = await prisma.verificationToken.findFirst({ where: { token } });
  if (!vt || vt.expires < new Date()) {
    return NextResponse.json({ ok: false, error: 'Token inválido o expirado' }, { status: 400 });
  }

  // identifier = unlink:provider:providerAccountId:userId
  const [prefix, provider, providerAccountId, userId] = vt.identifier.split(':');
  if (prefix !== 'unlink') {
    return NextResponse.json({ ok: false, error: 'Token inválido' }, { status: 400 });
  }

  // Borra la cuenta vinculada
  const account = await prisma.account.findFirst({ where: { provider, providerAccountId } });

  if (account) {
    // Seguridad: evita dejar al usuario sin ningún método de acceso
    const remaining = await prisma.account.count({ where: { userId: account.userId } });
    if (remaining <= 1) {
      // Si fueras a usar Credentials, aquí permitirías continuar si existe password local
      return NextResponse.json(
        { ok: false, error: 'No puedes desvincular el último método de acceso.' },
        { status: 400 }
      );
    }

    await prisma.account.delete({ where: { id: account.id } });
    await prisma.session.deleteMany({ where: { userId: account.userId } });

    try {
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'ACCOUNT_UNLINKED',
          entity: 'Account',
          entityId: providerAccountId,
          details: { provider },
        },
      });
    } catch {}
  }

  // Consume el token (composite key -> usa deleteMany para evitar problemas de input)
  await prisma.verificationToken.deleteMany({
    where: { identifier: vt.identifier, token: vt.token },
  });

  // Redirige a una página de confirmación
  return NextResponse.redirect(new URL('/settings/accounts?unlinked=1', req.url));
}
