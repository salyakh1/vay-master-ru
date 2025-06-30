import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

// Получить все чаты пользователя
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const chats = await prisma.chat.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: {
        include: { user: true },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(chats);
}

// Создать чат между двумя пользователями (если его нет)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { participantId } = await request.json();

  if (!participantId || participantId === userId) {
    return NextResponse.json({ error: 'Invalid participant ID' }, { status: 400 });
  }

  // Упрощенная и корректная логика поиска чата
  const chat = await prisma.chat.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: userId } } },
        { participants: { some: { userId: participantId } } }
      ]
    },
  });

  // Если чат найден, возвращаем его
  if (chat) {
    return NextResponse.json(chat);
  }

  // Если чат не найден, создаем новый
  const newChat = await prisma.chat.create({
    data: {
      participants: {
        create: [
          { userId: userId },
          { userId: participantId },
        ],
      },
    },
  });

  return NextResponse.json(newChat);
} 