import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) {
          return null;
        }

        // Возвращаем объект, совместимый с NextAuth User
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          city: user.city,
          isSetupComplete: user.isSetupComplete,
          firstName: user.firstName,
          lastName: user.lastName
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.city = user.city;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = (typeof token.role === 'string' ? token.role : 'CLIENT') as UserRole;
        if (typeof token.city === 'string') session.user.city = token.city;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  }
});

export { handler as GET, handler as POST }; 