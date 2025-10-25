/**
 * API para listar productos disponibles del pool (que el tenant NO tiene en su inventario)
 * Accesible por ADMIN, INVENTARIO
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/inventory/available-products
 * Lista productos maestros que el tenant puede agregar a su inventario
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

    // Obtener IDs de productos que el tenant ya tiene en su inventario
    const existingInventory = await prisma.tenantInventory.findMany({
      where: {
        tenantId: session.user.tenantId,
      },
      select: {
        masterProductId: true,
      },
    })

    const existingProductIds = existingInventory.map(item => item.masterProductId)

    // Construir filtros para productos disponibles
    const where: any = {
      isActive: true,
      id: {
        notIn: existingProductIds,
      },
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

    const availableProducts = await prisma.masterProduct.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    // Obtener categorías únicas de productos disponibles
    const categories = await prisma.masterProduct.findMany({
      where: {
        isActive: true,
        id: {
          notIn: existingProductIds,
        },
      },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })

    return NextResponse.json({
      products: availableProducts,
      total: availableProducts.length,
      categories: categories.map(c => c.category),
    })
  } catch (error) {
    console.error('Error al obtener productos disponibles:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos disponibles' },
      { status: 500 }
    )
  }
}
