import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Post } from '@/types/user'
import { UserRole } from '@prisma/client'

interface ExtendedPost extends Post {
  likes: any[];
  _count: {
    likes: number;
    comments: number;
  };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const targetUserId = params.id

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true }
    })

    if (!targetUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Получаем роль текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Бизнес-логика подписки
    const canFollow =
      (currentUser.role === UserRole.CLIENT && targetUser.role === UserRole.MASTER) ||
      (currentUser.role === UserRole.MASTER && targetUser.role === UserRole.MASTER)
    if (!canFollow) {
      return new NextResponse('Подписка невозможна по правилам платформы', { status: 403 })
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId
        }
      }
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: targetUserId
          }
        }
      })
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUserId
        }
      })
    }

    // Get updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
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
          }
        },
        followers: {
          where: {
            followerId: session.user.id
          },
          take: 1
        },
        _count: {
          select: {
            followers: true,
            following: true
          }
        }
      }
    })

    if (!updatedUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Transform the data to match the expected format
    const profile: any = {
      ...updatedUser,
      isFollowing: !existingFollow, // Toggle the previous state
      followersCount: updatedUser._count.followers,
      followingCount: updatedUser._count.following,
      posts: updatedUser.posts.map((post: ExtendedPost) => ({
        ...post,
        isLiked: post.likes.length > 0,
        _count: {
          likes: post._count.likes,
          comments: post._count.comments
        }
      }))
    }

    // Remove sensitive or unnecessary fields
    if ('password' in profile) delete profile.password
    if ('emailVerified' in profile) delete profile.emailVerified
    if ('followers' in profile) delete profile.followers

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[FOLLOW_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 