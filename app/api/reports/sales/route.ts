
/**
 * API para generar reportes de ventas
 * GET /api/reports/sales
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermissions } from '@/lib/api-auth';
import { MODULES, ACTIONS } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  // Verificar permisos: requiere acceso al módulo de reportes de ventas con acción VIEW
  const authResult = await requirePermissions({
    module: MODULES.REPORTS_SALES,
    action: ACTIONS.VIEW,
  });

  if (!authResult.success) {
    return authResult.response;
  }

  const { user } = authResult;

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || user.tenantId;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

  // Verificar acceso al tenant
  const tenantCheckResult = await requirePermissions({ tenantId });
  if (!tenantCheckResult.success) {
    return tenantCheckResult.response;
  }

  try {
    // Construir filtros de fecha
    const dateFilter: any = {
      tenantId,
      status: 'COMPLETED',
    };

    if (startDate) {
      dateFilter.createdAt = {
        ...dateFilter.createdAt,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.createdAt = {
        ...dateFilter.createdAt,
        lte: end,
      };
    }

    // Obtener ventas con items
    const sales = await prisma.sale.findMany({
      where: dateFilter,
      include: {
        items: {
          include: {
            tenantInventory: {
              include: {
                masterProduct: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular estadísticas generales
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalProfit = sales.reduce((sum, sale) => {
      const saleProfit = sale.items.reduce((itemSum, item) => {
        return itemSum + (Number(item.unitPrice) - Number(item.unitCost)) * item.quantity;
      }, 0);
      return sum + saleProfit;
    }, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Agrupar ventas por período
    const salesByPeriod = sales.reduce((acc: any, sale) => {
      const date = new Date(sale.createdAt);
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekNumber = getWeekNumber(date);
        key = `${date.getFullYear()}-W${weekNumber}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!acc[key]) {
        acc[key] = {
          period: key,
          sales: 0,
          revenue: 0,
          profit: 0,
        };
      }

      acc[key].sales += 1;
      acc[key].revenue += Number(sale.total);
      acc[key].profit += sale.items.reduce((itemSum, item) => {
        return itemSum + (Number(item.unitPrice) - Number(item.unitCost)) * item.quantity;
      }, 0);

      return acc;
    }, {});

    // Ventas por método de pago
    const salesByPaymentMethod = sales.reduce((acc: any, sale) => {
      const method = sale.paymentMethod;
      if (!acc[method]) {
        acc[method] = {
          method,
          count: 0,
          total: 0,
        };
      }
      acc[method].count += 1;
      acc[method].total += Number(sale.total);
      return acc;
    }, {});

    // Ventas por usuario (cajero)
    const salesByUser = sales.reduce((acc: any, sale) => {
      const userName = `${sale.user.firstName} ${sale.user.lastName}`;
      if (!acc[userName]) {
        acc[userName] = {
          user: userName,
          count: 0,
          total: 0,
        };
      }
      acc[userName].count += 1;
      acc[userName].total += Number(sale.total);
      return acc;
    }, {});

    // Top productos vendidos
    const productSales: any = {};
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const productName = item.tenantInventory.masterProduct.name;
        if (!productSales[productName]) {
          productSales[productName] = {
            name: productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += Number(item.subtotal);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json({
      summary: {
        totalSales,
        totalRevenue,
        totalProfit,
        averageTicket,
        profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      },
      salesByPeriod: Object.values(salesByPeriod),
      salesByPaymentMethod: Object.values(salesByPaymentMethod),
      salesByUser: Object.values(salesByUser),
      topProducts,
      rawSales: sales.map((sale) => ({
        id: sale.id,
        saleNumber: sale.saleNumber,
        total: Number(sale.total),
        paymentMethod: sale.paymentMethod,
        cashier: `${sale.user.firstName} ${sale.user.lastName}`,
        createdAt: sale.createdAt,
        itemCount: sale.items.length,
      })),
    });
  } catch (error) {
    console.error('Error generando reporte de ventas:', error);
    return NextResponse.json(
      { error: 'Error al generar reporte de ventas' },
      { status: 500 }
    );
  }
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
