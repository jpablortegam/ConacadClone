import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Calendar, Plus } from 'lucide-react';

export default async function ClassesPage() {
    const session = await auth();
    const teacherId = session!.user!.id;

    const courses = await prisma.course.findMany({
        where: { teacherId },
        include: { _count: { select: { enrollments: true, tasks: true } } },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Mis Clases</h1>
                <Link href="/dashboard/classes/new">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Nueva Clase
                    </Button>
                </Link>
            </div>

            {courses.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="mb-4 text-muted-foreground">Aún no tienes clases creadas.</p>
                        <Link href="/dashboard/classes/new">
                            <Button>Crear primera clase</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {courses.map(c => (
                        <Link key={c.id} href={`/dashboard/classes/${c.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/20">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <BookOpen className="h-4 w-4 text-primary" />
                                            </div>
                                            <Badge variant={c.isActive ? 'default' : 'secondary'} className="text-xs">
                                                {c.isActive ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold line-clamp-1">{c.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {c.description || 'Sin descripción'}
                                    </p>
                                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" /> {c._count.enrollments} estudiantes
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(c.createdAt).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
