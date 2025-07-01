import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { ServiceCategory } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

interface ServiceData {
  title: string;
  category: ServiceCategory;
  description?: string;
  specializationId: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Функция для сохранения файла
async function saveFile(file: File, prefix: string, userId: string): Promise<string> {
  console.log(`Starting to save ${prefix} file:`, { 
    type: file.type, 
    size: file.size,
    name: file.name 
  });

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    console.error(`Invalid file type: ${file.type}`);
    throw new Error('Invalid file type. Allowed types: JPEG, PNG, WEBP');
  }

  const maxSize = prefix === 'banner' ? 10 * 1024 * 1024 : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    console.error(`File too large: ${file.size} bytes`);
    throw new Error(`File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
  }

  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    console.log('Upload directory path:', uploadsDir);
    
    await mkdir(uploadsDir, { recursive: true });
    console.log('Directory created/verified');
    
    const bytes = await file.arrayBuffer();
    console.log('File converted to array buffer');
    
    const buffer = Buffer.from(bytes);
    console.log('Buffer created');
    
    // Добавляем проверку на существование директории
    if (!existsSync(uploadsDir)) {
      console.error('Upload directory does not exist after creation');
      throw new Error('Upload directory does not exist');
    }
    
    const fileName = `${userId}-${prefix}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const publicPath = join(uploadsDir, fileName);
    console.log('File will be saved at:', publicPath);
    
    await writeFile(publicPath, buffer);
    console.log('File successfully written to disk');
    
    const relativePath = `/uploads/${fileName}`;
    console.log('Returning relative path:', relativePath);
    return relativePath;
  } catch (error) {
    console.error(`Detailed error saving ${prefix} file:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      uploadsDir: join(process.cwd(), 'public', 'uploads'),
      fileInfo: {
        type: file.type,
        size: file.size,
        name: file.name
      }
    });
    throw new Error(`Failed to save ${prefix} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const userId = session.user.id;

    // Обновляем основную информацию
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name || ((data.firstName || '') + ' ' + (data.lastName || '')).trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        city: data.city,
        description: data.description,
        avatar: data.avatar,
        banner: data.banner,
        socialLinks: data.socialLinks,
        // Обновляем специфичные поля в зависимости от роли
        ...(session.user.role === 'MASTER' && {
          serviceArea: data.serviceArea,
          readyToTravel: data.readyToTravel,
        }),
      },
    });

    // Если пользователь мастер, обновляем его услуги
    if (session.user.role === 'MASTER' && data.services) {
      // Удаляем старые услуги
      await prisma.service.deleteMany({
        where: { masterId: userId },
      });

      // Добавляем новые услуги
      await prisma.service.createMany({
        data: data.services.map((service: any) => ({
          masterId: userId,
          category: service.category,
          specializationId: service.specializationId,
          title: service.title || '',
        })),
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 