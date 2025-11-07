
/**
 * API for SaaS Admin Subscription Metrics
 * GET /api/saas/metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    // Get current date for comparisons
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total active accounts (tenants with active subscriptions)
    const activeAccounts = await prisma.tenant.count({
      where: {
        isActive: true,
        subscriptions: {
          some: {
            status: 'ACTIVE',
            endDate: {
              gte: now
            }
          }
        }
      }
    });

    // Upcoming subscription renewals (next 30 days)
    const upcomingRenewals = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        nextBillingDate: {
          gte: now,
          lte: thirtyDaysFromNow
        }
      }
    });

    // Recent subscriptions (last 7 days)
    const recentSubscriptions = await prisma.subscription.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Monthly subscription revenue (current month)
    const monthlyRevenue = await prisma.subscriptionPayment.aggregate({
      where: {
        status: 'APPROVED',
        paymentDate: {
          gte: firstDayOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });

    // Plan distribution
    const planDistribution = await prisma.subscription.groupBy({
      by: ['planId'],
      where: {
        status: 'ACTIVE'
      },
      _count: true
    });

    // Get plan details for distribution
    const planDetails = await prisma.subscriptionPlan.findMany({
      where: {
        id: {
          in: planDistribution.map(p => p.planId)
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    const planDistributionWithNames = planDistribution.map(pd => {
      const plan = planDetails.find(p => p.id === pd.planId);
      return {
        planId: pd.planId,
        planName: plan?.name || 'Unknown',
        count: pd._count
      };
    });

    return NextResponse.json({
      activeAccounts,
      upcomingRenewals,
      recentSubscriptions,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      planDistribution: planDistributionWithNames
    });

  } catch (error) {
    console.error('Error fetching SaaS metrics:', error);
    return NextResponse.json(
      { error: 'Error fetching metrics' },
      { status: 500 }
    );
  }
}
