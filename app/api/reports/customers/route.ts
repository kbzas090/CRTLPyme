
/**
 * API para generar reportes de clientes
 * GET /api/reports/customers
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

  // Solo ADMIN y PROVEEDOR pueden ver reportes
  if (!['ADMIN', 'PROVEEDOR'].includes(session.user.role)) {
    return NextResponse.json(
      { error: 'No tiene permisos para ver reportes' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || session.user.tenantId;
  const minPurchases = searchParams.get('minPurchases');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Verify access to tenant
  if (tenantId !== session.user.tenantId && session.user.role !== 'PROVEEDOR') {
    return NextResponse.json(
      { error: 'No tiene permisos para ver reportes de este tenant' },
      { status: 403 }
    );
  }

  try {
    // Construir filtros de fecha para clientes
    const customerFilter: any = {
      tenantId,
      isActive: true,
    };

    // Aplicar filtros de fecha si se proporcionan
    if (startDate || endDate) {
      customerFilter.createdAt = {};
      
      if (startDate) {
        customerFilter.createdAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        customerFilter.createdAt.lte = end;
      }
    }

    // Obtener clientes con sus compras
    const customers = await prisma.customer.findMany({
      where: customerFilter,
      include: {
        sales: {
          where: {
            status: 'COMPLETED',
          },
          include: {
            items: true,
          },
        },
      },
    });

    // Calcular estadísticas por cliente
    const customerStats = customers.map((customer) => {
      const totalPurchases = customer.sales.length;
      const totalSpent = customer.sales.reduce(
        (sum, sale) => sum + Number(sale.total),
        0
      );
      const averageTicket = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
      
      const lastPurchaseDate =
        customer.sales.length > 0
          ? new Date(
              Math.max(...customer.sales.map((s) => s.createdAt.getTime()))
            )
          : null;

      const firstPurchaseDate =
        customer.sales.length > 0
          ? new Date(
              Math.min(...customer.sales.map((s) => s.createdAt.getTime()))
            )
          : null;

      // Calcular productos únicos comprados
      const uniqueProducts = new Set(
        customer.sales.flatMap((sale) =>
          sale.items.map((item) => item.tenantInventoryId)
        )
      );

      return {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
        rut: customer.rut,
        totalPurchases,
        totalSpent,
        averageTicket,
        uniqueProducts: uniqueProducts.size,
        lastPurchaseDate,
        firstPurchaseDate,
        daysSinceLastPurchase: lastPurchaseDate
          ? Math.floor(
              (Date.now() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          : null,
      };
    });

    // Filtrar por mínimo de compras si se especifica
    let filteredCustomers = customerStats;
    if (minPurchases) {
      const min = parseInt(minPurchases);
      filteredCustomers = customerStats.filter(
        (c) => c.totalPurchases >= min
      );
    }

    // Estadísticas generales
    const totalCustomers = filteredCustomers.length;
    const totalRevenue = filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    const activeCustomers = filteredCustomers.filter(
      (c) => c.daysSinceLastPurchase !== null && c.daysSinceLastPurchase <= 30
    ).length;

    // Top clientes
    const topCustomers = [...filteredCustomers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Clientes más frecuentes
    const mostFrequentCustomers = [...filteredCustomers]
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, 10);

    // Segmentación por valor de compra
    const segments = {
      vip: filteredCustomers.filter((c) => c.totalSpent > 100000),
      regular: filteredCustomers.filter(
        (c) => c.totalSpent > 50000 && c.totalSpent <= 100000
      ),
      occasional: filteredCustomers.filter(
        (c) => c.totalSpent > 10000 && c.totalSpent <= 50000
      ),
      new: filteredCustomers.filter((c) => c.totalSpent <= 10000),
    };

    // Clientes en riesgo (sin compras en más de 60 días)
    const atRiskCustomers = filteredCustomers.filter(
      (c) => c.daysSinceLastPurchase !== null && c.daysSinceLastPurchase > 60
    );

    return NextResponse.json({
      summary: {
        totalCustomers,
        activeCustomers,
        totalRevenue,
        averageCustomerValue,
        averagePurchaseFrequency:
          totalCustomers > 0
            ? filteredCustomers.reduce((sum, c) => sum + c.totalPurchases, 0) /
              totalCustomers
            : 0,
      },
      customers: filteredCustomers,
      topCustomers,
      mostFrequentCustomers,
      segments: {
        vip: {
          count: segments.vip.length,
          totalRevenue: segments.vip.reduce((sum, c) => sum + c.totalSpent, 0),
        },
        regular: {
          count: segments.regular.length,
          totalRevenue: segments.regular.reduce((sum, c) => sum + c.totalSpent, 0),
        },
        occasional: {
          count: segments.occasional.length,
          totalRevenue: segments.occasional.reduce(
            (sum, c) => sum + c.totalSpent,
            0
          ),
        },
        new: {
          count: segments.new.length,
          totalRevenue: segments.new.reduce((sum, c) => sum + c.totalSpent, 0),
        },
      },
      atRiskCustomers: atRiskCustomers.length,
    });
  } catch (error) {
    console.error('Error generando reporte de clientes:', error);
    return NextResponse.json(
      { error: 'Error al generar reporte de clientes' },
      { status: 500 }
    );
  }
}
