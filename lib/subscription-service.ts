/**
 * Subscription Lifecycle Service
 * Handles all subscription business logic including renewals, expirations, and status updates
 */

import { prisma } from './db';
import {
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendSubscriptionRenewalReminder,
  sendAccountSuspendedEmail,
} from './sendgrid';

export interface SubscriptionUpdateResult {
  success: boolean;
  message: string;
  subscription?: any;
  error?: string;
}

/**
 * Check and update expired subscriptions
 * This should be called daily by a cron job
 */
export async function processExpiredSubscriptions(): Promise<{
  processed: number;
  errors: number;
}> {
  console.log('[SUBSCRIPTION] Starting expired subscriptions check...');
  
  const now = new Date();
  let processed = 0;
  let errors = 0;

  try {
    // Find all active subscriptions that have passed their end date
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
        OR: [
          {
            endDate: {
              lte: now,
            },
          },
          {
            trialEndsAt: {
              lte: now,
            },
            status: 'TRIAL',
          },
        ],
      },
      include: {
        tenant: true,
        plan: true,
      },
    });

    console.log(`[SUBSCRIPTION] Found ${expiredSubscriptions.length} expired subscriptions`);

    for (const subscription of expiredSubscriptions) {
      try {
        if (subscription.autoRenew && subscription.status === 'ACTIVE') {
          // Attempt to renew the subscription
          await renewSubscription(subscription.id);
          processed++;
        } else {
          // Mark as expired
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'EXPIRED',
            },
          });

          // Update tenant status
          await prisma.tenant.update({
            where: { id: subscription.tenantId },
            data: {
              accountStatus: 'SUSPENDED',
            },
          });

          // Send notification
          await sendAccountSuspendedEmail(
            subscription.tenant.email,
            subscription.tenant.businessName,
            'Suscripción expirada. Por favor, renueve su plan para continuar usando nuestros servicios.'
          );

          processed++;
        }
      } catch (error) {
        console.error(`[SUBSCRIPTION] Error processing subscription ${subscription.id}:`, error);
        errors++;
      }
    }

    console.log(`[SUBSCRIPTION] Processed ${processed} subscriptions, ${errors} errors`);
    return { processed, errors };
  } catch (error) {
    console.error('[SUBSCRIPTION] Error in processExpiredSubscriptions:', error);
    return { processed, errors };
  }
}

/**
 * Send renewal reminders for subscriptions expiring soon
 * This should be called daily by a cron job
 */
export async function sendRenewalReminders(daysBeforeExpiration: number = 7): Promise<{
  sent: number;
  errors: number;
}> {
  console.log(`[SUBSCRIPTION] Sending renewal reminders (${daysBeforeExpiration} days before expiration)...`);
  
  const now = new Date();
  const reminderDate = new Date(now);
  reminderDate.setDate(reminderDate.getDate() + daysBeforeExpiration);

  let sent = 0;
  let errors = 0;

  try {
    // Find subscriptions expiring in N days
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
        nextBillingDate: {
          gte: now,
          lte: reminderDate,
        },
        autoRenew: true,
      },
      include: {
        tenant: true,
        plan: true,
      },
    });

    console.log(`[SUBSCRIPTION] Found ${expiringSubscriptions.length} subscriptions to remind`);

    for (const subscription of expiringSubscriptions) {
      try {
        const amount = calculateSubscriptionAmount(
          subscription.plan.price.toNumber(),
          subscription.billingCycle,
          subscription.discountPercent?.toNumber()
        );

        await sendSubscriptionRenewalReminder(
          subscription.tenant.email,
          subscription.tenant.businessName,
          subscription.plan.name,
          subscription.nextBillingDate!,
          amount
        );

        sent++;
      } catch (error) {
        console.error(`[SUBSCRIPTION] Error sending reminder for subscription ${subscription.id}:`, error);
        errors++;
      }
    }

    console.log(`[SUBSCRIPTION] Sent ${sent} reminders, ${errors} errors`);
    return { sent, errors };
  } catch (error) {
    console.error('[SUBSCRIPTION] Error in sendRenewalReminders:', error);
    return { sent, errors };
  }
}

/**
 * Renew a subscription
 */
