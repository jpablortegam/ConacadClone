import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TaskStatus } from '@prisma/client';

export default async function CourseOverview({ params }: { params: { id: string } }) {
    const course = await prisma.course.findUnique({
        where: { id: params.id },
        select: { id: true, title: true },
    });
    if (!course) notFound();

    const now = new Date();
    const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [tasks, exams] = await Promise.all([
        prisma.task.findMany({
            where: {
                courseId: course.id,
                status: TaskStatus.PUBLISHED,
                OR: [{ dueDate: { gte: now, lte: in7d } }, { dueDate: null }],
            },
            orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
            take: 5,
            select: { id: true, title: true, dueDate: true },
        }),
        prisma.exam.findMany({
            where: { courseId: course.id, scheduledDate: { gte: now, lte: in7d } },
            orderBy: { scheduledDate: 'asc' },
            take: 5,
            select: { id: true, title: true, scheduledDate: true },
        }),
    ]);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" /> Próximas tareas
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {tasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay tareas en los próximos días.</p>
                    ) : (
                        tasks.map(t => (
                            <div key={t.id} className="flex items-center justify-between text-sm">
                                <span>{t.title}</span>
                                <Link href={`/dashboard/courses/${course.id}/tasks/${t.id}`}>
                                    <Button size="sm" variant="outline">Ver</Button>
                                </Link>
                            </div>
                        ))
                    )}
                    <div className="pt-2">
                        <Button asChild size="sm" variant="ghost">
                            <Link href={`/dashboard/courses/${course.id}/tasks`}>Ver todas</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Exámenes próximos
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {exams.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sin exámenes próximos.</p>
                    ) : (
                        exams.map(e => (
                            <div key={e.id} className="flex items-center justify-between text-sm">
                                <span>{e.title}</span>
                                <span className="text-muted-foreground">
                                    {new Date(e.scheduledDate!).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                        ))
                    )}
                    <div className="pt-2">
                        <Button asChild size="sm" variant="ghost">
                            <Link href={`/dashboard/courses/${course.id}/exams`}>Ver todos</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
