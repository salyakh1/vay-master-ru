import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Отключаем статическую генерацию для этого API
export const dynamic = 'force-dynamic';

export async function GET() {
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { position: 'asc' },
  });
  return NextResponse.json(banners);
} 