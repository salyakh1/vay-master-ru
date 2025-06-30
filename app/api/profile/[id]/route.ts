import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Prisma } from '@prisma/client'

type UserWithIncludes = Prisma.UserGetPayload<{
  include: {
    services: true
    workGallery: true
    posts: {
      include: {
        author: {
          select: {
            id: true
            name: true
            avatar: true
            role: true
            city: true
          }
        }
        likes: true
        _count: {
          select: {
            likes: true
          }
        }
      }
    }
    followers: true
    _count: {
      select: {
        followers: true
        following: true
        services: true
        workGallery: true
      }
    }
  }
}>

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        services: true,
        workGallery: true,
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
                userId: session?.user?.id
              },
              take: 1
            },
            _count: {
              select: {
                likes: true
              }
            }
          }
        },
        followers: {
          where: {
            followerId: session?.user?.id
          },
          take: 1
        },
        _count: {
          select: {
            followers: true,
            following: true,
            services: true,
            workGallery: true
          }
        }
      }
    }) as UserWithIncludes | null

    if (!user) {
      return new NextResponse('Not Found', { status: 404 })
    }

    // Transform the data to match the expected format
    const transformedUser = {
      ...user,
      isFollowing: user.followers.length > 0,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      servicesCount: user._count.services,
      workGalleryCount: user._count.workGallery,
      posts: user.posts.map((post) => ({
        ...post,
        isLiked: post.likes.length > 0,
        _count: {
          likes: post._count.likes
        }
      }))
    }

    // Remove sensitive fields
    const { password: _, ...safeProfile } = transformedUser

    return NextResponse.json(safeProfile)
  } catch (error) {
    console.error('[PROFILE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 