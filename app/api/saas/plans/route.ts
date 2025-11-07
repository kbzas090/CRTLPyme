
/**
 * API for Subscription Plan Management
 * GET /api/saas/plans - List all plans
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: {
        sortOrder: 'asc'
      },
      include: {
        _count: {
          select: {
            subscriptions: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      plans: plans.map(plan => ({
        ...plan,
        activeSubscriptions: plan._count.subscriptions
      }))
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Error fetching plans' },
      { status: 500 }
    );
  }
}
