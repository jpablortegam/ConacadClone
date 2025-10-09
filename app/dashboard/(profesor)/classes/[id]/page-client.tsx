'use client';

import { unstable_ViewTransition as ViewTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, ClipboardList, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Course = {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  _count: {
    enrollments: number;
    tasks: number;
    exams: number;
  };
  academicPeriod?: {
    name: string;
  } | null;
};

export default function ClassDetailClient({ course }: { course: Course }) {
  return (
    <ViewTransition>
      <div className="space-y-6">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard/classes" className="text-blue-500 hover:underline">
            ← Back to classes
          </Link>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <ViewTransition name={`class-icon-${course.id}`}>
                <div className="bg-primary/10 rounded-lg p-3">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
              </ViewTransition>
              <div>
                <div>
                  <ViewTransition name={`class-title-${course.id}`}>
                    <h1 className="mb-4 inline-block text-3xl font-bold tracking-tight">
                      {course.title}
                    </h1>
                  </ViewTransition>
                </div>
                <ViewTransition name={`class-description-${course.id}`}>
                  <p className="text-gray-600">
                    {course.description || 'Sin descripción'} ·{' '}
                    <Badge variant={course.isActive ? 'default' : 'secondary'}>
                      {course.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>{' '}
                    {course.academicPeriod ? `· ${course.academicPeriod.name}` : null}
                  </p>
                </ViewTransition>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/dashboard/classes/${course.id}/edit`}>
                <Button variant="outline">Actualizar</Button>
              </Link>
            </div>
          </div>

          <ViewTransition name={`class-stats-${course.id}`}>
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
                <CardContent className="text-2xl font-semibold">{course._count.tasks}</CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Exámenes
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">{course._count.exams}</CardContent>
              </Card>
            </div>
          </ViewTransition>

          <ViewTransition update="none">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Actividad Reciente</h2>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">
                    Aquí podrías mostrar las últimas tareas, avisos, calificaciones, etc.
                  </p>
                </CardContent>
              </Card>
            </div>
          </ViewTransition>
        </div>
      </div>
    </ViewTransition>
  );
}
