import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function genJoinCode(len = 8) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
}

export default function NewClassPage() {
    async function createCourse(formData: FormData) {
        'use server';
        const session = await auth();
        if (!session?.user?.id) redirect('/sign-in');

        const title = String(formData.get('title') || '').trim();
        const description = String(formData.get('description') || '').trim() || null;
        if (!title) throw new Error('El título es obligatorio');

        const joinCode = genJoinCode();

        await prisma.course.create({
            data: {
                title,
                description,
                joinCode,
                teacherId: session.user.id,
            },
        });

        revalidatePath('/dashboard/classes');
        redirect('/dashboard/classes');
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Crear Clase</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={createCourse} className="space-y-4 max-w-xl">
                    <div>
                        <label className="block text-sm mb-1">Título</label>
                        <Input name="title" placeholder="Programación 1" required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Descripción</label>
                        <Textarea name="description" placeholder="Descripción opcional" />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit">Crear</Button>
                        <Button asChild variant="outline">
                            <Link href="/dashboard/classes">Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
