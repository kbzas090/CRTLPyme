
/**
 * API para generar reportes de productos
 * GET /api/reports/products
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }

  // Solo ADMIN, INVENTARIO y PROVEEDOR pueden ver reportes
  if (!['ADMIN', 'INVENTARIO', 'PROVEEDOR'].includes(session.user.role)) {
    return NextResponse.json(
      { error: 'No tiene permisos para ver reportes' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || session.user.tenantId;
  const category = searchParams.get('category');
  const lowStock = searchParams.get('lowStock') === 'true';

  // Verify access to tenant
  if (tenantId !== session.user.tenantId && session.user.role !== 'PROVEEDOR') {
    return NextResponse.json(
      { error: 'No tiene permisos para ver reportes de este tenant' },
      { status: 403 }
    );
  }

  try {
    // Construir filtros
    const filter: any = {
      tenantId,
      isActive: true,
    };

    // Obtener inventario
    const inventory = await prisma.tenantInventory.findMany({
      where: filter,
      include: {
        masterProduct: true,
        saleItems: {
          include: {
            sale: {
              select: {
                createdAt: true,
                total: true,
              },
            },
          },
        },
        stockAdjustments: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // Filtrar por categoría si se especifica
    let filteredInventory = inventory;
    if (category) {
      filteredInventory = inventory.filter(
        (item) => item.masterProduct.category === category
      );
    }

    // Filtrar productos con stock bajo
    if (lowStock) {
      filteredInventory = filteredInventory.filter(
        (item) => item.stock <= item.minStock
      );
    }

    // Calcular estadísticas por producto
    const productStats = filteredInventory.map((item) => {
      const totalSold = item.saleItems.reduce((sum, saleItem) => sum + saleItem.quantity, 0);
      const totalRevenue = item.saleItems.reduce(
        (sum, saleItem) => sum + Number(saleItem.subtotal),
        0
      );
      const profit =
        (Number(item.salePrice) - Number(item.costPrice)) * item.stock;

      return {
        id: item.id,
        sku: item.customSku || item.masterProduct.sku,
        name: item.masterProduct.name,
        category: item.masterProduct.category,
        brand: item.masterProduct.brand,
        currentStock: item.stock,
        minStock: item.minStock,
        stockStatus:
          item.stock <= 0
            ? 'OUT_OF_STOCK'
            : item.stock <= item.minStock
            ? 'LOW_STOCK'
            : 'NORMAL',
        costPrice: Number(item.costPrice),
        salePrice: Number(item.salePrice),
        profitMargin:
          Number(item.salePrice) > 0
            ? ((Number(item.salePrice) - Number(item.costPrice)) /
                Number(item.salePrice)) *
              100
            : 0,
        totalSold,
        totalRevenue,
        inventoryValue: Number(item.costPrice) * item.stock,
        potentialProfit: profit,
        lastSaleDate:
          item.saleItems.length > 0
            ? new Date(
                Math.max(
                  ...item.saleItems.map((si) =>
                    si.sale.createdAt.getTime()
                  )
                )
              )
            : null,
      };
    });

    // Estadísticas generales
    const totalProducts = productStats.length;
    const totalInventoryValue = productStats.reduce(
      (sum, p) => sum + p.inventoryValue,
      0
    );
    const totalRevenue = productStats.reduce((sum, p) => sum + p.totalRevenue, 0);
    const outOfStock = productStats.filter((p) => p.stockStatus === 'OUT_OF_STOCK').length;
    const lowStockCount = productStats.filter((p) => p.stockStatus === 'LOW_STOCK').length;

    // Productos por categoría
    const categoriesMap: any = {};
    productStats.forEach((product) => {
      if (!categoriesMap[product.category]) {
        categoriesMap[product.category] = {
          category: product.category,
          count: 0,
          totalValue: 0,
          totalRevenue: 0,
        };
      }
      categoriesMap[product.category].count += 1;
      categoriesMap[product.category].totalValue += product.inventoryValue;
      categoriesMap[product.category].totalRevenue += product.totalRevenue;
    });

    const productsByCategory = Object.values(categoriesMap);

    // Top productos por ventas
    const topSellingProducts = [...productStats]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    // Productos con mayor margen
    const topProfitMarginProducts = [...productStats]
      .sort((a, b) => b.profitMargin - a.profitMargin)
      .slice(0, 10);

    return NextResponse.json({
      summary: {
        totalProducts,
        totalInventoryValue,
        totalRevenue,
        outOfStock,
        lowStock: lowStockCount,
        averageProductValue: totalProducts > 0 ? totalInventoryValue / totalProducts : 0,
      },
      products: productStats,
      productsByCategory,
      topSellingProducts,
      topProfitMarginProducts,
    });
  } catch (error) {
    console.error('Error generando reporte de productos:', error);
    return NextResponse.json(
      { error: 'Error al generar reporte de productos' },
      { status: 500 }
    );
  }
}
