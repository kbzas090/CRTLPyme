
/**
 * API for Recent Subscriptions
 * GET /api/saas/subscriptions/recent
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '10');

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const recentSubscriptions = await prisma.subscription.findMany({
      where: {
        createdAt: {
          gte: daysAgo
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
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({
      subscriptions: recentSubscriptions,
      count: recentSubscriptions.length,
      period: `${days} days`
    });

  } catch (error) {
    console.error('Error fetching recent subscriptions:', error);
    return NextResponse.json(
      { error: 'Error fetching recent subscriptions' },
      { status: 500 }
    );
  }
}
