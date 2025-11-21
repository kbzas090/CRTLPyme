/**
 * API para gestionar el inventario del tenant
 * Accesible según permisos de rol
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { requirePermissions } from '@/lib/api-auth'
import { MODULES, ACTIONS } from '@/lib/permissions'

// Schema para agregar producto del pool al inventario
const addToInventorySchema = z.object({
  masterProductId: z.string().min(1, 'ID del producto maestro requerido'),
  customSku: z.string().optional(),
  costPrice: z.number().positive('El costo debe ser positivo'),
  salePrice: z.number().positive('El precio de venta debe ser positivo'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo').default(0),
  minStock: z.number().int().min(0, 'El stock mínimo no puede ser negativo').default(5),
  location: z.string().optional(),
  customNotes: z.string().optional(),
})

/**
 * GET /api/inventory
 * Listar inventario del tenant
 */
export async function GET(request: NextRequest) {
  // Verificar permisos de lectura en inventario
  const authResult = await requirePermissions({
    module: MODULES.INVENTORY,
    action: ACTIONS.VIEW,
  })

  if (!authResult.success) {
    return authResult.response
  }

  const { user } = authResult

  try {

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true'

    // Construir filtros
    const where: any = {
      tenantId: user.tenantId,
      isActive: true,
    }

    // Filtros en masterProduct
    const masterProductWhere: any = {
      isActive: true,
    }

    if (category) {
      masterProductWhere.category = category
    }

    if (search) {
      masterProductWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ]
    }

    const inventory = await prisma.tenantInventory.findMany({
      where: {
        ...where,
        masterProduct: masterProductWhere,
      },
      include: {
        masterProduct: {
          select: {
            id: true,
            sku: true,
            barcode: true,
            name: true,
            description: true,
            category: true,
            brand: true,
            suggestedPrice: true,
            unit: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filtrar productos con stock bajo si se solicita
    let filteredInventory = inventory
    if (lowStockOnly) {
      filteredInventory = inventory.filter(item => item.stock <= item.minStock)
    }

    // Calcular estadísticas
    const totalValue = inventory.reduce(
      (sum, item) => sum + Number(item.salePrice) * item.stock,
      0
    )
    const lowStockCount = inventory.filter(item => item.stock <= item.minStock).length

    return NextResponse.json({
      inventory: filteredInventory,
      total: filteredInventory.length,
      stats: {
        totalItems: inventory.length,
        totalValue,
        lowStockCount,
      },
    })
  } catch (error) {
    console.error('Error al obtener inventario:', error)
    return NextResponse.json(
      { error: 'Error al obtener inventario' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory
 * Agregar producto del pool al inventario del tenant
 */
export async function POST(request: NextRequest) {
  // Verificar permisos de creación en inventario
  const authResult = await requirePermissions({
    module: MODULES.INVENTORY,
    action: ACTIONS.CREATE,
  })

  if (!authResult.success) {
    return authResult.response
  }

  const { user } = authResult

  try {
    const body = await request.json()
    const validatedData = addToInventorySchema.parse(body)

    // Verificar que el producto maestro existe
    const masterProduct = await prisma.masterProduct.findUnique({
      where: { id: validatedData.masterProductId },
    })

    if (!masterProduct || !masterProduct.isActive) {
      return NextResponse.json(
        { error: 'Producto maestro no encontrado o inactivo' },
        { status: 404 }
      )
    }

    // Verificar que el tenant no tenga ya este producto en su inventario
    const existingInventory = await prisma.tenantInventory.findUnique({
      where: {
        tenantId_masterProductId: {
          tenantId: user.tenantId,
          masterProductId: validatedData.masterProductId,
        },
      },
    })

    if (existingInventory) {
      return NextResponse.json(
        { error: 'Este producto ya está en tu inventario' },
        { status: 400 }
      )
    }

    // Agregar al inventario y crear movimiento en una transacción
    const inventoryItem = await prisma.$transaction(async (tx) => {
      // Crear item de inventario
      const newItem = await tx.tenantInventory.create({
        data: {
          ...validatedData,
          tenantId: user.tenantId,
        },
        include: {
          masterProduct: true,
        },
      })

      // Si hay stock inicial, crear movimiento de entrada
      if (validatedData.stock > 0) {
        await tx.inventoryMovement.create({
          data: {
            tenantId: user.tenantId,
            type: 'ENTRY',
            quantity: validatedData.stock,
            reason: 'Stock inicial al agregar producto',
            createdBy: user.id,
            tenantInventory: {
              connect: {
                id: newItem.id
              }
            }
          }
        })
      }

      // Registrar en auditoría
      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'TenantInventory',
          entityId: newItem.id,
          newValues: newItem,
          userId: user.id,
          tenantId: user.tenantId,
        },
      })

      return newItem
    })

    return NextResponse.json(inventoryItem, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al agregar producto al inventario:', error)
    return NextResponse.json(
      { error: 'Error al agregar producto al inventario' },
      { status: 500 }
    )
  }
}
