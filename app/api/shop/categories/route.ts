import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SHOP') {
      return NextResponse.json(
        { error: 'Only shops can access this endpoint' },
        { status: 403 }
      );
    }

    const categories = await prisma.shopProductCategory.findMany({
      where: {
        shopId: session.user.id
      },
      include: {
        products: true
      }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Shop categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 