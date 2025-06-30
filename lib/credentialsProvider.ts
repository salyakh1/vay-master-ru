import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs";

export const credentialsProvider = CredentialsProvider({
  name: 'credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' }
  },
  async authorize(credentials) {
    console.log('=== AUTHORIZE DEBUG ===');
    console.log('Authorize attempt for email:', credentials?.email);

    if (!credentials?.email || !credentials?.password) {
      console.log('Missing credentials');
      throw new Error('Email и пароль обязательны');
    }

    const user = await prisma.user.findUnique({
      where: {
        email: credentials.email
      },
      include: {
        shopCategories: true,
        products: true
      }
    });

    if (!user) {
      console.log('User not found');
      throw new Error('Пользователь не найден');
    }

    console.log('User found:', { id: user.id, email: user.email, role: user.role });

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      console.log('Invalid password');
      throw new Error('Неверный пароль');
    }

    console.log('Authorization successful');
    console.log('========================');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      city: user.city,
      phone: user.phone,
      isSetupComplete: user.isSetupComplete,
      hasDelivery: user.hasDelivery,
      workingHours: user.workingHours,
      shopCategories: user.shopCategories,
      products: user.products
    };
  }
}); 