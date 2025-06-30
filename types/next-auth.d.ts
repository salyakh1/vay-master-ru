import 'next-auth';
import { User } from './user';
import { DefaultSession } from 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isSetupComplete?: boolean;
      firstName?: string | null;
      lastName?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
    isSetupComplete?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    isSetupComplete?: boolean;
  }
} 