
/**
 * API para cancelar suscripción
 * Solo ADMIN puede acceder
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/settings/subscription/cancel
 * Cancela la suscripción del tenant actual
 */
export async function POST(request: NextRequest) {
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
    const body = await request.json()
    const { reason } = body

    // Obtener suscripción actual
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        tenantId: session.user.tenantId,
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
    })

    if (!currentSubscription) {
      return NextResponse.json(
        { success: false, error: 'No se encontró suscripción activa' },
        { status: 404 }
      )
    }

    // Actualizar suscripción a cancelada
    const updatedSubscription = await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        status: 'CANCELLED',
        autoRenew: false,
        cancelledAt: new Date(),
        cancellationReason: reason || null,
      },
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Subscription',
        entityId: updatedSubscription.id,
        oldValues: { status: currentSubscription.status },
        newValues: { 
          status: 'CANCELLED', 
          cancelledAt: updatedSubscription.cancelledAt,
          reason: reason || null,
        },
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    // Actualizar estado del tenant
    await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        accountStatus: 'CANCELLED',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente',
      subscription: updatedSubscription,
    })
  } catch (error) {
    console.error('Error al cancelar suscripción:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cancelar suscripción' },
      { status: 500 }
    )
  }
}
