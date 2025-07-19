'use server';

import { signIn } from '@/lib/auth';
import { z } from 'zod';
import { FormState } from '@/lib/zod/definitions';
import { AuthError } from 'next-auth';

// Esquema de validación para login
const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }).trim(),
});

// Acciones para OAuth
export async function signInWithGoogle() {
  try {
    await signIn('google', { redirectTo: '/dashboard' });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'OAuthSignInError':
          return { error: 'Error signing in with Google' };
        default:
          return { error: 'Something went wrong' };
      }
    }
    throw error;
  }
}

export async function signInWithGitHub() {
  try {
    await signIn('github', { redirectTo: '/dashboard' });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'OAuthSignInError':
          return { error: 'Error signing in with GitHub' };
        default:
          return { error: 'Something went wrong' };
      }
    }
    throw error;
  }
}

// Acción para login con credenciales
export async function loginAction(prevState: FormState, formData: FormData): Promise<FormState> {
  // Validar los datos del formulario
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // Si la validación falla, retornar errores
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields.',
    };
  }

  // Extraer datos validados
  const { email, password } = validatedFields.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { message: 'Invalid credentials.' };
        default:
          return { message: 'Something went wrong.' };
      }
    }
    throw error;
  }
}

// Alternativa: Si quieres usar el esquema que ya tienes
export async function loginActionWithValues(
  values: z.infer<typeof LoginSchema>
): Promise<{ success?: boolean; error?: string }> {
  try {
    // Validar primero
    const validatedData = LoginSchema.parse(values);

    const result = await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    if (result?.error) {
      return { error: 'Invalid credentials' };
    }

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data' };
    }
    return { error: 'Something went wrong' };
  }
}
