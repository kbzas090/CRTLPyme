
/**
 * API para ver la suscripción del tenant actual
 * Solo ADMIN puede acceder
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/settings/subscription
 * Obtiene la suscripción activa del tenant actual
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: 'No autenticado' },
      { status: 401 }
    )
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado. Solo administradores.' },
      { status: 403 }
    )
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId: session.user.tenantId,
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
      include: {
        plan: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No se encontró suscripción activa' },
        { status: 404 }
      )
    }

    // Calcular totales
    const totalPaid = await prisma.subscriptionPayment.aggregate({
      where: {
        subscriptionId: subscription.id,
        status: 'APPROVED',
      },
      _sum: {
        amount: true,
      },
    })

    return NextResponse.json({
      success: true,
      subscription: {
        ...subscription,
        totalPaid: totalPaid._sum.amount || 0,
      },
    })
  } catch (error) {
    console.error('Error al obtener suscripción:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener suscripción' },
      { status: 500 }
    )
  }
}
