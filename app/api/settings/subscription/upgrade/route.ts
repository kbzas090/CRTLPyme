
/**
 * API para solicitar cambio de plan
 * Solo ADMIN puede acceder
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/settings/subscription/upgrade
 * Inicia el proceso de cambio de plan (upgrade/downgrade)
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
    const { planId } = body

    if (!planId) {
      return NextResponse.json(
        { success: false, error: 'planId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el plan existe
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan no encontrado' },
        { status: 404 }
      )
    }

    // Obtener suscripción actual
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        tenantId: session.user.tenantId,
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
      include: {
        plan: true,
      },
    })

    if (!currentSubscription) {
      return NextResponse.json(
        { success: false, error: 'No se encontró suscripción activa' },
        { status: 404 }
      )
    }

    // En una implementación real, aquí se iniciaría el proceso de pago
    // Por ahora, registramos la intención en el log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Subscription',
        entityId: currentSubscription.id,
        oldValues: { planId: currentSubscription.planId },
        newValues: { planId: planId, requested: true },
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Solicitud de cambio de plan registrada. Serás contactado para completar el proceso.',
      currentPlan: currentSubscription.plan.name,
      newPlan: plan.name,
    })
  } catch (error) {
    console.error('Error al procesar cambio de plan:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar solicitud' },
      { status: 500 }
    )
  }
}
