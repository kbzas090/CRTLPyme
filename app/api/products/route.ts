
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { canPerformAction } from '@/lib/subscription-middleware'

// Schema de validación para crear producto
const createProductSchema = z.object({
  sku: z.string().min(1, 'El código es requerido'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida'),
  brand: z.string().optional(),
  costPrice: z.number().positive('El precio de compra debe ser positivo'),
  salePrice: z.number().positive('El precio de venta debe ser positivo'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo').default(0),
  minStock: z.number().int().min(0, 'El stock mínimo no puede ser negativo').default(5),
})

// GET: Listar productos del tenant
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

    // Construir filtros
    const where: any = {
      tenantId: session.user.tenantId,
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

// POST: Crear nuevo producto
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

    // VALIDACIÓN DE LÍMITES DE SUSCRIPCIÓN
    const limitCheck = await canPerformAction(session.user.tenantId, 'create_product')
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.message,
          limitExceeded: true,
          upgradeRequired: true 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar datos
    const validatedData = createProductSchema.parse(body)

    // Verificar que el SKU no exista para este tenant
    const existingProduct = await prisma.product.findUnique({
      where: {
        tenantId_sku: {
          tenantId: session.user.tenantId,
          sku: validatedData.sku,
        },
      },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Ya existe un producto con este código' },
        { status: 400 }
      )
    }

    // Crear producto
    const product = await prisma.product.create({
      data: {
        ...validatedData,
        tenantId: session.user.tenantId,
      },
    })

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Product',
        entityId: product.id,
        newValues: product,
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

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
