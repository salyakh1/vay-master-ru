import { AuthOptions } from 'next-auth';
import { UserRole } from '@/types/user';
import { credentialsProvider } from './credentialsProvider';
import { prisma } from './prisma';

// Подробное логирование переменных окружения
console.log('=== ENV VARIABLES DEBUG ===');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('========================');

export const authOptions: AuthOptions = {
  providers: [credentialsProvider],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.city = user.city;
        token.email = user.email;
        token.name = user.name;
        token.isSetupComplete = user.isSetupComplete;
      }

      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isSetupComplete: true },
        });
        if (dbUser) {
          token.isSetupComplete = dbUser.isSetupComplete;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role || 'CLIENT';
        session.user.city = token.city as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.isSetupComplete = token.isSetupComplete;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 