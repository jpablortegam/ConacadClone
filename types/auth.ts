// Tipos relacionados con autenticación
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string;
}

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}
