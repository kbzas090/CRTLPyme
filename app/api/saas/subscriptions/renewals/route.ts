
/**
 * API for Upcoming Subscription Renewals
 * GET /api/saas/subscriptions/renewals
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '10');

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const upcomingRenewals = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: {
          gte: now,
          lte: futureDate
        }
      },
      include: {
        tenant: {
          select: {
            id: true,
            businessName: true,
            email: true,
            rut: true
          }
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            billingCycle: true
          }
        }
      },
      orderBy: {
        nextBillingDate: 'asc'
      },
      take: limit
    });

    return NextResponse.json({
      renewals: upcomingRenewals,
      count: upcomingRenewals.length,
      period: `${days} days`
    });

  } catch (error) {
    console.error('Error fetching upcoming renewals:', error);
    return NextResponse.json(
      { error: 'Error fetching upcoming renewals' },
      { status: 500 }
    );
  }
}
