import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || '';
    const category = searchParams.get('category') || '';
    const productType = searchParams.get('productType') || '';
    const city = searchParams.get('city') || '';
    const rating = searchParams.get('rating') || '';

    // Формируем условия поиска
    const where: any = {
      role: 'SHOP',
    };
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (category) {
      where.shopCategories = {
        some: { name: category }
      };
    }
    if (productType) {
      where.products = {
        some: { name: productType }
      };
    }
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    if (rating) {
      where.rating = { gte: parseFloat(rating) };
    }

    const shops = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        city: true,
        avatar: true,
        rating: true,
        shopCategories: {
          select: { name: true }
        },
        address: true,
        workingHours: true,
        hasDelivery: true,
        products: {
          select: { name: true }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { name: 'asc' }
      ]
    });

    // Преобразуем данные для фронта
    const result = shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      city: shop.city,
      logo: shop.avatar,
      rating: shop.rating,
      categories: shop.shopCategories.map(c => c.name),
      address: shop.address,
      workingHours: shop.workingHours,
      hasDelivery: shop.hasDelivery,
      inStock: shop.products.map(p => p.name)
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка при поиске магазинов:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при поиске магазинов' },
      { status: 500 }
    );
  }
} 