
/**
 * API para gestionar la información de la empresa del tenant
 * Solo ADMIN puede acceder
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/settings/company
 * Obtiene la información de la empresa del tenant actual
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
      select: {
        id: true,
        businessName: true,
        rut: true,
        email: true,
        phone: true,
        address: true,
      },
    })

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      company: tenant,
    })
  } catch (error) {
    console.error('Error al obtener información de empresa:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener información' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/settings/company
 * Actualiza la información de la empresa del tenant actual
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
    const { businessName, rut, email, phone, address } = body

    // Validar campos requeridos
    if (!businessName || !rut || !email) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos: businessName, rut, email' },
        { status: 400 }
      )
    }

    // Verificar si el RUT ya existe en otro tenant
    if (rut) {
      const existingTenant = await prisma.tenant.findFirst({
        where: {
          rut: rut,
          id: { not: session.user.tenantId },
        },
      })

      if (existingTenant) {
        return NextResponse.json(
          { success: false, error: 'El RUT ya está registrado por otra empresa' },
          { status: 409 }
        )
      }
    }

    // Verificar si el email ya existe en otro tenant
    if (email) {
      const existingTenant = await prisma.tenant.findFirst({
        where: {
          email: email,
          id: { not: session.user.tenantId },
        },
      })

      if (existingTenant) {
        return NextResponse.json(
          { success: false, error: 'El email ya está registrado por otra empresa' },
          { status: 409 }
        )
      }
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        businessName,
        rut,
        email,
        phone: phone || null,
        address: address || null,
      },
      select: {
        id: true,
        businessName: true,
        rut: true,
        email: true,
        phone: true,
        address: true,
      },
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Tenant',
        entityId: updatedTenant.id,
        newValues: updatedTenant,
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json({
      success: true,
      company: updatedTenant,
      message: 'Información de empresa actualizada correctamente',
    })
  } catch (error) {
    console.error('Error al actualizar información de empresa:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar información' },
      { status: 500 }
    )
  }
}
