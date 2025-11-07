
/**
 * API for SaaS Admin Subscription Management
 * GET /api/saas/subscriptions - List all subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
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
      take: limit,
      skip: offset
    });

    const total = await prisma.subscription.count({ where });

    return NextResponse.json({
      subscriptions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Error fetching subscriptions' },
      { status: 500 }
    );
  }
}