export async function renewSubscription(subscriptionId: string): Promise<SubscriptionUpdateResult> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tenant: true,
        plan: true,
      },
    });

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
        error: 'NOT_FOUND',
      };
    }

    // Calculate new billing dates
    const now = new Date();
    const nextBillingDate = new Date(now);
    
    if (subscription.billingCycle === 'MONTHLY') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (subscription.billingCycle === 'QUARTERLY') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
    } else if (subscription.billingCycle === 'ANNUAL') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // Calculate subscription amount
    const amount = calculateSubscriptionAmount(
      subscription.plan.price.toNumber(),
      subscription.billingCycle,
      subscription.discountPercent?.toNumber()
    );

    // Create payment record
    const payment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        tenantId: subscription.tenantId,
        amount,
        currency: 'CLP',
        status: 'PENDING',
      },
    });

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        lastBillingDate: now,
        nextBillingDate,
        status: 'ACTIVE',
        paymentFailureCount: 0,
        updatedAt: now,
      },
      include: {
        plan: true,
        tenant: true,
      },
    });

    // Update lifetime value
    const newLifetimeValue = (subscription.lifetimeValue?.toNumber() || 0) + amount;
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        lifetimeValue: newLifetimeValue,
      },
    });

    console.log(`[SUBSCRIPTION] Successfully renewed subscription ${subscriptionId}`);
    
    return {
      success: true,
      message: 'Subscription renewed successfully',
      subscription: updatedSubscription,
    };
  } catch (error) {
    console.error('[SUBSCRIPTION] Error in renewSubscription:', error);
    return {
      success: false,
      message: 'Failed to renew subscription',
      error: String(error),
    };
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason?: string,
  immediate: boolean = false
): Promise<SubscriptionUpdateResult> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tenant: true,
        plan: true,
      },
    });

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
        error: 'NOT_FOUND',
      };
    }

    const now = new Date();
    const updateData: any = {
      cancelledAt: now,
      cancellationReason: reason || 'User requested cancellation',
      autoRenew: false,
      updatedAt: now,
    };

    if (immediate) {
      updateData.status = 'CANCELLED';
      updateData.endDate = now;

      // Update tenant status
      await prisma.tenant.update({
        where: { id: subscription.tenantId },
        data: {
          accountStatus: 'CANCELLED',
        },
      });
    } else {
      // Cancel at end of billing period
      updateData.status = 'ACTIVE'; // Keep active until end date
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: {
        plan: true,
        tenant: true,
      },
    });

    console.log(`[SUBSCRIPTION] Cancelled subscription ${subscriptionId} (immediate: ${immediate})`);

    return {
      success: true,
      message: immediate
        ? 'Subscription cancelled immediately'
        : 'Subscription will cancel at end of billing period',
      subscription: updatedSubscription,
    };
  } catch (error) {
    console.error('[SUBSCRIPTION] Error in cancelSubscription:', error);
    return {
      success: false,
      message: 'Failed to cancel subscription',
      error: String(error),
    };
  }
}

