
/**
 * API para obtener estadísticas generales del sistema SaaS
 * Solo accesible por usuarios con rol PROVEEDOR
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

/**
 * GET /api/admin-saas/stats
 * Obtiene estadísticas generales del sistema multi-tenant
 */
export async function GET(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    // Contar tenants activos e inactivos
    const tenantsActive = await prisma.tenant.count({
      where: { isActive: true },
    });

    const tenantsInactive = await prisma.tenant.count({
      where: { isActive: false },
    });

    // Contar usuarios totales
    const totalUsers = await prisma.user.count();

    // Contar usuarios por rol
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    // Contar productos totales
    const totalProducts = await prisma.product.count({
      where: { isActive: true },
    });

    // Contar ventas totales y monto
    const salesStats = await prisma.sale.aggregate({
      where: {
        status: 'COMPLETED',
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    // Obtener distribución de planes
    const planDistribution = await prisma.tenant.groupBy({
      by: ['planType'],
      _count: true,
      where: {
        isActive: true,
      },
    });

    // Obtener top 5 tenants por ventas
    const topTenants = await prisma.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        businessName: true,
        rut: true,
        planType: true,
        sales: {
          where: { status: 'COMPLETED' },
          select: {
            total: true,
          },
        },
      },
      take: 100, // Traer todos para calcular
    });

    // Calcular totales de venta por tenant
    const tenantsWithSales = topTenants.map(tenant => {
      const totalSales = tenant.sales.reduce(
        (sum, sale) => sum + Number(sale.total),
        0
      );
      return {
        id: tenant.id,
        businessName: tenant.businessName,
        rut: tenant.rut,
        planType: tenant.planType,
        totalSales,
        salesCount: tenant.sales.length,
      };
    });

    // Ordenar por ventas y tomar top 5
    const top5Tenants = tenantsWithSales
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);

    // Obtener tenants creados recientemente (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTenants = await prisma.tenant.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return NextResponse.json({
      overview: {
        tenantsActive,
        tenantsInactive,
        tenantsTotal: tenantsActive + tenantsInactive,
        recentTenants,
        totalUsers,
        totalProducts,
        totalSales: salesStats._count,
        totalSalesAmount: salesStats._sum.total || 0,
      },
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count,
      })),
      planDistribution: planDistribution.map(item => ({
        plan: item.planType,
        count: item._count,
      })),
      topTenants: top5Tenants,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del sistema' },
      { status: 500 }
    );
  }
}
