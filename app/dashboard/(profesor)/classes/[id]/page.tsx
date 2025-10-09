import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { default as PageClient } from './page-client';

export default async function ClassDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // ✅ SEGURIDAD: Verificar autenticación
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }
  
  // ✅ SEGURIDAD: Solo buscar clases del profesor autenticado
  const course = await prisma.course.findFirst({
    where: { 
      id,
      teacherId: session.user.id // ✅ Verificar propiedad
    },
    include: {
      _count: { select: { enrollments: true, tasks: true, exams: true } },
      gradingConfig: true,
      academicPeriod: true,
    },
  });

  if (!course) notFound();

  return <PageClient course={course} />;
}
