/**
 * API Route: Payment Callback
 * 
 * POST /api/subscriptions/payment/callback - Procesa la respuesta de Transbank
 * GET /api/subscriptions/payment/callback - Maneja el retorno del usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, PaymentStatus, SubscriptionStatus } from '@prisma/client';
import { commitTransaction, isTransactionApproved, getResponseCodeDescription } from '@/lib/transbank';

const prisma = new PrismaClient();

/**
 * GET /api/subscriptions/payment/callback?token_ws=xxx
 * 
 * Maneja el retorno del usuario desde Transbank después del pago
 * Transbank redirige aquí con un token_ws en la URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token_ws');

    if (!token) {
      console.error('❌ Token no recibido desde Transbank');
      return NextResponse.redirect(
        new URL('/subscriptions/payment/error?reason=no_token', request.url)
      );
    }

    console.log('🔍 Procesando callback de Transbank con token:', token.substring(0, 20) + '...');

    // Confirmar la transacción con Transbank
    const transbankResponse = await commitTransaction(token);

    console.log('📊 Respuesta de Transbank:', {
      buyOrder: transbankResponse.buy_order,
      status: transbankResponse.status,
      responseCode: transbankResponse.response_code,
      amount: transbankResponse.amount,
    });

    // Buscar el pago por el token
    const payment = await prisma.subscriptionPayment.findFirst({
      where: {
        transbankToken: token,
      },
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
      console.error('❌ Pago no encontrado para el token:', token);
      return NextResponse.redirect(
        new URL('/subscriptions/payment/error?reason=payment_not_found', request.url)
      );
    }

    // Verificar si la transacción fue aprobada
    const approved = isTransactionApproved(transbankResponse.response_code);
    const responseDescription = getResponseCodeDescription(transbankResponse.response_code);

    console.log(`${approved ? '✅' : '❌'} Transacción ${approved ? 'APROBADA' : 'RECHAZADA'}: ${responseDescription}`);

    // Actualizar el pago
    const paymentStatus: PaymentStatus = approved ? 'COMPLETED' : 'FAILED';
    
    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        paymentDate: approved ? new Date() : null,
        transbankOrderId: transbankResponse.buy_order,
        metadata: JSON.stringify({
          vci: transbankResponse.vci,
          status: transbankResponse.status,
          cardNumber: transbankResponse.card_detail?.card_number,
          accountingDate: transbankResponse.accounting_date,
          transactionDate: transbankResponse.transaction_date,
          authorizationCode: transbankResponse.authorization_code,
          paymentTypeCode: transbankResponse.payment_type_code,
          responseCode: transbankResponse.response_code,
          responseDescription: responseDescription,
          installmentsNumber: transbankResponse.installments_number,
        }),
      },
    });

    console.log('✅ Pago actualizado:', payment.id, '- Estado:', paymentStatus);

    // Si fue aprobado, activar la suscripción
    if (approved) {
      const subscriptionStatus: SubscriptionStatus = 
        payment.subscription.plan.trialDays > 0 ? 'TRIALING' : 'ACTIVE';

      const now = new Date();
      const periodDays = payment.subscription.plan.billingCycle === 'YEARLY' ? 365 : 30;
      const trialEnd = payment.subscription.plan.trialDays > 0
        ? new Date(now.getTime() + payment.subscription.plan.trialDays * 24 * 60 * 60 * 1000)
        : null;
      const currentPeriodEnd = new Date(
        now.getTime() + periodDays * 24 * 60 * 60 * 1000
      );

      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: subscriptionStatus,
          currentPeriodStart: now,
          currentPeriodEnd: currentPeriodEnd,
          trialEnd: trialEnd,
          cancelAtPeriodEnd: false,
        },
      });

      console.log('✅ Suscripción activada:', payment.subscriptionId, '- Estado:', subscriptionStatus);

      // Registrar webhook
      await prisma.paymentWebhook.create({
        data: {
          provider: 'TRANSBANK',
          event: 'payment.approved',
          payload: JSON.stringify(transbankResponse),
          relatedPaymentId: payment.id,
        },
      });

      // TODO: Enviar email de confirmación usando SendGrid
      console.log('📧 TODO: Enviar email de confirmación a:', payment.subscription.tenant.email);

      // Redirigir a página de éxito
      return NextResponse.redirect(
        new URL(
          `/subscriptions/payment/success?subscriptionId=${payment.subscriptionId}`,
          request.url
        )
      );
    } else {
      // Si fue rechazado, cancelar la suscripción
      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      console.log('❌ Suscripción cancelada por pago rechazado:', payment.subscriptionId);

      // Registrar webhook
      await prisma.paymentWebhook.create({
        data: {
          provider: 'TRANSBANK',
          event: 'payment.rejected',
          payload: JSON.stringify(transbankResponse),
          relatedPaymentId: payment.id,
        },
      });

      // Redirigir a página de error
      return NextResponse.redirect(
        new URL(
          `/subscriptions/payment/error?reason=payment_rejected&message=${encodeURIComponent(responseDescription)}`,
          request.url
        )
      );
    }

  } catch (error) {
    console.error('❌ Error procesando callback de pago:', error);
    
    return NextResponse.redirect(
      new URL(
        '/subscriptions/payment/error?reason=processing_error',
        request.url
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/subscriptions/payment/callback
 * 
 * Endpoint alternativo para webhooks de Transbank (si se configura)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 Webhook recibido de Transbank:', body);

    // Registrar el webhook
    await prisma.paymentWebhook.create({
      data: {
        provider: 'TRANSBANK',
        event: 'webhook.received',
        payload: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, message: 'Webhook recibido' });
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Error procesando webhook' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
