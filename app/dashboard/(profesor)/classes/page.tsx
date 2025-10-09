import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { default as PageClient } from './page-client';

export default async function ClassesPage() {
  const session = await auth();
  const teacherId = session!.user!.id;

  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: { _count: { select: { enrollments: true, tasks: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return <PageClient courses={courses} />;
}
