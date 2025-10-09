// app/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AlumnoDashboard from '@/components/dashboards/AlumnoDashboard';
import ProfesorDashboard from '@/components/dashboards/ProfesorDashboard';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';

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
        return (
          <Suspense fallback={
            <div className="container mx-auto max-w-7xl space-y-6 p-6">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="grid gap-4 md:grid-cols-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          }>
            <ProfesorDashboard />
          </Suspense>
        );
      case 'alumno':
        return (
          <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
            <AlumnoDashboard />
          </Suspense>
        );
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

// 🟡 PPR parcial - layout estático, contenido dinámico
export const experimental_ppr = true;
