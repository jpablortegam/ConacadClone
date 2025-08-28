import 'next-auth';

interface Permission {
  name: string;
  resource: string;
  action: string;
}

interface Account {
  provider: string;
  providerAccountId: string;
  type: string;
  userId?: string;
}

declare module 'next-auth' {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    roleId?: string | null;
    role?: string | null;
    permissions?: Permission[];
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