/**
 * Reactivate a cancelled or expired subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<SubscriptionUpdateResult> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tenant: true,
        plan: true,
      },
    });

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
        error: 'NOT_FOUND',
      };
    }

    if (!['CANCELLED', 'EXPIRED', 'SUSPENDED'].includes(subscription.status)) {
      return {
        success: false,
        message: 'Subscription is already active',
        error: 'ALREADY_ACTIVE',
      };
    }

    const now = new Date();
    const nextBillingDate = new Date(now);
    
    if (subscription.billingCycle === 'MONTHLY') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (subscription.billingCycle === 'QUARTERLY') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
    } else if (subscription.billingCycle === 'ANNUAL') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        startDate: now,
        endDate: null,
        nextBillingDate,
        cancelledAt: null,
        cancellationReason: null,
        autoRenew: true,
        paymentFailureCount: 0,
        updatedAt: now,
      },
      include: {
        plan: true,
        tenant: true,
      },
    });

    // Update tenant status
    await prisma.tenant.update({
      where: { id: subscription.tenantId },
      data: {
        accountStatus: 'ACTIVE',
      },
    });

    console.log(`[SUBSCRIPTION] Reactivated subscription ${subscriptionId}`);

    return {
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: updatedSubscription,
    };
  } catch (error) {
    console.error('[SUBSCRIPTION] Error in reactivateSubscription:', error);
    return {
      success: false,
      message: 'Failed to reactivate subscription',
      error: String(error),
    };
  }
}

/**
 * Change subscription plan (upgrade/downgrade)
 */
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPlanId: string,
  immediate: boolean = false
): Promise<SubscriptionUpdateResult> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tenant: true,
        plan: true,
      },
    });

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
        error: 'NOT_FOUND',
      };
    }

    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      return {
        success: false,
        message: 'New plan not found',
        error: 'PLAN_NOT_FOUND',
      };
    }

    if (subscription.planId === newPlanId) {
      return {
        success: false,
        message: 'Subscription is already on this plan',
        error: 'SAME_PLAN',
      };
    }

    const now = new Date();
    const updateData: any = {
      planId: newPlanId,
      updatedAt: now,
    };

    if (immediate) {
      // Calculate prorated amount if upgrading
      const isUpgrade = newPlan.price > subscription.plan.price;
      
      if (isUpgrade && subscription.nextBillingDate) {
        const proratedAmount = calculateProratedAmount(
          subscription.plan.price.toNumber(),
          newPlan.price.toNumber(),
          subscription.lastBillingDate || subscription.startDate,
          subscription.nextBillingDate,
          now
        );

        if (proratedAmount > 0) {
          // Create prorated payment
          await prisma.subscriptionPayment.create({
            data: {
              subscriptionId: subscription.id,
              tenantId: subscription.tenantId,
              amount: proratedAmount,
              currency: 'CLP',
              status: 'PENDING',
            },
          });
        }
      }

      // Update next billing date based on new plan's cycle
      const nextBillingDate = new Date(now);
      if (newPlan.billingCycle === 'MONTHLY') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else if (newPlan.billingCycle === 'QUARTERLY') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
      } else if (newPlan.billingCycle === 'ANNUAL') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      updateData.nextBillingDate = nextBillingDate;
      updateData.billingCycle = newPlan.billingCycle;
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: {
        plan: true,
        tenant: true,
      },
    });

    console.log(`[SUBSCRIPTION] Changed plan for subscription ${subscriptionId} from ${subscription.plan.name} to ${newPlan.name}`);

    return {
      success: true,
      message: 'Subscription plan changed successfully',
      subscription: updatedSubscription,
    };
  } catch (error) {
    console.error('[SUBSCRIPTION] Error in changeSubscriptionPlan:', error);
    return {
      success: false,
      message: 'Failed to change subscription plan',
      error: String(error),
    };
  }
}

/**
 * Handle payment failure
 */
export async function handlePaymentFailure(
  subscriptionId: string,
  reason: string
): Promise<SubscriptionUpdateResult> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tenant: true,
        plan: true,
      },
    });

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
        error: 'NOT_FOUND',
      };
    }

    const failureCount = subscription.paymentFailureCount + 1;
    const updateData: any = {
      paymentFailureCount: failureCount,
      updatedAt: new Date(),
    };

    // Suspend after 3 failed attempts
    if (failureCount >= 3) {
      updateData.status = 'SUSPENDED';
      
      await prisma.tenant.update({
        where: { id: subscription.tenantId },
        data: {
          accountStatus: 'SUSPENDED',
        },
      });

      await sendAccountSuspendedEmail(
        subscription.tenant.email,
        subscription.tenant.businessName,
        `Se suspendió la cuenta debido a ${failureCount} intentos fallidos de pago.`
      );
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: {
        plan: true,
        tenant: true,
      },
    });

    // Send payment failure email
    const amount = calculateSubscriptionAmount(
      subscription.plan.price.toNumber(),
      subscription.billingCycle,
      subscription.discountPercent?.toNumber()
    );

    await sendPaymentFailedEmail(
      subscription.tenant.email,
      subscription.tenant.businessName,
      amount,
      reason
    );

    console.log(`[SUBSCRIPTION] Handled payment failure for subscription ${subscriptionId} (attempt ${failureCount})`);

    return {
      success: true,
      message: 'Payment failure recorded',
      subscription: updatedSubscription,
    };
  } catch (error) {
    console.error('[SUBSCRIPTION] Error in handlePaymentFailure:', error);
    return {
      success: false,
      message: 'Failed to handle payment failure',
      error: String(error),
    };
  }
}

