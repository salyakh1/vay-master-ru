import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Неавторизован', { status: 401 });
  }

  const postId = params.id;

  if (!postId) {
    return new NextResponse('ID публикации не найден', { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return new NextResponse('Публикация не найдена', { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return new NextResponse('Вы не можете удалить эту публикацию', { status: 403 });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: 'Публикация удалена' });
  } catch (error) {
    console.error('Ошибка при удалении публикации:', error);
    return new NextResponse('Внутренняя ошибка сервера', { status: 500 });
  }
} 