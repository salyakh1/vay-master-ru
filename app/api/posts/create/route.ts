import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Получаем данные формы
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const images = formData.getAll('images') as File[];

    if (!content) {
      return new NextResponse('Content is required', { status: 400 });
    }

    // Создаем директорию для загрузки изображений, если её нет
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Сохраняем изображения
    const imageUrls = await Promise.all(
      images.map(async (image, index) => {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Создаем уникальное имя файла
        const fileName = `${session.user.id}-${Date.now()}-${index}-${image.name}`;
        const filePath = join(uploadsDir, fileName);
        
        // Сохраняем файл
        await writeFile(filePath, buffer);
        return `/uploads/${fileName}`;
      })
    );

    // Создаем пост
    const post = await prisma.post.create({
      data: {
        content,
        images: imageUrls,
        authorId: session.user.id
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
      }
    });

    // Трансформируем данные для ответа
    const transformedPost = {
      ...post,
      isLiked: post.likes.length > 0
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 