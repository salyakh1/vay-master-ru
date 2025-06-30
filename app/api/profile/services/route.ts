import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { ServiceCategory } from '@prisma/client'
import { authOptions } from '@/lib/authOptions'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { services } = body

    if (!services || typeof services !== 'object') {
      return NextResponse.json({ error: 'Invalid services data' }, { status: 400 })
    }

    // Validate that the user is a master
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Only masters can add services' }, { status: 403 })
    }

    // Use a transaction to ensure all or nothing
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Delete existing services for this master
      await tx.service.deleteMany({
        where: { masterId: session.user.id }
      });

      // 2. Create new services
      const createPromises = services.map((service: any) => {
        return tx.service.create({
          data: {
            title: service.title,
            category: service.category as ServiceCategory,
            masterId: session.user.id,
            specializationId: service.specializationId
          }
        });
      });
      const createdServices = await Promise.all(createPromises);

      // 3. Mark setup as complete for the user
      await tx.user.update({
        where: { id: session.user.id },
        data: { isSetupComplete: true }
      });

      return createdServices;
    });

    return NextResponse.json({ 
      success: true,
      services: transactionResult
    });
  } catch (error) {
    console.error('[PROFILE_SERVICES_POST]', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 