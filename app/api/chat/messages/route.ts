import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Получить сообщения чата
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
  }

  // Проверяем, является ли пользователь участником чата
  const isParticipant = await prisma.chatParticipant.findFirst({
    where: {
      chatId,
      userId: session.user.id,
    },
  });

  if (!isParticipant) {
    return NextResponse.json({ error: 'Not a chat participant' }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: {
      chatId,
    },
    include: {
      sender: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return NextResponse.json(messages);
}

// Отправить сообщение в чат
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { chatId, content } = await request.json();

  if (!chatId || !content) {
    return NextResponse.json(
      { error: 'Chat ID and content are required' },
      { status: 400 }
    );
  }

  // Проверяем, является ли пользователь участником чата
  const isParticipant = await prisma.chatParticipant.findFirst({
    where: {
      chatId,
      userId: session.user.id,
    },
  });

  if (!isParticipant) {
    return NextResponse.json({ error: 'Not a chat participant' }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      content,
      chat: { connect: { id: chatId } },
      sender: { connect: { id: session.user.id } },
    },
    include: {
      sender: true,
    },
  });

  // Обновляем время последнего обновления чата
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(message);
}

// Удалить все сообщения чата
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { chatId } = await request.json();

  if (!chatId) {
    return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
  }

  // Проверяем, является ли пользователь участником чата
  const isParticipant = await prisma.chatParticipant.findFirst({
    where: {
      chatId,
      userId: session.user.id,
    },
  });

  if (!isParticipant) {
    return NextResponse.json({ error: 'Not a chat participant' }, { status: 403 });
  }

  await prisma.message.deleteMany({
    where: {
      chatId,
    },
  });

  // Обновляем время последнего обновления чата
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ message: 'All messages deleted successfully' });
} 