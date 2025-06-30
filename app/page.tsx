import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loading from './loading';
import { prisma } from '@/lib/prisma';
import { ServiceCategory, User } from '@prisma/client';
import { specializations } from './types/categories';
import { MainNav } from './components/navigation/MainNav';

// Динамический импорт для оптимизации загрузки
const LandingPage = dynamic(() => import('@/app/components/landing/LandingPage'), {
  loading: () => <Loading />,
  ssr: false, // Отключаем SSR для компонента, который теперь является клиентским
});

interface FeedbackWithUser {
  id: string;
  content: string;
  userId: string | null;
  createdAt: Date;
  user: Pick<User, 'name' | 'avatar' | 'firstName' | 'lastName'> | null;
}

async function getPageData() {
  const masterCount = await prisma.user.count({
    where: { role: 'MASTER' },
  });

  const specializationsCount = Object.values(specializations).reduce(
    (acc, current) => acc + current.length,
    0
  );

  // Временно закомментировано из-за проблем с Prisma клиентом
  // const feedbacks = await prisma.platformFeedback.findMany({
  //   take: 10,
  //   orderBy: {
  //     createdAt: 'desc',
  //   },
  //   include: {
  //     user: {
  //       select: {
  //         name: true,
  //         avatar: true,
  //         firstName: true,
  //         lastName: true,
  //       },
  //     },
  //   },
  // });

  return {
    stats: { masterCount, specializationsCount },
    feedbacks: [] as FeedbackWithUser[], // Временно пустой массив
  };
}

export default async function Home() {
  const { stats, feedbacks } = await getPageData();

  return (
    <>
      <MainNav />
      <Suspense fallback={<Loading />}>
        <LandingPage stats={stats} feedbacks={feedbacks} />
      </Suspense>
    </>
  );
} 