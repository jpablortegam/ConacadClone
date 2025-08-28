import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Calendar, LogIn, LogOut, ClipboardList, FileText } from 'lucide-react';
import { TaskStatus } from '@prisma/client';

export default async function AlumnoDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const studentId = session.user.id;

  // -------- Server Actions ----------
  async function joinCourse(formData: FormData) {
    'use server';
    const s = await auth();
    if (!s?.user?.id) redirect('/sign-in');

    const raw = String(formData.get('joinCode') || '').trim();
    const joinCode = raw.toUpperCase();
    if (!joinCode) redirect('/dashboard'); // simple fallback

    // Buscar curso por código
    const course = await prisma.course.findUnique({
      where: { joinCode },
      include: { _count: { select: { enrollments: true } } },
    });

    if (!course || !course.isActive) {
      // curso no existe o inactivo
      redirect('/dashboard');
    }

    // Validaciones opcionales según tu schema
    const now = new Date();
    if (course.enrollmentDeadline && course.enrollmentDeadline < now) {
      redirect('/dashboard');
    }
    if (typeof course.maxStudents === 'number' && course._count.enrollments >= course.maxStudents) {
      redirect('/dashboard');
    }

    // Evitar duplicado (unique [studentId, courseId])
    try {
      await prisma.enrollment.create({
        data: {
          studentId: s.user.id,
          courseId: course.id,
        },
      });
    } catch {
      // Si ya está inscrito u otro error, simplemente vuelve
    }

    revalidatePath('/dashboard');
    redirect('/dashboard');
  }

  async function leaveCourse(formData: FormData) {
    'use server';
    const s = await auth();
    if (!s?.user?.id) redirect('/sign-in');

    const courseId = String(formData.get('courseId') || '');
    if (!courseId) redirect('/dashboard');

    // Borra la matrícula del alumno en ese curso
    await prisma.enrollment
      .delete({
        where: {
          studentId_courseId: { studentId: s.user.id, courseId },
        },
      })
      .catch(() => {
        /* si no existía, ignorar */
      });

    revalidatePath('/dashboard');
    redirect('/dashboard');
  }

  // -------- Datos del alumno ----------
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          isActive: true,
          _count: { select: { tasks: true } },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  const courseIds = enrollments.map((e) => e.course.id);
  const now = new Date();
  const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [upcomingTasks, upcomingExams] = courseIds.length
    ? await Promise.all([
        prisma.task.count({
          where: {
            courseId: { in: courseIds },
            status: TaskStatus.PUBLISHED,
            OR: [
              { dueDate: { gte: now, lte: in7d } },
              { dueDate: null }, // si quieres considerar tareas sin fecha
            ],
          },
        }),
        prisma.exam.count({
          where: {
            courseId: { in: courseIds },
            scheduledDate: { gte: now, lte: in7d },
          },
        }),
      ])
    : [0, 0];

  // -------- UI ----------
  return (
    <div className="space-y-6">
      {/* JOIN POR CÓDIGO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Unirme a una clase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={joinCourse} className="grid max-w-md gap-3">
            <div>
              <label className="mb-1 block text-sm">Código de clase</label>
              <Input name="joinCode" placeholder="EJ: AB12CD34" autoComplete="off" />
              <p className="text-muted-foreground mt-1 text-xs">
                Pide al profesor el <strong>joinCode</strong> para inscribirte.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Unirme</Button>
              <Button type="reset" variant="outline">
                Limpiar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Cursos inscritos</p>
                <p className="text-2xl font-bold">{enrollments.length}</p>
              </div>
              <BookOpen className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Tareas (7 días)</p>
                <p className="text-2xl font-bold">{upcomingTasks}</p>
              </div>
              <ClipboardList className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Exámenes (7 días)</p>
                <p className="text-2xl font-bold">{upcomingExams}</p>
              </div>
              <FileText className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MIS CURSOS */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Mis cursos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              Aún no estás inscrito en ningún curso. Únete con un código arriba.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {enrollments.map((e) => (
                <Card key={e.course.id} className="hover:border-primary/20 border-2 transition">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="line-clamp-1 font-semibold">{e.course.title}</h3>
                      <Badge variant={e.course.isActive ? 'default' : 'secondary'}>
                        {e.course.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                      {e.course.description || 'Sin descripción'}
                    </p>

                    <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Tareas: {e.course._count.tasks}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(e.course.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/courses/${e.course.id}`}>Ir al curso</Link>
                      </Button>

                      {/* Salir del curso como formulario (sin onClick en Server Component) */}
                      <form action={leaveCourse}>
                        <input type="hidden" name="courseId" value={e.course.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          <LogOut className="mr-1 h-4 w-4" />
                          Salir
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
