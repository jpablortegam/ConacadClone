import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: number;
    roleId?: number | null;
    role?: string | null; 
  }

  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id: number;
      role?: string | null; 
    } & import("next-auth/core/types").Session["user"];
  }
}