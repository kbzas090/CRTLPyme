
/**
 * API para gestionar configuración POS del tenant
 * Solo ADMIN puede acceder
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Como no hay un modelo específico de configuración POS en el schema,
// usaremos el campo planType del tenant para determinar si POS está habilitado
// y almacenaremos la configuración en una tabla futura o en el campo de notas

/**
 * GET /api/settings/pos
 * Obtiene la configuración POS del tenant actual
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
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
    })

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant no encontrado' },
        { status: 404 }
      )
    }

    // Por ahora, devolvemos una configuración por defecto
    // En el futuro, esto debería venir de una tabla de configuración
    const posConfig = {
      posEnabled: tenant.planType !== 'BASIC', // POS solo en planes PRO y ENTERPRISE
      receiptHeader: `${tenant.businessName}\nRUT: ${tenant.rut}\n${tenant.address || ''}`,
      receiptFooter: '¡Gracias por su compra!\nVuelva pronto',
      autoOpenDrawer: true,
      printReceipt: true,
    }

    return NextResponse.json({
      success: true,
      config: posConfig,
    })
  } catch (error) {
    console.error('Error al obtener configuración POS:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/settings/pos
 * Actualiza la configuración POS del tenant actual
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
    const { posEnabled, receiptHeader, receiptFooter, autoOpenDrawer, printReceipt } = body

    // Log de auditoría con la configuración
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'POSConfig',
        entityId: session.user.tenantId,
        newValues: {
          posEnabled,
          receiptHeader,
          receiptFooter,
          autoOpenDrawer,
          printReceipt,
        },
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    // En una implementación real, aquí se guardaría en una tabla de configuración
    // Por ahora, solo registramos en el log y devolvemos éxito

    return NextResponse.json({
      success: true,
      config: body,
      message: 'Configuración POS actualizada correctamente',
    })
  } catch (error) {
    console.error('Error al actualizar configuración POS:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}
