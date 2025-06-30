import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Для теста: возвращаем все баннеры
  const banners = await prisma.banner.findMany({ orderBy: { position: 'asc' } });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  // Если на позиции уже есть баннер — обновить, иначе создать
  const existing = await prisma.banner.findFirst({ where: { position: data.position } });
  let banner;
  if (existing) {
    banner = await prisma.banner.update({ where: { id: existing.id }, data });
  } else {
    banner = await prisma.banner.create({ data });
  }
  return NextResponse.json(banner);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const banner = await prisma.banner.update({ where: { id: data.id }, data });
  return NextResponse.json(banner);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await prisma.banner.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 