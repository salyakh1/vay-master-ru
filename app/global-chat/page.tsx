import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import GlobalChatPage from './GlobalChatPage'; // Client component

export const dynamic = 'force-dynamic';

async function getInitialMessages() {
  const messages = await prisma.globalChatMessage.findMany({
    take: 100,
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
          role: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  return messages;
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login?callbackUrl=/global-chat');
  }

  const initialMessages = await getInitialMessages();
  
  return <GlobalChatPage initialMessages={initialMessages} session={session} />;
} 