/**
 * API de productos por ID - NUEVA VERSIÓN usando catálogo maestro
 * Esta API opera sobre tenant_inventory
 * 
 * MIGRACIÓN: Reemplaza la API antigua que usaba 'products'
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schema de validación para actualizar producto
const updateProductSchema = z.object({
  // Campos del inventario del tenant (editable)
  costPrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  location: z.string().optional(),
  customNotes: z.string().optional(),
  customSku: z.string().optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/products/[id]
 * Obtener producto del inventario por ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
      },
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Transformar a formato compatible
    const product = {
      id: inventoryItem.id,
      sku: inventoryItem.customSku || inventoryItem.masterProduct.sku,
      barcode: inventoryItem.masterProduct.barcode,
      name: inventoryItem.masterProduct.name,
      description: inventoryItem.masterProduct.description,
      category: inventoryItem.masterProduct.category,
      brand: inventoryItem.masterProduct.brand,
      costPrice: inventoryItem.costPrice,
      salePrice: inventoryItem.salePrice,
      stock: inventoryItem.stock,
      minStock: inventoryItem.minStock,
      isActive: inventoryItem.isActive,
      tenantId: inventoryItem.tenantId,
      createdAt: inventoryItem.createdAt,
      updatedAt: inventoryItem.updatedAt,
      // Campos adicionales del nuevo modelo
      masterProductId: inventoryItem.masterProductId,
      location: inventoryItem.location,
      customNotes: inventoryItem.customNotes,
      suggestedPrice: inventoryItem.masterProduct.suggestedPrice,
      unit: inventoryItem.masterProduct.unit,
      imageUrl: inventoryItem.masterProduct.imageUrl,
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/products/[id]
 * Actualizar producto del inventario
 * 
 * NOTA: Solo se pueden actualizar campos del tenant_inventory
 * Los datos del master_product (nombre, categoría, etc.) no se modifican aquí
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
        { error: 'No tienes permisos para actualizar productos' },
        { status: 403 }
      )
    }

    // Verificar que el producto existe y pertenece al tenant
    const existingInventory = await prisma.tenantInventory.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        masterProduct: true,
      },
    })

    if (!existingInventory) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    // Actualizar inventario del tenant
    const updatedInventory = await prisma.tenantInventory.update({
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
        entityId: updatedInventory.id,
        oldValues: existingInventory,
        newValues: updatedInventory,
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    // Transformar a formato compatible
    const product = {
      id: updatedInventory.id,
      sku: updatedInventory.customSku || updatedInventory.masterProduct.sku,
      barcode: updatedInventory.masterProduct.barcode,
      name: updatedInventory.masterProduct.name,
      description: updatedInventory.masterProduct.description,
      category: updatedInventory.masterProduct.category,
      brand: updatedInventory.masterProduct.brand,
      costPrice: updatedInventory.costPrice,
      salePrice: updatedInventory.salePrice,
      stock: updatedInventory.stock,
      minStock: updatedInventory.minStock,
      isActive: updatedInventory.isActive,
      tenantId: updatedInventory.tenantId,
      createdAt: updatedInventory.createdAt,
      updatedAt: updatedInventory.updatedAt,
      masterProductId: updatedInventory.masterProductId,
      location: updatedInventory.location,
      customNotes: updatedInventory.customNotes,
    }

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar producto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id]
 * Eliminar producto del inventario (soft delete)
 * 
 * NOTA: Esto solo marca el item como inactivo en el inventario del tenant
 * No elimina el producto del catálogo maestro
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
        { error: 'No tienes permisos para eliminar productos' },
        { status: 403 }
      )
    }

    // Verificar que el producto existe y pertenece al tenant
    const existingInventory = await prisma.tenantInventory.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingInventory) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete: marcar como inactivo
    const deletedInventory = await prisma.tenantInventory.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'TenantInventory',
        entityId: deletedInventory.id,
        oldValues: existingInventory,
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json({ message: 'Producto eliminado correctamente del inventario' })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}
