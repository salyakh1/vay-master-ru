import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ServiceCategory } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Получаем параметры фильтрации
    const query = searchParams.get('query');
    const category = searchParams.get('category') as ServiceCategory | null;
    const specializationId = searchParams.get('specialization');
    const city = searchParams.get('city');
    const rating = searchParams.get('rating');

    // Формируем условия поиска
    const where: any = {
      role: 'MASTER',
      AND: []
    };

    // Фильтр по городу (если указан)
    if (city && city.trim() !== '') {
      where.AND.push({
        city: {
          contains: city.trim(),
          mode: 'insensitive',
        }
      });
    }

    // Фильтр по рейтингу
    if (rating && rating !== '0') {
      where.AND.push({
        rating: {
          gte: parseFloat(rating),
        }
      });
    }

    // Фильтр по категории и/или специализации
    if (specializationId) {
      // Если выбрана специализация — фильтруем только по ней (и опционально по категории)
      const serviceWhere: any = { specializationId };
      if (category) {
        serviceWhere.category = category;
      }
      where.AND.push({ services: { some: serviceWhere } });
    } else if (category) {
      // Если выбрана только категория — фильтруем по ней
      where.AND.push({ services: { some: { category } } });
    }

    // Поиск по имени, категории и специализации (универсальный текстовый поиск)
    if (query && query.trim() !== '') {
      const trimmedQuery = query.trim();
      const isShort = trimmedQuery.length < 2;
      if (isShort) {
        where.AND.push({
          OR: [
            {
              name: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
            {
              services: {
                some: {
                  title: {
                    contains: trimmedQuery,
                    mode: 'insensitive',
                  },
                },
              },
            },
          ]
        });
      } else {
        where.AND.push({
          OR: [
            {
              name: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
            {
              services: {
                some: {
                  title: {
                    contains: trimmedQuery,
                    mode: 'insensitive',
                  },
                },
              },
            },
            // Поиск по категории только по точному совпадению (если нужно)
            // {
            //   services: {
            //     some: {
            //       category: {
            //         equals: trimmedQuery.toUpperCase(),
            //       },
            //     },
            //   },
            // },
          ]
        });
      }
    }

    // Если нет ни одного фильтра и нет текстового запроса, убираем AND
    if (where.AND.length === 0) delete where.AND;

    console.log('Search params:', { query, category, specializationId, city, rating });
    console.log('Prisma where:', JSON.stringify(where, null, 2));

    // Получаем мастеров с учетом фильтров
    let masters = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
        phone: true,
        description: true,
        avatar: true,
        rating: true,
        services: true,
        socialLinks: true,
      },
      orderBy: [
        { rating: 'desc' },
        { name: 'asc' },
      ],
    });

    console.log('Returned masters:', JSON.stringify(masters, null, 2));

    // Исключаем мастеров без услуг
    masters = masters.filter(master => master.services && master.services.length > 0);

    console.log('Found masters:', masters.length); // Для отладки
    return NextResponse.json(masters);
  } catch (error) {
    console.error('Ошибка при поиске мастеров:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при поиске мастеров' },
      { status: 500 }
    );
  }
} 