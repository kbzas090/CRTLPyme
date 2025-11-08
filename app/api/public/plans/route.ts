/**
 * Public API for Subscription Plans
 * GET /api/public/plans - List all visible and active plans
 * No authentication required
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isVisible: true,
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        billingCycle: true,
        trialDays: true,
        isVisible: true,
        isActive: true,
        features: true,
        maxUsers: true,
        maxProducts: true,
        maxSales: true,
        sortOrder: true,
      }
    });

    return NextResponse.json({
      plans: plans.map(plan => ({
        ...plan,
        price: Number(plan.price), // Convert Decimal to number for JSON
      }))
    });

  } catch (error) {
    console.error('Error fetching public plans:', error);
    return NextResponse.json(
      { error: 'Error fetching plans' },
      { status: 500 }
    );
  }
}
