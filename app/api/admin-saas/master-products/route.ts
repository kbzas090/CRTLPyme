/**
 * API para gestionar productos maestros (catálogo compartido)
 * Solo accesible por usuarios con rol PROVEEDOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schema de validación para crear producto maestro
const createMasterProductSchema = z.object({
  sku: z.string().min(1, 'El SKU es requerido'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida'),
  brand: z.string().optional(),
  suggestedPrice: z.number().positive('El precio sugerido debe ser positivo'),
  unit: z.string().default('unidad'),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

/**
 * GET /api/admin-saas/master-products
 * Lista todos los productos maestros del catálogo compartido
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
    const activeOnly = searchParams.get('activeOnly') === 'true'

    // Construir filtros
    const where: any = {}

    if (activeOnly) {
      where.isActive = true
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

    const masterProducts = await prisma.masterProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Obtener categorías únicas
    const categories = await prisma.masterProduct.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })

    return NextResponse.json({
      products: masterProducts,
      total: masterProducts.length,
      categories: categories.map(c => c.category),
    })
  } catch (error) {
    console.error('Error al obtener productos maestros:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos maestros' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin-saas/master-products
 * Crear nuevo producto maestro (solo PROVEEDOR)
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

    // Verificar que es PROVEEDOR
    if (session.user.role !== 'PROVEEDOR') {
      return NextResponse.json(
        { error: 'Solo el administrador SaaS puede crear productos maestros' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createMasterProductSchema.parse(body)

    // Verificar que el SKU no exista
    const existingBySku = await prisma.masterProduct.findUnique({
      where: { sku: validatedData.sku },
    })

    if (existingBySku) {
      return NextResponse.json(
        { error: 'Ya existe un producto maestro con este SKU' },
        { status: 400 }
      )
    }

    // Verificar que el barcode no exista (si se provee)
    if (validatedData.barcode) {
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

    // Crear producto maestro
    const masterProduct = await prisma.masterProduct.create({
      data: validatedData,
    })

    return NextResponse.json(masterProduct, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear producto maestro:', error)
    return NextResponse.json(
      { error: 'Error al crear producto maestro' },
      { status: 500 }
    )
  }
}
