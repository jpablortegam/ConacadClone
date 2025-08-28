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
  FileText,
  AlertCircle,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Suspense } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Tipos más robustos
type TeacherCoursePreview = {
  id: string;
  name: string;
  description: string | null;
  studentCount: number;
  isActive: boolean;
  createdAt: Date;
};

type UserWithRole = {
  role: {
    name: string;
  } | null;
} | null;

type DashboardStats = {
  totalClasses: number;
  totalStudents: number;
  activeClasses: number;
  averageStudentsPerClass: number;
};

// Componente para estadísticas con loading
const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  isLoading = false,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isLoading?: boolean;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">
            {isLoading ? <div className="bg-muted h-8 w-16 animate-pulse rounded" /> : value}
          </p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </CardContent>
  </Card>
);

// Componente para clases con mejor manejo de estados
const ClassCard = ({ courseClass }: { courseClass: TeacherCoursePreview }) => (
  <Link key={courseClass.id} href={`/dashboard/classes/${courseClass.id}`}>
    <Card className="hover:border-primary/20 group h-full cursor-pointer border-2 transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2 transition-colors">
              <BookOpen className="text-primary h-4 w-4" />
            </div>
            <Badge variant={courseClass.isActive ? 'default' : 'secondary'} className="text-xs">
              {courseClass.isActive ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
        </div>

        <h4 className="group-hover:text-primary mb-2 line-clamp-1 text-base font-semibold transition-colors">
          {courseClass.name}
        </h4>
        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
          {courseClass.description || 'Sin descripción disponible'}
        </p>

        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {courseClass.studentCount} estudiante{courseClass.studentCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(courseClass.createdAt).toLocaleDateString('es-ES')}
          </span>
        </div>
      </CardContent>
    </Card>
  </Link>
);

// Función para calcular estadísticas
const calculateStats = (classes: TeacherCoursePreview[]): DashboardStats => {
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0);
  const activeClasses = classes.filter((cls) => cls.isActive).length;
  const averageStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

  return {
    totalClasses,
    totalStudents,
    activeClasses,
    averageStudentsPerClass,
  };
};

// Función para obtener datos del usuario de forma más robusta
const getUserData = async (
  userId: string
): Promise<{
  userRole: string | null;
  teacherClasses: TeacherCoursePreview[];
  error: string | null;
}> => {
  try {
    // Obtener rol del usuario
    const userWithRole: UserWithRole = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: {
          select: { name: true },
        },
      },
    });

    const userRole = userWithRole?.role?.name ?? null;

    // Obtener cursos con datos más completos
    const courses = await prisma.course.findMany({
      where: {
        teacherId: userId,
        // Opcional: filtrar solo cursos no eliminados si tienes soft delete
        // deletedAt: null
      },
      include: {
        _count: {
          select: {
            enrollments: true, // Contamos todas las inscripciones por ahora
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      // Limitar resultados para optimizar
      take: 100,
    });

    const teacherClasses: TeacherCoursePreview[] = courses.map((course) => ({
      id: course.id,
      name: course.title,
      description: course.description,
      studentCount: course._count.enrollments,
      isActive: course.isActive,
      createdAt: course.createdAt,
    }));

    return {
      userRole,
      teacherClasses,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      userRole: null,
      teacherClasses: [],
      error: error instanceof Error ? error.message : 'Error desconocido al cargar datos',
    };
  }
};

// Función para formatear fecha más robusta
const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'No especificado';

  try {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Fecha inválida';
  }
};

