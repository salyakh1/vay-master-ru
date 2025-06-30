import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { MainNav } from '../components/navigation/MainNav';
import dynamic from 'next/dynamic';

const Feed = dynamic(() => import('../components/feed/Feed'), { ssr: false });

export default async function PublicationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Получаем id пользователей и магазинов, на которых подписан текущий пользователь
  const follows = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true }
  });
  const followingIds = follows.map(f => f.followingId);

  // Получаем публикации только от тех, на кого подписан пользователь
  const posts = await prisma.post.findMany({
    where: { authorId: { in: followingIds } },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      author: true,
      likes: true,
      comments: true,
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    }
  });

  // Получаем данные текущего пользователя
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      city: true
    }
  });
  if (!currentUser) return null;

  return (
    <>
      <MainNav />
      <Feed />
    </>
  );
} 