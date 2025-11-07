
/**
 * API for Revenue Data and Trends
 * GET /api/saas/revenue
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '6');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get monthly revenue data
    const payments = await prisma.subscriptionPayment.findMany({
      where: {
        status: 'APPROVED',
        paymentDate: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        amount: true,
        paymentDate: true,
        subscription: {
          select: {
            plan: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Group by month
    const monthlyRevenue: { [key: string]: number } = {};
    const planRevenue: { [key: string]: number } = {};

    payments.forEach(payment => {
      if (payment.paymentDate) {
        const monthKey = payment.paymentDate.toISOString().substring(0, 7); // YYYY-MM
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + Number(payment.amount);

        const planName = payment.subscription.plan.name;
        planRevenue[planName] = (planRevenue[planName] || 0) + Number(payment.amount);
      }
    });

    // Format for chart
    const revenueData = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month,
        revenue: amount
      }));

    const planRevenueData = Object.entries(planRevenue).map(([plan, amount]) => ({
      plan,
      revenue: amount
    }));

    return NextResponse.json({
      monthlyRevenue: revenueData,
      planRevenue: planRevenueData,
      totalRevenue: Object.values(monthlyRevenue).reduce((sum, val) => sum + val, 0)
    });

  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Error fetching revenue data' },
      { status: 500 }
    );
  }
}
