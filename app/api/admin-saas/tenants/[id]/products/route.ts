
/**
 * API para gestionar productos de un tenant específico
 * Solo accesible por usuarios con rol PROVEEDOR
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

/**
 * GET /api/admin-saas/tenants/[id]/products
 * Lista todos los productos de un tenant específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // ✅ CORRECTO - Usar TenantInventory en lugar de Product
    const products = await prisma.tenantInventory.findMany({
      where: {
        tenantId: (await params).id,
        ...(activeOnly && { isActive: true }),
      },
      select: {
        id: true,
        sku: true,
        barcode: true,
        name: true,
        category: true,
        brand: true,
        costPrice: true,
        salePrice: true,
        quantity: true,  // ✅ quantity en lugar de stock
        minStock: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular productos con stock bajo
    const lowStockProducts = products.filter(
      p => p.isActive && p.quantity <= p.minStock  // ✅ quantity en lugar de stock
    );

    return NextResponse.json({
      products,
      total: products.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
    });
  } catch (error) {
    console.error('Error al obtener productos del tenant:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos del tenant' },
      { status: 500 }
    );
  }
}
