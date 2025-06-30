import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { position: 'asc' },
  });
  return NextResponse.json(banners);
} 