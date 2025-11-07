
/**
 * Cron job endpoint for subscription lifecycle tasks
 * This endpoint should be called daily by a cron service (e.g., Vercel Cron, external service)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  processExpiredSubscriptions,
  sendRenewalReminders,
} from '@/lib/subscription-service';

/**
 * GET /api/cron/subscription-tasks
 * Run subscription lifecycle tasks
 * Requires CRON_SECRET for security
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting subscription tasks...');

    // Process expired subscriptions
    const expiredResult = await processExpiredSubscriptions();
    console.log(`[CRON] Expired subscriptions: ${expiredResult.processed} processed, ${expiredResult.errors} errors`);

    // Send renewal reminders (7 days before)
    const reminderResult7 = await sendRenewalReminders(7);
    console.log(`[CRON] 7-day reminders: ${reminderResult7.sent} sent, ${reminderResult7.errors} errors`);

    // Send renewal reminders (3 days before)
    const reminderResult3 = await sendRenewalReminders(3);
    console.log(`[CRON] 3-day reminders: ${reminderResult3.sent} sent, ${reminderResult3.errors} errors`);

    // Send renewal reminders (1 day before)
    const reminderResult1 = await sendRenewalReminders(1);
    console.log(`[CRON] 1-day reminders: ${reminderResult1.sent} sent, ${reminderResult1.errors} errors`);

    const summary = {
      timestamp: new Date().toISOString(),
      expiredSubscriptions: expiredResult,
      reminders: {
        sevenDays: reminderResult7,
        threeDays: reminderResult3,
        oneDay: reminderResult1,
      },
      totalProcessed: expiredResult.processed,
      totalRemindersSent: reminderResult7.sent + reminderResult3.sent + reminderResult1.sent,
      totalErrors: expiredResult.errors + reminderResult7.errors + reminderResult3.errors + reminderResult1.errors,
    };

    console.log('[CRON] Subscription tasks completed:', summary);

    return NextResponse.json({
      success: true,
      message: 'Subscription tasks completed successfully',
      summary,
    });
  } catch (error) {
    console.error('[CRON] Error running subscription tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error running subscription tasks',
        details: String(error),
      },
      { status: 500 }
    );
  }
}

// Also allow POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
