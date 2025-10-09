'use client';

import { unstable_ViewTransition as ViewTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Calendar } from 'lucide-react';

type TeacherCoursePreview = {
  id: string;
  name: string;
  description: string | null;
  studentCount: number;
  isActive: boolean;
  createdAt: Date;
};

interface ClassCardClientProps {
  courseClass: TeacherCoursePreview;
}

export function ClassCardClient({ courseClass }: ClassCardClientProps) {
  return (
    <Link key={courseClass.id} href={`/dashboard/classes/${courseClass.id}`}>
      <Card className="hover:border-primary/20 group h-full cursor-pointer border-2 transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <ViewTransition name={`class-icon-${courseClass.id}`}>
                <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2 transition-colors">
                  <BookOpen className="text-primary h-4 w-4" />
                </div>
              </ViewTransition>
              <Badge variant={courseClass.isActive ? 'default' : 'secondary'} className="text-xs">
                {courseClass.isActive ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </div>

            <h4 className="group-hover:text-primary mb-2 line-clamp-1 text-base font-semibold transition-colors inline-block">
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
}