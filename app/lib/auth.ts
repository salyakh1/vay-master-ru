import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import type { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any> {
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

        return user;
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
        token.phone = user.phone ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = (typeof token.role === 'string' ? token.role : 'CLIENT') as UserRole;
        if (typeof token.city === 'string') session.user.city = token.city;
        session.user.phone = typeof token.phone === 'string' ? token.phone : undefined;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  }
}; 