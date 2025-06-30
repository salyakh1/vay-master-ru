import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@prisma/client';

const VALID_ROLES = ['MASTER', 'CLIENT', 'SHOP'];

export async function POST(req: Request) {
  try {
    console.log('=== REGISTER API DEBUG ===');
    const body = await req.json();
    console.log('Register request body:', body);

    const { email, password, role, name, phone, city, firstName, lastName } = body;

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Registration failed: User already exists');
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        name: name || ((firstName || '') + ' ' + (lastName || '')).trim(),
        firstName,
        lastName,
        phone,
        city
      }
    });

    console.log('User created successfully:', { id: user.id, email: user.email, role: user.role });
    console.log('========================');

    return NextResponse.json({ 
      success: true,
      role: user.role
    });

  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при регистрации' },
      { status: 500 }
    );
  }
} 