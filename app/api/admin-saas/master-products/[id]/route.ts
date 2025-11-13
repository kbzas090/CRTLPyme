/**
 * API para operaciones individuales de productos maestros
 * Solo accesible por usuarios con rol PROVEEDOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schema de validación para actualizar producto maestro
const updateMasterProductSchema = z.object({
  sku: z.string().min(1).optional(),
  barcode: z.string().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  brand: z.string().optional(),
  suggestedPrice: z.number().positive().optional(),
  unit: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/admin-saas/master-products/[id]
 * Obtener producto maestro por ID
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

    const masterProduct = await prisma.masterProduct.findUnique({
      where: { id: (await params).id },
      include: {
        tenantInventories: {
          select: {
            id: true,
            tenantId: true,
            stock: true,
            salePrice: true,
            tenant: {
              select: {
                id: true,
                businessName: true,
              },
            },
          },
        },
      },
    })

    if (!masterProduct) {
      return NextResponse.json(
        { error: 'Producto maestro no encontrado' },
        { status: 404 }
      )
    }

    // Calcular estadísticas
    const stats = {
      totalTenants: masterProduct.tenantInventories.length,
      totalStock: masterProduct.tenantInventories.reduce((sum, inv) => sum + inv.stock, 0),
      avgPrice: masterProduct.tenantInventories.length > 0
        ? masterProduct.tenantInventories.reduce((sum, inv) => sum + Number(inv.salePrice), 0) / masterProduct.tenantInventories.length
        : 0,
    }

    return NextResponse.json({
      ...masterProduct,
      stats,
    })
  } catch (error) {
    console.error('Error al obtener producto maestro:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto maestro' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin-saas/master-products/[id]
 * Actualizar producto maestro (solo PROVEEDOR)
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

    // Verificar que es PROVEEDOR
    if (session.user.role !== 'PROVEEDOR') {
      return NextResponse.json(
        { error: 'Solo el administrador SaaS puede actualizar productos maestros' },
        { status: 403 }
      )
    }

    const masterProduct = await prisma.masterProduct.findUnique({
      where: { id: (await params).id },
    })

    if (!masterProduct) {
      return NextResponse.json(
        { error: 'Producto maestro no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateMasterProductSchema.parse(body)

    // Verificar unicidad de SKU si se actualiza
    if (validatedData.sku && validatedData.sku !== masterProduct.sku) {
      const existingBySku = await prisma.masterProduct.findUnique({
        where: { sku: validatedData.sku },
      })

      if (existingBySku) {
        return NextResponse.json(
          { error: 'Ya existe un producto maestro con este SKU' },
          { status: 400 }
        )
      }
    }

    // Verificar unicidad de barcode si se actualiza
    if (validatedData.barcode && validatedData.barcode !== masterProduct.barcode) {
      const existingByBarcode = await prisma.masterProduct.findUnique({
        where: { barcode: validatedData.barcode },
      })

      if (existingByBarcode) {
        return NextResponse.json(
          { error: 'Ya existe un producto maestro con este código de barras' },
          { status: 400 }
        )
      }
    }

    // Actualizar producto maestro
    const updatedMasterProduct = await prisma.masterProduct.update({
      where: { id: (await params).id },
      data: validatedData,
    })

    return NextResponse.json(updatedMasterProduct)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar producto maestro:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto maestro' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin-saas/master-products/[id]
 * Eliminar producto maestro (soft delete) (solo PROVEEDOR)
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

    // Verificar que es PROVEEDOR
    if (session.user.role !== 'PROVEEDOR') {
      return NextResponse.json(
        { error: 'Solo el administrador SaaS puede eliminar productos maestros' },
        { status: 403 }
      )
    }

    const masterProduct = await prisma.masterProduct.findUnique({
      where: { id: (await params).id },
      include: {
        tenantInventories: true,
      },
    })

    if (!masterProduct) {
      return NextResponse.json(
        { error: 'Producto maestro no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si hay inventarios activos usando este producto
    const activeInventories = masterProduct.tenantInventories.filter(inv => inv.isActive)
    
    if (activeInventories.length > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el producto maestro porque hay tenants que lo están usando',
          tenantsUsing: activeInventories.length,
        },
        { status: 400 }
      )
    }

    // Soft delete: marcar como inactivo
    const deletedMasterProduct = await prisma.masterProduct.update({
      where: { id: (await params).id },
      data: { isActive: false },
    })

    return NextResponse.json({ 
      message: 'Producto maestro eliminado correctamente',
      product: deletedMasterProduct,
    })
  } catch (error) {
    console.error('Error al eliminar producto maestro:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto maestro' },
      { status: 500 }
    )
  }
}
