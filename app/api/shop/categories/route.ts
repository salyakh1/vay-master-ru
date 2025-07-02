import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

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

    // Категории товаров для магазинов не реализованы
    return NextResponse.json({ categories: [] });
  } catch (error) {
    console.error('Shop categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 