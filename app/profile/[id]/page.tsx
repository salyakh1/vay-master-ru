import { UserProfile } from '@/app/components/profile/UserProfile'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MainNav } from '../../components/navigation/MainNav'

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role === 'ADMIN') {
    // Если админ пытается попасть на профиль, редиректим в админку
    return redirect('/admin');
  }
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      services: true,
      reviews: true,
      posts: {
        include: {
          author: true,
          likes: true,
          comments: true,
          _count: {
            select: { likes: true, comments: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      followers: true,
      following: true,
    },
  })
  if (!user) notFound()

  // Получаем, подписан ли текущий пользователь на этого пользователя
  let isFollowing = false;
  if (session?.user?.id && params.id !== session.user.id) {
    const follow = await prisma.follow.findFirst({
      where: {
        followerId: session.user.id,
        followingId: params.id,
      },
    });
    isFollowing = !!follow;
  }

  // Получаем количество подписчиков и подписок
  const followersCount = await prisma.follow.count({ where: { followingId: params.id } });
  const followingCount = await prisma.follow.count({ where: { followerId: params.id } });

  // Собираем расширенные поля
  const extendedUser = {
    ...user,
    posts: user.posts || [],
    followersCount,
    followingCount,
    services: user.services?.map(s => ({ ...s, description: s.description ?? undefined })) || [],
    rating: user.rating ?? undefined,
    avatar: user.avatar ?? undefined,
    banner: user.banner ?? undefined,
    description: user.description ?? undefined,
    phone: user.phone ?? undefined,
    socialLinks: typeof user.socialLinks === 'string'
      ? JSON.parse(user.socialLinks)
      : user.socialLinks ?? undefined,
    isFollowing,
  }

  return (
    <>
      <MainNav />
      <div className="w-full flex justify-center pt-0 pb-4">
        <UserProfile profile={extendedUser} currentUser={session?.user || null} isOwnProfile={session?.user?.id === user.id} />
      </div>
    </>
  )
} 