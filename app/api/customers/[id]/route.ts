
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/customers/[id] - Obtener un cliente por ID con historial
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const { id } = params

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        tenantId
      },
      include: {
        sales: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            items: {
              include: {
                tenantInventory: {
                  include: {
                    masterProduct: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: { sales: true }
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Calcular total de compras
    const totalPurchases = await prisma.sale.aggregate({
      where: {
        customerId: id,
        tenantId,
        status: 'COMPLETED'
      },
      _sum: {
        total: true
      }
    })

    return NextResponse.json({
      ...customer,
      totalPurchases: totalPurchases._sum.total || 0
    })
  } catch (error) {
    console.error('Error al obtener cliente:', error)
    return NextResponse.json(
      { error: 'Error al obtener cliente' },
      { status: 500 }
    )
  }
}

// PUT /api/customers/[id] - Actualizar un cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const { id } = params
    const body = await request.json()

    const { firstName, lastName, email, phone, address, rut, notes } = body

    // Verificar que el cliente pertenece al tenant
    const existingCustomer = await prisma.customer.findFirst({
      where: { id, tenantId }
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Verificar si el RUT ya existe para otro cliente del tenant
    if (rut && rut !== existingCustomer.rut) {
      const duplicateCustomer = await prisma.customer.findFirst({
        where: {
          tenantId,
          rut,
          id: { not: id }
        }
      })

      if (duplicateCustomer) {
        return NextResponse.json(
          { error: 'Ya existe otro cliente con este RUT' },
          { status: 400 }
        )
      }
    }

    // Actualizar cliente
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        rut,
        notes
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error al actualizar cliente:', error)
    return NextResponse.json(
      { error: 'Error al actualizar cliente' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Eliminar (soft delete) un cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const { id } = params

    // Verificar que el cliente pertenece al tenant
    const customer = await prisma.customer.findFirst({
      where: { id, tenantId }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Soft delete
    await prisma.customer.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Cliente eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar cliente:', error)
    return NextResponse.json(
      { error: 'Error al eliminar cliente' },
      { status: 500 }
    )
  }
}
