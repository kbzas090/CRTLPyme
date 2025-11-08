/**
 * API para gestionar movimientos de inventario
 * Accesible por ADMIN, INVENTARIO
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schema para registrar movimiento
const createMovementSchema = z.object({
  tenantInventoryId: z.string().min(1, 'ID del inventario requerido'),
  type: z.enum(['ENTRY', 'EXIT', 'ADJUSTMENT'], {
    errorMap: () => ({ message: 'Tipo de movimiento inválido. Use: ENTRY, EXIT, o ADJUSTMENT' }),
  }),
  quantity: z.number().int().positive('La cantidad debe ser positiva'),
  reason: z.string().min(1, 'El motivo es requerido').max(255, 'El motivo es muy largo'),
  notes: z.string().max(500, 'Las notas son muy largas').optional(),
})

/**
 * GET /api/inventory/movements
 * Listar movimientos de inventario del tenant
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tenantInventoryId = searchParams.get('tenantInventoryId')
    const type = searchParams.get('type') as 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Construir filtros
    const where: any = {
      tenantId: session.user.tenantId,
    }

    if (tenantInventoryId) {
      where.tenantInventoryId = tenantInventoryId
    }

    if (type && ['ENTRY', 'EXIT', 'ADJUSTMENT'].includes(type)) {
      where.type = type
    }

    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(endDate),
      }
    }

    const movements = await prisma.inventoryMovement.findMany({
      where,
      include: {
        tenantInventory: {
          select: {
            id: true,
            customSku: true,
            masterProduct: {
              select: {
                id: true,
                sku: true,
                name: true,
                category: true,
                brand: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Calcular estadísticas
    const stats = {
      totalMovements: movements.length,
      entriesCount: movements.filter(m => m.type === 'ENTRY').length,
      exitsCount: movements.filter(m => m.type === 'EXIT').length,
      adjustmentsCount: movements.filter(m => m.type === 'ADJUSTMENT').length,
      totalEntryQuantity: movements
        .filter(m => m.type === 'ENTRY')
        .reduce((sum, m) => sum + m.quantity, 0),
      totalExitQuantity: movements
        .filter(m => m.type === 'EXIT')
        .reduce((sum, m) => sum + Math.abs(m.quantity), 0),
    }

    return NextResponse.json({
      movements,
      stats,
    })
  } catch (error) {
    console.error('Error al obtener movimientos:', error)
    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/movements
 * Registrar nuevo movimiento y actualizar stock
 */
export async function POST(request: NextRequest) {
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
        { error: 'No tienes permisos para registrar movimientos de inventario' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createMovementSchema.parse(body)

    // Verificar que el inventario existe y pertenece al tenant
    const inventoryItem = await prisma.tenantInventory.findFirst({
      where: {
        id: validatedData.tenantInventoryId,
        tenantId: session.user.tenantId,
        isActive: true,
      },
      include: {
        masterProduct: {
          select: {
            id: true,
            name: true,
            sku: true,
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

    // Calcular nueva cantidad según el tipo de movimiento
    let quantityChange = 0
    switch (validatedData.type) {
      case 'ENTRY':
        quantityChange = validatedData.quantity
        break
      case 'EXIT':
        quantityChange = -validatedData.quantity
        break
      case 'ADJUSTMENT':
        // Para ajustes, la cantidad puede ser positiva (aumentar) o negativa (disminuir)
        // pero la validación ya asegura que sea positiva, así que permitimos ambos
        quantityChange = validatedData.quantity
        break
    }

    // Verificar que no resulte en stock negativo
    const newStock = inventoryItem.stock + quantityChange
    if (newStock < 0) {
      return NextResponse.json(
        { 
          error: `Stock insuficiente. Stock actual: ${inventoryItem.stock}, cambio solicitado: ${quantityChange}`,
          currentStock: inventoryItem.stock,
        },
        { status: 400 }
      )
    }

    // Crear movimiento y actualizar stock en transacción
    const movement = await prisma.$transaction(async (tx) => {
      // Crear movimiento
      const newMovement = await tx.inventoryMovement.create({
        data: {
          tenantInventoryId: validatedData.tenantInventoryId,
          type: validatedData.type,
          quantity: quantityChange, // Guardar con signo según el tipo
          reason: validatedData.reason,
          notes: validatedData.notes,
          createdBy: session.user.id,
          tenantId: session.user.tenantId,
        },
        include: {
          tenantInventory: {
            include: {
              masterProduct: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      // Actualizar stock en TenantInventory
      await tx.tenantInventory.update({
        where: { 
          id: validatedData.tenantInventoryId,
        },
        data: {
          stock: newStock,
        },
      })

      return newMovement
    })

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'InventoryMovement',
        entityId: movement.id,
        newValues: {
          ...movement,
          previousStock: inventoryItem.stock,
          newStock,
        },
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json(
      {
        ...movement,
        previousStock: inventoryItem.stock,
        newStock,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al registrar movimiento:', error)
    return NextResponse.json(
      { error: 'Error al registrar movimiento' },
      { status: 500 }
    )
  }
}
