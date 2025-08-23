import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ClassDetail({ params }: { params: { id: string } }) {
    const course = await prisma.course.findUnique({
        where: { id: params.id },
        include: {
            _count: { select: { enrollments: true, tasks: true, exams: true } },
            gradingConfig: true,
            academicPeriod: true,
        },
    });
    if (!course) notFound();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{course.title}</h1>
                    <p className="text-muted-foreground">
                        {course.description || 'Sin descripción'} ·{' '}
                        <Badge variant={course.isActive ? 'default' : 'secondary'}>
                            {course.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>{' '}
                        {course.academicPeriod ? `· ${course.academicPeriod.name}` : null}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/classes/${course.id}`}>
                        <Button variant="outline">Actualizar</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-4 w-4" /> Estudiantes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">
                        {course._count.enrollments}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" /> Tareas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">
                        {course._count.tasks}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Exámenes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">
                        {course._count.exams}
                    </CardContent>
                </Card>
            </div>

            {/* aquí podrías listar últimas tareas, avisos, etc. */}
        </div>
    );
}
