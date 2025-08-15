import 'next-auth';

interface Permission {
  name: string;
  resource: string;
  action: string;
}

declare module 'next-auth' {
  interface User {
    id: string;
    roleId?: string | null;
    role?: string | null;
  }

  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id: string;
      role?: string | null;
      permissions?: Permission[];
    } & import('next-auth/core/types').Session['user'];
  }
}
