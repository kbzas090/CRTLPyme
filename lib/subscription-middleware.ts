/**
 * Subscription Middleware
 * Checks subscription status and enforces access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './db';

export interface SubscriptionCheckResult {
  allowed: boolean;
  message?: string;
  subscription?: any;
  redirectTo?: string;
}

/**
 * Check if tenant has an active subscription
 */
export async function checkSubscriptionAccess(
  tenantId: string
): Promise<SubscriptionCheckResult> {
  try {
    // Get the most recent subscription for this tenant
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return {
        allowed: false,
        message: 'No se encontró ninguna suscripción. Por favor, contrate un plan.',
        redirectTo: '/subscriptions/plans',
      };
    }

    // Check if subscription is active or in trial
    if (!['ACTIVE', 'TRIAL'].includes(subscription.status)) {
      let message = 'Su suscripción no está activa.';
      
      if (subscription.status === 'EXPIRED') {
        message = 'Su suscripción ha expirado. Por favor, renueve su plan.';
      } else if (subscription.status === 'CANCELLED') {
        message = 'Su suscripción ha sido cancelada. Por favor, reactive su cuenta.';
      } else if (subscription.status === 'SUSPENDED') {
        message = 'Su cuenta está suspendida. Por favor, contacte con soporte.';
      }

      return {
        allowed: false,
        message,
        subscription,
        redirectTo: '/subscriptions/renew',
      };
    }

    // Check if trial has expired
    if (subscription.status === 'TRIAL' && subscription.trialEndsAt) {
      const now = new Date();
      if (subscription.trialEndsAt < now) {
        return {
          allowed: false,
          message: 'Su período de prueba ha expirado. Por favor, contrate un plan.',
          subscription,
          redirectTo: '/subscriptions/plans',
        };
      }
    }

    // Check if subscription has ended
    if (subscription.endDate && subscription.endDate < new Date()) {
      return {
        allowed: false,
        message: 'Su suscripción ha finalizado. Por favor, renueve su plan.',
        subscription,
        redirectTo: '/subscriptions/renew',
      };
    }

    // All checks passed
    return {
      allowed: true,
      subscription,
    };
  } catch (error) {
    console.error('[SUBSCRIPTION MIDDLEWARE] Error checking subscription:', error);
    return {
      allowed: false,
      message: 'Error al verificar suscripción. Por favor, intente de nuevo.',
    };
  }
}

/**
 * Check if tenant's plan supports a specific feature
 */
export async function checkFeatureAccess(
  tenantId: string,
  featureName: string
): Promise<boolean> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription || !subscription.plan.features) {
      return false;
    }

    const features = subscription.plan.features as any;
    
    if (Array.isArray(features)) {
      return features.includes(featureName);
    } else if (typeof features === 'object') {
      return features[featureName] === true;
    }

    return false;
  } catch (error) {
    console.error('[SUBSCRIPTION MIDDLEWARE] Error checking feature access:', error);
    return false;
  }
}

/**
 * Check if tenant has exceeded plan limits
 */
export async function checkPlanLimits(
  tenantId: string,
  limitType: 'users' | 'products' | 'sales'
): Promise<{ exceeded: boolean; current: number; limit: number | null }> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return { exceeded: true, current: 0, limit: 0 };
    }

    let current = 0;
    let limit: number | null = null;

    switch (limitType) {
      case 'users':
        current = await prisma.user.count({
          where: { tenantId, isActive: true },
        });
        limit = subscription.plan.maxUsers;
        break;

      case 'products':
        current = await prisma.tenantInventory.count({
          where: { tenantId, isActive: true },
        });
        limit = subscription.plan.maxProducts;
        break;

      case 'sales':
        // Count sales for the current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        current = await prisma.sale.count({
          where: {
            tenantId,
            createdAt: {
              gte: startOfMonth,
            },
          },
        });
        limit = subscription.plan.maxSales;
        break;
    }

    const exceeded = limit !== null && current >= limit;

    return { exceeded, current, limit };
  } catch (error) {
    console.error('[SUBSCRIPTION MIDDLEWARE] Error checking plan limits:', error);
    return { exceeded: false, current: 0, limit: null };
  }
}

