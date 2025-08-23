import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Plus,
  BookOpen,
  Users,
  Settings,
  GraduationCap,
  ChartBar,
  FileText
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

type TeacherCoursePreview = {
  id: string;
  name: string;              // <- viene de Course.title
  description: string | null;
  studentCount: number;      // <- _count.enrollments
  isActive: boolean;
  createdAt: Date;
};

const PageDashboard = async () => {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/sign-in');
  }

  const currentTime = new Date().getTime();
  if (session.expires && new Date(session.expires).getTime() < currentTime) {
    redirect('/sign-in');
  }

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  // --- Datos del usuario y cursos (ajustado a tu schema) ---
  let userRole: string | null = null;
  let teacherClasses: TeacherCoursePreview[] = [];
  let totalStudents = 0;

  if (session.user.id) {
    const userWithRole = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: { select: { name: true } } },
    });
    userRole = userWithRole?.role?.name ?? null;

    try {
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        include: {
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      teacherClasses = courses.map((c) => ({
        id: c.id,
        name: c.title,                    // <- title → name para reusar tu UI
        description: c.description ?? null,
        studentCount: c._count.enrollments,
        isActive: c.isActive,
        createdAt: c.createdAt,
      }));

      totalStudents = teacherClasses.reduce((sum, cls) => sum + cls.studentCount, 0);
    } catch (error) {
      console.log('Error fetching courses:', error);
      // En caso de error, mantenemos arrays vacíos
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Profesores</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido, {session.user?.name || 'Profesor'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/classes/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Clase
            </Button>
          </Link>
          <form
            action={async () => {
              'use server';
              const currentSession = await auth();
              if (!currentSession) {
                redirect('/sign-in');
              }
              await signOut();
            }}
          >
            <Button type="submit" variant="outline">
              Cerrar Sesión
            </Button>
          </form>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clases</p>
                <p className="text-2xl font-bold">{teacherClasses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Estudiantes</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clases Activas</p>
                <p className="text-2xl font-bold">
                  {teacherClasses.filter((cls) => cls.isActive).length}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio/Clase</p>
                <p className="text-2xl font-bold">
                  {teacherClasses.length > 0
                    ? Math.round(totalStudents / teacherClasses.length)
                    : 0}
                </p>
              </div>
              <ChartBar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Información del Usuario */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Mi Información
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Nombre:</span>
                <span className="text-sm">{session.user?.name || 'No especificado'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Email:</span>
                <span className="text-sm">{session.user?.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Settings className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Rol:</span>
                <Badge variant="secondary">{userRole || 'No asignado'}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Sesión expira:</span>
                <span className="text-sm">
                  {session.expires ? formatDate(session.expires) : 'No especificado'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">ID:</span>
                <code className="bg-muted rounded px-2 py-1 text-xs">{session.user?.id}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Clases / Courses */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Mis Clases
            </CardTitle>
            <Link href="/dashboard/classes">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {teacherClasses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No tienes clases aún</h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primera clase para comenzar a enseñar
                </p>
                <Link href="/dashboard/classes/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Clase
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {teacherClasses.slice(0, 4).map((cls) => (
                  <Link key={cls.id} href={`/dashboard/classes/${cls.id}`}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <Badge
                              variant={cls.isActive ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {cls.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </div>
                        </div>

                        <h4 className="font-semibold text-base mb-2 line-clamp-1">{cls.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {cls.description || 'Sin descripción disponible'}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {cls.studentCount} estudiantes
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(cls.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}

                {teacherClasses.length > 4 && (
                  <Link href="/dashboard/classes">
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-muted-foreground/25 hover:border-primary/50">
                      <CardContent className="p-4 h-full flex items-center justify-center">
                        <div className="text-center">
                          <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium text-muted-foreground">
                            Ver {teacherClasses.length - 4} clases más
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/dashboard/classes/new">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Plus className="h-6 w-6 mb-2" />
                <span>Nueva Clase</span>
              </Button>
            </Link>

            <Link href="/dashboard/students">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span>Gestionar Estudiantes</span>
              </Button>
            </Link>

            <Link href="/dashboard/assignments">
              <Button variant="outline" className="w-full h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                <span>Tareas</span>
              </Button>
            </Link>

            <Link href="/dashboard/reports">
              <Button variant="outline" className="w-full h-20 flex-col">
                <ChartBar className="h-6 w-6 mb-2" />
                <span>Reportes</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageDashboard;
