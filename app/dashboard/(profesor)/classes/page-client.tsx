'use client'

import { unstable_ViewTransition as ViewTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Calendar, Plus } from 'lucide-react'

type Course = {
  id: string
  title: string
  description: string | null
  isActive: boolean
  createdAt: Date
  _count: {
    enrollments: number
    tasks: number
  }
}

export default function ClassesPageClient({ courses }: { courses: Course[] }) {
  return (
    <ViewTransition>
      <div className="space-y-6">
        <ViewTransition name="experimental-label">
          <b className="text-gray-800 inline-block">{`<ViewTransition>`}</b>
        </ViewTransition>
        
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            ← Back to dashboard
          </Link>
        </div>
        
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
              <BookOpen className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
              <p className="text-muted-foreground mb-4">Aún no tienes clases creadas.</p>
              <Link href="/dashboard/classes/new">
                <Button>Crear primera clase</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <Card key={course.id} className="relative border-gray-200">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ViewTransition name={`class-icon-${course.id}`}>
                        <div className="bg-primary/10 rounded-lg p-2">
                          <BookOpen className="text-primary h-4 w-4" />
                        </div>
                      </ViewTransition>
                      <Badge variant={course.isActive ? 'default' : 'secondary'} className="text-xs">
                        {course.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    
                    <ViewTransition name={`class-title-${course.id}`}>
                      <Link href={`/dashboard/classes/${course.id}`} className="inline-block">
                        <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                      </Link>
                    </ViewTransition>
                    
                    <ViewTransition name={`class-description-${course.id}`}>
                      <p className="text-gray-600 line-clamp-2 text-sm">
                        {course.description || 'Sin descripción'}
                      </p>
                    </ViewTransition>

                    <ViewTransition name={`class-stats-${course.id}`}>
                      <div className="text-muted-foreground flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {course._count.enrollments} estudiantes
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(course.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </ViewTransition>
                  </div>
                </CardContent>

                <div className="p-4 pt-0">
                  <Link href={`/dashboard/classes/${course.id}`} className="w-full">
                    <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200">
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ViewTransition>
  )
}