// app/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AlumnoDashboard from '@/components/dashboards/AlumnoDashboard';
import ProfesorDashboard from '@/components/dashboards/ProfesorDashboard';
import { prisma } from '@/lib/prisma';

const PageDashboard = async () => {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/sign-in');
  }

  let userRole: string | null = null;

  if (session.user.id) {
    const userWithRole = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: { select: { name: true } } },
    });
    userRole = userWithRole?.role?.name ?? null;
  }

  const renderDashboard = () => {
    switch (userRole) {
      case 'profesor':
        return <ProfesorDashboard />;
      case 'alumno':
        return <AlumnoDashboard />;
      case null:
      case undefined:
        return <div>Rol no asignado o desconocido. Por favor, contacta a soporte.</div>;
      default:
        return <div>Rol no reconocido: {userRole}.</div>;
    }
  };

  return <div className="mt-8">{renderDashboard()}</div>;
};
export default PageDashboard;