// Componente principal
const PageDashboard = async () => {
  // Validación de sesión mejorada
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Validación de expiración de sesión más robusta
  if (session.expires) {
    const currentTime = new Date().getTime();
    const expirationTime = new Date(session.expires).getTime();

    if (expirationTime < currentTime) {
      redirect('/sign-in');
    }
  }

  // Obtener datos del usuario
  const { userRole, teacherClasses, error } = await getUserData(session.user.id);

  // Calcular estadísticas
  const stats = calculateStats(teacherClasses);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Header mejorado */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Profesores</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido, {session.user?.name || 'Profesor'}
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Link href="/dashboard/classes/new" className="flex-1 sm:flex-initial">
            <Button className="flex w-full items-center gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              Nueva Clase
            </Button>
          </Link>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/sign-in' });
            }}
          >
            <Button type="submit" variant="outline">
              Cerrar Sesión
            </Button>
          </form>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error al cargar datos: {error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas con Suspense */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted h-32 animate-pulse rounded-lg" />
            ))}
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Clases"
            value={stats.totalClasses}
            icon={BookOpen}
            color="text-blue-600"
          />
          <StatsCard
            title="Total Estudiantes"
            value={stats.totalStudents}
            icon={Users}
            color="text-green-600"
          />
          <StatsCard
            title="Clases Activas"
            value={stats.activeClasses}
            icon={GraduationCap}
            color="text-purple-600"
          />
          <StatsCard
            title="Promedio/Clase"
            value={stats.averageStudentsPerClass}
            icon={ChartBar}
            color="text-orange-600"
          />
        </div>
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Información del Usuario mejorada */}
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
                <User className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Nombre:</span>
                <span className="truncate text-sm">{session.user?.name || 'No especificado'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Email:</span>
                <span className="truncate text-sm">{session.user?.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Settings className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Rol:</span>
                <Badge variant={userRole ? 'default' : 'secondary'}>
                  {userRole || 'No asignado'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Sesión expira:</span>
                <span className="text-sm">{formatDate(session.expires)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                <span className="font-medium">ID:</span>
                <code className="bg-muted max-w-32 truncate rounded px-2 py-1 text-xs">
                  {session.user?.id}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Clases mejorada */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Mis Clases ({teacherClasses.length})
            </CardTitle>
            {teacherClasses.length > 0 && (
              <Link href="/dashboard/classes">
                <Button variant="outline" size="sm">
                  Ver Todas
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {teacherClasses.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-medium">No tienes clases aún</h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primera clase para comenzar a enseñar
                </p>
                <Link href="/dashboard/classes/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Clase
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {teacherClasses.slice(0, 4).map((courseClass) => (
                  <ClassCard key={courseClass.id} courseClass={courseClass} />
                ))}

                {teacherClasses.length > 4 && (
                  <Link href="/dashboard/classes">
                    <Card className="border-muted-foreground/25 hover:border-primary/50 h-full cursor-pointer border-2 border-dashed transition-shadow hover:shadow-md">
                      <CardContent className="flex h-full items-center justify-center p-4">
                        <div className="text-center">
                          <Plus className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                          <p className="text-muted-foreground text-sm font-medium">
                            Ver {teacherClasses.length - 4} clase
                            {teacherClasses.length - 4 !== 1 ? 's' : ''} más
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

      {/* Acciones Rápidas mejoradas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/classes/new">
              <Button
                variant="outline"
                className="hover:bg-primary/5 h-20 w-full flex-col gap-2 transition-colors"
              >
                <Plus className="h-6 w-6" />
                <span>Nueva Clase</span>
              </Button>
            </Link>

            <Link href="/dashboard/students">
              <Button
                variant="outline"
                className="hover:bg-primary/5 h-20 w-full flex-col gap-2 transition-colors"
              >
                <Users className="h-6 w-6" />
                <span>Gestionar Estudiantes</span>
              </Button>
            </Link>

            <Link href="/dashboard/assignments">
              <Button
                variant="outline"
                className="hover:bg-primary/5 h-20 w-full flex-col gap-2 transition-colors"
              >
                <FileText className="h-6 w-6" />
                <span>Tareas</span>
              </Button>
            </Link>

            <Link href="/dashboard/reports">
              <Button
                variant="outline"
                className="hover:bg-primary/5 h-20 w-full flex-col gap-2 transition-colors"
              >
                <ChartBar className="h-6 w-6" />
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