/**
 * Middleware function to protect API routes
 */
export async function requireActiveSubscription(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }

  // PROVEEDOR role bypasses subscription checks
  if (session.user.role === 'PROVEEDOR') {
    return handler(request);
  }

  const result = await checkSubscriptionAccess(session.user.tenantId);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: result.message,
        subscriptionRequired: true,
        redirectTo: result.redirectTo,
      },
      { status: 403 }
    );
  }

  return handler(request);
}

/**
 * Create a wrapper for API handlers that require active subscription
 */
export function withSubscriptionCheck(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    return requireActiveSubscription(req, handler);
  };
}

/**
 * Check if user can perform an action based on plan limits
 */
export async function canPerformAction(
  tenantId: string,
  action: 'create_user' | 'create_product' | 'create_sale'
): Promise<{ allowed: boolean; message?: string }> {
  try {
    // First check if subscription is active
    const subscriptionCheck = await checkSubscriptionAccess(tenantId);
    if (!subscriptionCheck.allowed) {
      return {
        allowed: false,
        message: subscriptionCheck.message,
      };
    }

    // Check specific action limits
    let limitType: 'users' | 'products' | 'sales';
    let actionName: string;

    switch (action) {
      case 'create_user':
        limitType = 'users';
        actionName = 'usuarios';
        break;
      case 'create_product':
        limitType = 'products';
        actionName = 'productos';
        break;
      case 'create_sale':
        limitType = 'sales';
        actionName = 'ventas';
        break;
    }

    const limitCheck = await checkPlanLimits(tenantId, limitType);

    if (limitCheck.exceeded) {
      return {
        allowed: false,
        message: `Ha alcanzado el límite de ${actionName} de su plan (${limitCheck.limit}). Por favor, actualice su plan.`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('[SUBSCRIPTION MIDDLEWARE] Error checking action permission:', error);
    return {
      allowed: false,
      message: 'Error al verificar permisos. Por favor, intente de nuevo.',
    };
  }
}

/**
 * Get subscription info for display in UI
 */
export async function getSubscriptionInfo(tenantId: string): Promise<{
  isActive: boolean;
  planName: string;
  status: string;
  expiresAt: Date | null;
  daysRemaining: number | null;
  features: any;
  limits: {
    users: { current: number; limit: number | null };
    products: { current: number; limit: number | null };
    sales: { current: number; limit: number | null };
  };
}> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return {
        isActive: false,
        planName: 'Sin plan',
        status: 'NO_SUBSCRIPTION',
        expiresAt: null,
        daysRemaining: null,
        features: [],
        limits: {
          users: { current: 0, limit: 0 },
          products: { current: 0, limit: 0 },
          sales: { current: 0, limit: 0 },
        },
      };
    }

    const isActive = ['ACTIVE', 'TRIAL'].includes(subscription.status);
    const expiresAt = subscription.nextBillingDate || subscription.endDate;
    let daysRemaining: number | null = null;

    if (expiresAt) {
      const now = new Date();
      const diffTime = expiresAt.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const [userLimits, productLimits, salesLimits] = await Promise.all([
      checkPlanLimits(tenantId, 'users'),
      checkPlanLimits(tenantId, 'products'),
      checkPlanLimits(tenantId, 'sales'),
    ]);

    return {
      isActive,
      planName: subscription.plan.name,
      status: subscription.status,
      expiresAt,
      daysRemaining,
      features: subscription.plan.features,
      limits: {
        users: { current: userLimits.current, limit: userLimits.limit },
        products: { current: productLimits.current, limit: productLimits.limit },
        sales: { current: salesLimits.current, limit: salesLimits.limit },
      },
    };
  } catch (error) {
    console.error('[SUBSCRIPTION MIDDLEWARE] Error getting subscription info:', error);
    return {
      isActive: false,
      planName: 'Error',
      status: 'ERROR',
      expiresAt: null,
      daysRemaining: null,
      features: [],
      limits: {
        users: { current: 0, limit: 0 },
        products: { current: 0, limit: 0 },
        sales: { current: 0, limit: 0 },
      },
    };
  }
}
