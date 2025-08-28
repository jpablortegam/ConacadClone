import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, User } from 'lucide-react';
import LinkAccounts from '@/app/settings/accounts/link-accounts';

export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="p-6">
        Necesitas iniciar sesión.{' '}
        <Link href="/sign-in" className="underline">
          Ir a login
        </Link>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: true },
  });

  const hasGoogle = !!user?.accounts.find((a) => a.provider === 'google');
  const hasGitHub = !!user?.accounts.find((a) => a.provider === 'github');

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Cuentas vinculadas</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mi cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">{user?.name ?? user?.email}</div>
          <div className="flex items-center gap-2">
            <Badge variant={hasGoogle ? 'default' : 'secondary'}>Google</Badge>
            <Badge variant={hasGitHub ? 'default' : 'secondary'}>GitHub</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Vincular / Desvincular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LinkAccounts hasGoogle={hasGoogle} hasGitHub={hasGitHub} />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-xs">
        Al vincular un proveedor, te enviaremos un correo de alerta con un enlace para desvincular
        si no fuiste tú.
      </p>
    </div>
  );
}
