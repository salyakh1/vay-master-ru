import dynamic from 'next/dynamic';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import type { Post, UserRole } from '@/types/user';
import { authOptions } from '@/lib/authOptions';
import InfiniteFeed from './InfiniteFeed';
import FeedFilter from './FeedFilter';
import { Suspense, useState } from 'react';
import PostSkeleton from './PostSkeleton';
import { UserProfile } from '../profile/UserProfile';
import { FaSearch } from 'react-icons/fa';
import { redirect } from 'next/navigation';

const FeedClient = dynamic(() => import('./FeedClient'), { ssr: false });

export default async function Feed() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

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

  if (!currentUser) {
    return null;
  }

  // Получаем id пользователей, на которых подписан текущий пользователь
  const follows = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true }
  });
  const followingIds = follows.map(f => f.followingId);

  // Получаем публикации только от тех, на кого подписан пользователь
  const favoritePosts = await prisma.post.findMany({
    where: { authorId: { in: followingIds } },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          city: true
        }
      },
      likes: true,
      _count: {
        select: { likes: true, comments: true }
      }
    }
  });

  // Получаем все публикации (мастеров и магазинов)
  const allPosts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      images: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          city: true
        }
      },
      likes: true,
      _count: {
        select: { likes: true, comments: true }
      }
    }
  });

  return (
    <FeedClient
      favoriteUsers={[]}
      favoritePosts={favoritePosts}
      allPosts={allPosts}
      currentUser={currentUser}
    />
  );
} 