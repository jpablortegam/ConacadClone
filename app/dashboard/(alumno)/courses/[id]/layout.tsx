import { ReactNode } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function CourseStudentLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: { id: string }; // si usas slug: { slug: string }
}) {
    const session = await auth();
    if (!session?.user?.id) redirect('/sign-in');

    // Verifica matrícula
    const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: session.user.id, courseId: params.id } },
        select: { course: { select: { id: true, title: true, isActive: true } } },
    });
    if (!enrollment) redirect('/dashboard/courses'); // no inscrito
    const course = enrollment.course;

    const tabs = [
        { href: `/dashboard/courses/${course.id}`, label: 'Resumen' },
        { href: `/dashboard/courses/${course.id}/lessons`, label: 'Lecciones' },
        { href: `/dashboard/courses/${course.id}/tasks`, label: 'Tareas' },
        { href: `/dashboard/courses/${course.id}/exams`, label: 'Exámenes' },
        { href: `/dashboard/courses/${course.id}/resources`, label: 'Recursos' },
        { href: `/dashboard/courses/${course.id}/announcements`, label: 'Avisos' },
        { href: `/dashboard/courses/${course.id}/syllabus`, label: 'Programa' },
        { href: `/dashboard/courses/${course.id}/grades`, label: 'Calificaciones' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{course.title}</h1>
                <Badge variant={course.isActive ? 'default' : 'secondary'}>
                    {course.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
            </div>

            <Card>
                <CardContent className="p-0">
                    <nav className="flex gap-2 overflow-x-auto p-2 border-b">
                        {tabs.map(t => (
                            <Link
                                key={t.href}
                                href={t.href}
                                className="px-3 py-2 text-sm rounded-md hover:bg-muted whitespace-nowrap"
                            >
                                {t.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="p-4">{children}</div>
                </CardContent>
            </Card>
        </div>
    );
}
