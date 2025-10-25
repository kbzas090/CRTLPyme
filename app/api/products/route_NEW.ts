/**
 * API de productos - NUEVA VERSIÓN usando catálogo maestro
 * Esta API actúa como una capa de compatibilidad que redirige a inventory
 * 
 * MIGRACIÓN: Esta API reemplaza la antigua que usaba la tabla 'products'
 * Ahora usa master_products + tenant_inventory
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schema de validación para crear producto
const createProductSchema = z.object({
  // Datos del producto maestro (opcional si ya existe)
  sku: z.string().min(1, 'El código es requerido'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida'),
  brand: z.string().optional(),
  
  // Datos específicos del inventario del tenant
  costPrice: z.number().positive('El precio de compra debe ser positivo'),
  salePrice: z.number().positive('El precio de venta debe ser positivo'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo').default(0),
  minStock: z.number().int().min(0, 'El stock mínimo no puede ser negativo').default(5),
  location: z.string().optional(),
  customNotes: z.string().optional(),
})

/**
 * GET /api/products
 * Lista los productos del inventario del tenant
 * 
 * Esta API ahora devuelve los productos del tenant_inventory con información del master_product
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
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true'

    // Construir filtros para tenant_inventory
    const where: any = {
      tenantId: session.user.tenantId,
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
        masterProduct: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filtrar productos con stock bajo si se solicita
    let filteredInventory = inventory
    if (lowStockOnly) {
      filteredInventory = inventory.filter(item => item.stock <= item.minStock)
    }

    // Transformar a formato compatible con la API antigua de products
    const products = filteredInventory.map(item => ({
      id: item.id,
      sku: item.customSku || item.masterProduct.sku,
      barcode: item.masterProduct.barcode,
      name: item.masterProduct.name,
      description: item.masterProduct.description,
      category: item.masterProduct.category,
      brand: item.masterProduct.brand,
      costPrice: item.costPrice,
      salePrice: item.salePrice,
      stock: item.stock,
      minStock: item.minStock,
      isActive: item.isActive,
      tenantId: item.tenantId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      // Datos adicionales del nuevo modelo
      masterProductId: item.masterProductId,
      location: item.location,
      customNotes: item.customNotes,
      suggestedPrice: item.masterProduct.suggestedPrice,
      unit: item.masterProduct.unit,
      imageUrl: item.masterProduct.imageUrl,
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products
 * Crea un producto en el inventario del tenant
 * 
 * NUEVO COMPORTAMIENTO:
 * 1. Busca si existe un master_product con el SKU proporcionado
 * 2. Si no existe, lo crea en master_products
 * 3. Agrega el producto al tenant_inventory del usuario
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

    // Verificar permisos (solo ADMIN e INVENTARIO pueden crear productos)
    if (!['ADMIN', 'INVENTARIO', 'PROVEEDOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear productos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar datos
    const validatedData = createProductSchema.parse(body)

    // 1. Buscar o crear el producto maestro
    let masterProduct = await prisma.masterProduct.findUnique({
      where: { sku: validatedData.sku },
    })

    if (!masterProduct) {
      // Crear producto maestro si no existe
      masterProduct = await prisma.masterProduct.create({
        data: {
          sku: validatedData.sku,
          barcode: validatedData.barcode,
          name: validatedData.name,
          description: validatedData.description,
          category: validatedData.category,
          brand: validatedData.brand,
          suggestedPrice: validatedData.salePrice, // Usar el precio de venta como sugerido
          unit: 'unidad',
        },
      })
    }

    // 2. Verificar que el tenant no tenga ya este producto
    const existingInventory = await prisma.tenantInventory.findUnique({
      where: {
        tenantId_masterProductId: {
          tenantId: session.user.tenantId,
          masterProductId: masterProduct.id,
        },
      },
    })

    if (existingInventory) {
      return NextResponse.json(
        { error: 'Ya existe un producto con este código en tu inventario' },
        { status: 400 }
      )
    }

    // 3. Agregar al inventario del tenant
    const inventoryItem = await prisma.tenantInventory.create({
      data: {
        tenantId: session.user.tenantId,
        masterProductId: masterProduct.id,
        customSku: validatedData.sku !== masterProduct.sku ? validatedData.sku : null,
        costPrice: validatedData.costPrice,
        salePrice: validatedData.salePrice,
        stock: validatedData.stock,
        minStock: validatedData.minStock,
        location: validatedData.location,
        customNotes: validatedData.customNotes,
      },
      include: {
        masterProduct: true,
      },
    })

    // 4. Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'TenantInventory',
        entityId: inventoryItem.id,
        newValues: inventoryItem,
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    // Transformar a formato compatible
    const product = {
      id: inventoryItem.id,
      sku: inventoryItem.customSku || masterProduct.sku,
      barcode: masterProduct.barcode,
      name: masterProduct.name,
      description: masterProduct.description,
      category: masterProduct.category,
      brand: masterProduct.brand,
      costPrice: inventoryItem.costPrice,
      salePrice: inventoryItem.salePrice,
      stock: inventoryItem.stock,
      minStock: inventoryItem.minStock,
      isActive: inventoryItem.isActive,
      tenantId: inventoryItem.tenantId,
      createdAt: inventoryItem.createdAt,
      updatedAt: inventoryItem.updatedAt,
      masterProductId: inventoryItem.masterProductId,
      location: inventoryItem.location,
      customNotes: inventoryItem.customNotes,
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear producto:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}
