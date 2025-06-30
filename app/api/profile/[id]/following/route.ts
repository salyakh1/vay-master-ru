import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    const userId = params.id;

    const following = await prisma.user.findMany({
      where: {
        followers: {
          some: {
            followerId: userId
          }
        }
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        city: true,
        _count: {
          select: {
            followers: true,
            following: true
          }
        }
      }
    });

    return NextResponse.json(following);
  } catch (error) {
    console.error('[FOLLOWING_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 