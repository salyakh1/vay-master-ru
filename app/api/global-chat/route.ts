import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

// Get all global chat messages
export async function GET() {
  try {
    const messages = await prisma.globalChatMessage.findMany({
      take: 100, // Limit to the latest 100 messages
      orderBy: {
        createdAt: 'asc',
      },
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
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching global chat messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// Post a new message to the global chat
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  try {
    const newMessage = await prisma.globalChatMessage.create({
      data: {
        content,
        senderId: session.user.id,
      },
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
    // Here you would ideally broadcast this message via WebSockets
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating global chat message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
} 