/**
 * Handle successful payment
 */
export async function handlePaymentSuccess(
  subscriptionId: string,
  paymentId: string,
  amount: number
): Promise<SubscriptionUpdateResult> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tenant: true,
        plan: true,
      },
    });

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
        error: 'NOT_FOUND',
      };
    }

    // Update payment record
    await prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: {
        status: 'APPROVED',
        paymentDate: new Date(),
      },
    });

    // Reset failure count and ensure active status
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        paymentFailureCount: 0,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
      include: {
        plan: true,
        tenant: true,
      },
    });

    // Ensure tenant is active
    await prisma.tenant.update({
      where: { id: subscription.tenantId },
      data: {
        accountStatus: 'ACTIVE',
      },
    });

    // Send success email
    await sendPaymentSuccessEmail(
      subscription.tenant.email,
      subscription.tenant.businessName,
      amount,
      subscription.plan.name,
      subscription.nextBillingDate || new Date()
    );

    console.log(`[SUBSCRIPTION] Handled successful payment for subscription ${subscriptionId}`);

    return {
      success: true,
      message: 'Payment processed successfully',
      subscription: updatedSubscription,
    };
  } catch (error) {
    console.error('[SUBSCRIPTION] Error in handlePaymentSuccess:', error);
    return {
      success: false,
      message: 'Failed to handle payment success',
      error: String(error),
    };
  }
}

/**
 * Calculate subscription amount with discount
 */
function calculateSubscriptionAmount(
  basePrice: number,
  billingCycle: string,
  discountPercent?: number
): number {
  let amount = basePrice;

  // Apply billing cycle multiplier
  if (billingCycle === 'QUARTERLY') {
    amount = basePrice * 3;
  } else if (billingCycle === 'ANNUAL') {
    amount = basePrice * 12;
  }

  // Apply discount
  if (discountPercent && discountPercent > 0) {
    amount = amount * (1 - discountPercent / 100);
  }

  return Math.round(amount);
}

/**
 * Calculate prorated amount for plan changes
 */
function calculateProratedAmount(
  oldPrice: number,
  newPrice: number,
  lastBillingDate: Date,
  nextBillingDate: Date,
  changeDate: Date
): number {
  const totalDays = Math.ceil((nextBillingDate.getTime() - lastBillingDate.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.ceil((nextBillingDate.getTime() - changeDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const usedDays = totalDays - remainingDays;
  const unusedAmount = (oldPrice / totalDays) * remainingDays;
  const newAmount = (newPrice / totalDays) * remainingDays;
  
  const proratedAmount = newAmount - unusedAmount;
  
  return Math.max(0, Math.round(proratedAmount));
}

/**
 * Get subscription status summary
 */
export async function getSubscriptionStatusSummary(tenantId: string): Promise<{
  hasActiveSubscription: boolean;
  subscription: any | null;
  daysUntilExpiration: number | null;
  isExpiringSoon: boolean;
}> {
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
      return {
        hasActiveSubscription: false,
        subscription: null,
        daysUntilExpiration: null,
        isExpiringSoon: false,
      };
    }

    const expirationDate = subscription.nextBillingDate || subscription.endDate;
    let daysUntilExpiration = null;
    let isExpiringSoon = false;

    if (expirationDate) {
      const now = new Date();
      const diffTime = expirationDate.getTime() - now.getTime();
      daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isExpiringSoon = daysUntilExpiration <= 7 && daysUntilExpiration > 0;
    }

    return {
      hasActiveSubscription: true,
      subscription,
      daysUntilExpiration,
      isExpiringSoon,
    };
  } catch (error) {
    console.error('[SUBSCRIPTION] Error in getSubscriptionStatusSummary:', error);
    return {
      hasActiveSubscription: false,
      subscription: null,
      daysUntilExpiration: null,
      isExpiringSoon: false,
    };
  }
}
