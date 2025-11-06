/**
 * API para obtener métricas completas del panel de administrador SaaS
 * Incluye métricas de suscripciones, ingresos, tenants, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

/**
 * GET /api/admin-saas/metrics
 * Obtiene métricas completas del dashboard admin SaaS
 */
export async function GET(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // day, week, month, year

    // Calcular rangos de fechas
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate = new Date();
    if (period === 'day') {
      startDate = startOfToday;
    } else if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // === MÉTRICAS DE TENANTS ===
    const [totalTenants, activeTenants, trialTenants, suspendedTenants, newTenantsInPeriod] =
      await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({ where: { accountStatus: 'ACTIVE', isActive: true } }),
        prisma.tenant.count({ where: { accountStatus: 'TRIAL' } }),
        prisma.tenant.count({ where: { accountStatus: 'SUSPENDED' } }),
        prisma.tenant.count({
          where: {
            createdAt: {
              gte: startDate,
            },
          },
        }),
      ]);

    // === MÉTRICAS DE SUSCRIPCIONES ===
    const subscriptionStats = await prisma.subscription.groupBy({
      by: ['status'],
      _count: true,
    });

    const subscriptionsByStatus = subscriptionStats.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Suscripciones por plan
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ['planId'],
      where: {
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
      _count: true,
    });

    const plansWithSubscriptions = await Promise.all(
      subscriptionsByPlan.map(async (item) => {
        const plan = await prisma.subscriptionPlan.findUnique({
          where: { id: item.planId },
          select: { name: true },
        });
        return {
          planName: plan?.name || 'Desconocido',
          count: item._count,
        };
      })
    );

    // === MÉTRICAS DE INGRESOS ===
    
    // Ingresos totales (todos los tiempos)
    const totalRevenue = await prisma.subscriptionPayment.aggregate({
      where: {
        status: 'APPROVED',
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Ingresos en el período
    const periodRevenue = await prisma.subscriptionPayment.aggregate({
      where: {
        status: 'APPROVED',
        paymentDate: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Ingresos mensuales (MRR - Monthly Recurring Revenue)
    const monthlyRevenue = await prisma.subscriptionPayment.aggregate({
      where: {
        status: 'APPROVED',
        paymentDate: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Calcular MRR basado en suscripciones activas
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
      include: {
        plan: true,
      },
    });

    let calculatedMRR = 0;
    activeSubscriptions.forEach((sub) => {
      const price = Number(sub.plan.price);
      if (sub.billingCycle === 'MONTHLY') {
        calculatedMRR += price;
      } else if (sub.billingCycle === 'QUARTERLY') {
        calculatedMRR += price / 3;
      } else if (sub.billingCycle === 'ANNUAL') {
        calculatedMRR += price / 12;
      }
    });

    // Ingresos trimestrales
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const quarterlyRevenue = await prisma.subscriptionPayment.aggregate({
      where: {
        status: 'APPROVED',
        paymentDate: {
          gte: quarterStart,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Ingresos anuales
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const annualRevenue = await prisma.subscriptionPayment.aggregate({
      where: {
        status: 'APPROVED',
        paymentDate: {
          gte: yearStart,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // === MÉTRICAS DE PAGOS ===
    const [successfulPayments, failedPayments, pendingPayments] = await Promise.all([
      prisma.subscriptionPayment.count({
        where: { status: 'APPROVED' },
      }),
      prisma.subscriptionPayment.count({
        where: { status: 'FAILED' },
      }),
      prisma.subscriptionPayment.count({
        where: { status: 'PENDING' },
      }),
    ]);

    // Tasa de éxito de pagos
    const totalPaymentAttempts = successfulPayments + failedPayments;
    const paymentSuccessRate =
      totalPaymentAttempts > 0
        ? ((successfulPayments / totalPaymentAttempts) * 100).toFixed(2)
        : '0.00';

    // === MÉTRICAS DE CRECIMIENTO ===
    
    // Nuevas suscripciones en el período
    const newSubscriptionsInPeriod = await prisma.subscription.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Suscripciones canceladas en el período
    const cancelledSubscriptionsInPeriod = await prisma.subscription.count({
      where: {
        status: 'CANCELLED',
        cancelledAt: {
          gte: startDate,
        },
      },
    });

    // Calcular tasa de churn (cancelaciones / total activas al inicio del período)
    const churnRate =
      activeTenants > 0
        ? ((cancelledSubscriptionsInPeriod / activeTenants) * 100).toFixed(2)
        : '0.00';

    // === MÉTRICAS PROMEDIO ===
    
    // Revenue por usuario (ARPU - Average Revenue Per User)
    const arpu =
      activeTenants > 0
        ? (Number(totalRevenue._sum.amount || 0) / activeTenants).toFixed(2)
        : '0.00';

    // Lifetime Value promedio
    const avgLifetimeValue = await prisma.subscription.aggregate({
      where: {
        lifetimeValue: {
          not: null,
        },
      },
      _avg: {
        lifetimeValue: true,
      },
    });

    // === TOP CLIENTES ===
    const topCustomersByRevenue = await prisma.tenant.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        businessName: true,
        email: true,
        planType: true,
        subscriptionPayments: {
          where: {
            status: 'APPROVED',
          },
          select: {
            amount: true,
          },
        },
      },
      take: 100,
    });

    const topCustomers = topCustomersByRevenue
      .map((tenant) => ({
        id: tenant.id,
        businessName: tenant.businessName,
        email: tenant.email,
        planType: tenant.planType,
        totalPaid: tenant.subscriptionPayments.reduce(
          (sum, payment) => sum + Number(payment.amount),
          0
        ),
      }))
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 5);

    // === DISTRIBUCIÓN DE CICLOS DE FACTURACIÓN ===
    const billingCycleDistribution = await prisma.subscription.groupBy({
      by: ['billingCycle'],
      where: {
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
      _count: true,
    });

    // === PRÓXIMAS RENOVACIONES ===
    const upcomingRenewals = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        autoRenew: true,
        nextBillingDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Próximos 7 días
        },
      },
    });

    return NextResponse.json({
      period,
      dateRange: {
        from: startDate,
        to: now,
      },
      tenants: {
        total: totalTenants,
        active: activeTenants,
        trial: trialTenants,
        suspended: suspendedTenants,
        newInPeriod: newTenantsInPeriod,
      },
      subscriptions: {
        byStatus: subscriptionsByStatus,
        byPlan: plansWithSubscriptions,
        newInPeriod: newSubscriptionsInPeriod,
        cancelledInPeriod: cancelledSubscriptionsInPeriod,
        upcomingRenewals,
      },
      revenue: {
        total: Number(totalRevenue._sum.amount || 0),
        periodRevenue: Number(periodRevenue._sum.amount || 0),
        monthly: Number(monthlyRevenue._sum.amount || 0),
        quarterly: Number(quarterlyRevenue._sum.amount || 0),
        annual: Number(annualRevenue._sum.amount || 0),
        mrr: calculatedMRR,
        arpu: Number(arpu),
      },
      payments: {
        successful: successfulPayments,
        failed: failedPayments,
        pending: pendingPayments,
        successRate: Number(paymentSuccessRate),
        totalInPeriod: periodRevenue._count,
      },
      growth: {
        churnRate: Number(churnRate),
        avgLifetimeValue: Number(avgLifetimeValue._avg.lifetimeValue || 0),
      },
      billingCycles: billingCycleDistribution.map((item) => ({
        cycle: item.billingCycle,
        count: item._count,
      })),
      topCustomers,
    });
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    return NextResponse.json(
      { error: 'Error al obtener métricas del sistema' },
      { status: 500 }
    );
  }
}
