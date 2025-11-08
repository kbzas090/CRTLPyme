
/**
 * API para gestionar preferencias de notificación del tenant
 * Solo ADMIN puede acceder
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/settings/notifications
 * Obtiene las preferencias de notificación del tenant actual
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
    let preferences = await prisma.notificationPreference.findUnique({
      where: { tenantId: session.user.tenantId },
    })

    // Si no existen preferencias, crear las predeterminadas
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          tenantId: session.user.tenantId,
          emailOnPaymentSuccess: true,
          emailOnPaymentFailure: true,
          emailOnSubscriptionExpiring: true,
          emailOnSubscriptionRenewed: true,
          emailOnLowStock: true,
          emailOnNewSale: false,
          emailOnAccountSuspended: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      preferences,
    })
  } catch (error) {
    console.error('Error al obtener preferencias:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener preferencias' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/settings/notifications
 * Actualiza las preferencias de notificación del tenant actual
 */
export async function PUT(request: NextRequest) {
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
    const {
      emailOnPaymentSuccess,
      emailOnPaymentFailure,
      emailOnSubscriptionExpiring,
      emailOnSubscriptionRenewed,
      emailOnLowStock,
      emailOnNewSale,
      emailOnAccountSuspended,
      notificationEmail,
    } = body

    // Actualizar o crear preferencias
    const preferences = await prisma.notificationPreference.upsert({
      where: { tenantId: session.user.tenantId },
      update: {
        emailOnPaymentSuccess: emailOnPaymentSuccess ?? true,
        emailOnPaymentFailure: emailOnPaymentFailure ?? true,
        emailOnSubscriptionExpiring: emailOnSubscriptionExpiring ?? true,
        emailOnSubscriptionRenewed: emailOnSubscriptionRenewed ?? true,
        emailOnLowStock: emailOnLowStock ?? true,
        emailOnNewSale: emailOnNewSale ?? false,
        emailOnAccountSuspended: emailOnAccountSuspended ?? true,
        notificationEmail: notificationEmail || null,
      },
      create: {
        tenantId: session.user.tenantId,
        emailOnPaymentSuccess: emailOnPaymentSuccess ?? true,
        emailOnPaymentFailure: emailOnPaymentFailure ?? true,
        emailOnSubscriptionExpiring: emailOnSubscriptionExpiring ?? true,
        emailOnSubscriptionRenewed: emailOnSubscriptionRenewed ?? true,
        emailOnLowStock: emailOnLowStock ?? true,
        emailOnNewSale: emailOnNewSale ?? false,
        emailOnAccountSuspended: emailOnAccountSuspended ?? true,
        notificationEmail: notificationEmail || null,
      },
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'NotificationPreference',
        entityId: preferences.id,
        newValues: body,
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json({
      success: true,
      preferences,
      message: 'Preferencias actualizadas exitosamente',
    })
  } catch (error) {
    console.error('Error al actualizar preferencias:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar preferencias' },
      { status: 500 }
    )
  }
}
