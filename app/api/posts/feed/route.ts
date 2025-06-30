import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { UserRole } from '@/types/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const POSTS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const role = searchParams.get('role') as UserRole | null;

    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            city: true
          }
        },
        likes: {
          where: {
            userId: session.user.id
          },
          take: 1
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      where: role ? {
        author: {
          role: { equals: role }
        }
      } : undefined,
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE
    });

    // Получаем общее количество постов для пагинации
    const totalCount = await prisma.post.count({
      where: role ? {
        author: {
          role: { equals: role }
        }
      } : undefined
    });

    const hasMore = totalCount > page * POSTS_PER_PAGE;

    // Трансформируем посты для клиента
    const transformedPosts = posts.map(post => ({
      ...post,
      isLiked: post.likes.length > 0
    }));

    return NextResponse.json({
      posts: transformedPosts,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 