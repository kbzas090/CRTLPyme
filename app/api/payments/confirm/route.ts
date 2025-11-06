
/**
 * API para confirmar un pago después de que el usuario regrese de Transbank
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { confirmSubscriptionPayment } from '@/lib/transbank';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/sendgrid';

/**
 * GET/POST /api/payments/confirm
 * Confirma un pago después de que Transbank redirige al usuario
 */
export async function GET(request: NextRequest) {
  return handlePaymentConfirmation(request);
}

export async function POST(request: NextRequest) {
  return handlePaymentConfirmation(request);
}

async function handlePaymentConfirmation(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token_ws');

    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    // Buscar el pago por token
    const payment = await prisma.subscriptionPayment.findFirst({
      where: { transbankToken: token },
      include: {
        subscription: {
          include: {
            plan: true,
            tenant: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    // Confirmar el pago con Transbank
    const confirmResult = await confirmSubscriptionPayment(token);

    if (!confirmResult.success || !confirmResult.transactionData) {
      // Actualizar el pago como fallido
      await prisma.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          transactionResponse: {
            error: confirmResult.error,
            data: confirmResult.transactionData,
          },
        },
      });

      // Incrementar contador de fallos
      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          paymentFailureCount: {
            increment: 1,
          },
        },
      });

      // Enviar email de fallo
      await sendPaymentFailedEmail(
        payment.subscription.tenant.email,
        payment.subscription.tenant.businessName,
        Number(payment.amount),
        confirmResult.error || 'Pago rechazado'
      );

      return NextResponse.json({
        success: false,
        error: confirmResult.error,
        redirectUrl: '/subscription/payment-failed',
      });
    }

    // Actualizar el pago como aprobado
    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: {
        status: 'APPROVED',
        paymentDate: new Date(),
        transactionResponse: confirmResult.transactionData,
        cardLast4: confirmResult.transactionData.cardLast4,
        cardType: confirmResult.transactionData.cardType,
      },
    });

    // Actualizar la suscripción
    const currentDate = new Date();
    const nextBillingDate = new Date(currentDate);

    // Calcular próxima fecha de facturación según el ciclo
    if (payment.subscription.billingCycle === 'MONTHLY') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (payment.subscription.billingCycle === 'QUARTERLY') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
    } else if (payment.subscription.billingCycle === 'ANNUAL') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // Calcular valor de por vida (lifetime value)
    const totalPaid = await prisma.subscriptionPayment.aggregate({
      where: {
        subscriptionId: payment.subscriptionId,
        status: 'APPROVED',
      },
      _sum: {
        amount: true,
      },
    });

    await prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: 'ACTIVE',
        lastBillingDate: currentDate,
        nextBillingDate: nextBillingDate,
        lifetimeValue: totalPaid._sum.amount || 0,
        paymentFailureCount: 0, // Resetear contador de fallos
      },
    });

    // Actualizar tenant
    await prisma.tenant.update({
      where: { id: payment.tenantId },
      data: {
        accountStatus: 'ACTIVE',
        lastActivityAt: currentDate,
      },
    });

    // Enviar email de confirmación
    await sendPaymentSuccessEmail(
      payment.subscription.tenant.email,
      payment.subscription.tenant.businessName,
      Number(payment.amount),
      payment.subscription.plan.name,
      nextBillingDate
    );

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: 'APPROVED',
        transactionDate: confirmResult.transactionData.transactionDate,
      },
      redirectUrl: '/subscription/payment-success',
    });
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    return NextResponse.json(
      { error: 'Error al confirmar pago' },
      { status: 500 }
    );
  }
}
