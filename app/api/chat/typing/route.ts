import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Хранилище статусов печати (в реальном приложении лучше использовать Redis)
const typingStatus = new Map<string, { userId: string; timestamp: number }>();

// Обновить статус печати
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { chatId } = await request.json();
  if (!chatId) {
    return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
  }

  const key = `${chatId}:${session.user.id}`;
  typingStatus.set(key, {
    userId: session.user.id,
    timestamp: Date.now(),
  });

  // Удаляем статус через 3 секунды
  setTimeout(() => {
    typingStatus.delete(key);
  }, 3000);

  return NextResponse.json({ success: true });
}

// Получить статус печати
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

  // Получаем все статусы печати для этого чата
  const typingUsers = Array.from(typingStatus.entries())
    .filter(([key]) => key.startsWith(`${chatId}:`))
    .filter(([key]) => !key.endsWith(`:${session.user.id}`)) // Исключаем текущего пользователя
    .map(([_, value]) => value)
    .filter(({ timestamp }) => Date.now() - timestamp < 3000); // Только активные за последние 3 секунды

  return NextResponse.json({ typingUsers });
} 