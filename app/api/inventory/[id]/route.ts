/**
 * API para operaciones individuales del inventario del tenant
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schema para actualizar inventario
const updateInventorySchema = z.object({
  customSku: z.string().optional(),
  costPrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  location: z.string().optional(),
  customNotes: z.string().optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/inventory/[id]
 * Obtener item de inventario por ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const inventoryItem = await prisma.tenantInventory.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        masterProduct: true,
        saleItems: {
          take: 10,
          orderBy: { sale: { createdAt: 'desc' } },
          include: {
            sale: {
              select: {
                id: true,
                saleNumber: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Producto no encontrado en tu inventario' },
        { status: 404 }
      )
    }

    return NextResponse.json(inventoryItem)
  } catch (error) {
    console.error('Error al obtener item de inventario:', error)
    return NextResponse.json(
      { error: 'Error al obtener item de inventario' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/inventory/[id]
 * Actualizar item de inventario
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar permisos
    if (!['ADMIN', 'INVENTARIO', 'PROVEEDOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar el inventario' },
        { status: 403 }
      )
    }

    // Verificar que el item existe y pertenece al tenant
    const existingItem = await prisma.tenantInventory.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Producto no encontrado en tu inventario' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateInventorySchema.parse(body)

    // Actualizar inventario
    const updatedItem = await prisma.tenantInventory.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        masterProduct: true,
      },
    })

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'TenantInventory',
        entityId: updatedItem.id,
        oldValues: existingItem,
        newValues: updatedItem,
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar item de inventario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar item de inventario' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/inventory/[id]
 * Eliminar item de inventario (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar permisos
    if (!['ADMIN', 'PROVEEDOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar del inventario' },
        { status: 403 }
      )
    }

    // Verificar que el item existe y pertenece al tenant
    const existingItem = await prisma.tenantInventory.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Producto no encontrado en tu inventario' },
        { status: 404 }
      )
    }

    // Soft delete: marcar como inactivo
    const deletedItem = await prisma.tenantInventory.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'TenantInventory',
        entityId: deletedItem.id,
        oldValues: existingItem,
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json({ message: 'Producto eliminado del inventario' })
  } catch (error) {
    console.error('Error al eliminar item de inventario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar item de inventario' },
      { status: 500 }
    )
  }
}
