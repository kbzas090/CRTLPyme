/**
 * API para confirmar transacción de pago con Transbank
 * GET/POST /api/payments/transbank/confirm
 * 
 * Este endpoint es llamado por Transbank después de que el usuario complete el pago
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { confirmTransaction, getSuccessUrl, getFailureUrl } from '@/lib/transbank';

// Transbank envía el token como query parameter en GET
export async function GET(request: NextRequest) {
  return handleTransbankCallback(request);
}

// Transbank también puede enviar POST
export async function POST(request: NextRequest) {
  return handleTransbankCallback(request);
}

async function handleTransbankCallback(request: NextRequest) {
  try {
    // Obtener el token de Transbank
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token_ws');

    if (!token) {
      console.error('No se recibió token de Transbank');
      return NextResponse.redirect(getFailureUrl());
    }

    console.log('🟦 [TRANSBANK] Confirmando transacción con token:', token);

    // Confirmar la transacción con Transbank
    const confirmResult = await confirmTransaction(token);

    if (!confirmResult.success || !confirmResult.response) {
      console.error('🔴 [TRANSBANK] Error al confirmar transacción:', confirmResult.error);
      
      // Actualizar transacción como fallida
      await prisma.paymentTransaction.updateMany({
        where: { transactionId: token },
        data: {
          status: 'FAILED',
          metadata: {
            error: confirmResult.error
          }
        }
      });

      return NextResponse.redirect(getFailureUrl());
    }

    const { response } = confirmResult;
    console.log('✅ [TRANSBANK] Transacción confirmada:', response);

    // Buscar la transacción en nuestra base de datos
    const paymentTransaction = await prisma.paymentTransaction.findFirst({
      where: { transactionId: token }
    });

    if (!paymentTransaction) {
      console.error('🔴 [TRANSBANK] Transacción no encontrada en base de datos');
      return NextResponse.redirect(getFailureUrl());
    }

    // Verificar si el pago fue aprobado (response_code === 0)
    if (response.response_code === 0) {
      console.log('✅ [TRANSBANK] Pago aprobado, actualizando suscripción...');

      // Actualizar transacción como completada
      await prisma.paymentTransaction.update({
        where: { id: paymentTransaction.id },
        data: {
          status: 'COMPLETED',
          metadata: {
            ...paymentTransaction.metadata,
            response_code: response.response_code,
            authorization_code: response.authorization_code,
            payment_type_code: response.payment_type_code,
            confirmed_at: new Date().toISOString()
          }
        }
      });

      // Obtener el plan
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: paymentTransaction.planId }
      });

      if (!plan) {
        console.error('🔴 [TRANSBANK] Plan no encontrado');
        return NextResponse.redirect(getFailureUrl());
      }

      // Calcular fechas de suscripción
      const startDate = new Date();
      const endDate = new Date();
      
      // Duración según el plan (asumiendo que es mensual)
      endDate.setMonth(endDate.getMonth() + 1);
      const nextBillingDate = new Date(endDate);

      // Crear o actualizar suscripción del tenant
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          tenantId: paymentTransaction.tenantId,
          status: { in: ['ACTIVE', 'TRIAL'] }
        }
      });

      if (existingSubscription) {
        // Actualizar suscripción existente
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planId: plan.id,
            status: 'ACTIVE',
            startDate,
            endDate,
            nextBillingDate,
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
            cancelAtPeriodEnd: false
          }
        });

        console.log('✅ [TRANSBANK] Suscripción actualizada');
      } else {
        // Crear nueva suscripción
        await prisma.subscription.create({
          data: {
            tenantId: paymentTransaction.tenantId,
            planId: plan.id,
            status: 'ACTIVE',
            startDate,
            endDate,
            nextBillingDate,
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
            cancelAtPeriodEnd: false
          }
        });

        console.log('✅ [TRANSBANK] Nueva suscripción creada');
      }

      // Actualizar el tenant con el nuevo plan
      await prisma.tenant.update({
        where: { id: paymentTransaction.tenantId },
        data: {
          currentPlanId: plan.id
        }
      });

      console.log('✅ [TRANSBANK] Plan del tenant actualizado');

      // Registrar en auditoría
      await prisma.auditLog.create({
        data: {
          tenantId: paymentTransaction.tenantId,
          action: 'UPDATE_SUBSCRIPTION',
          entityType: 'Subscription',
          entityId: paymentTransaction.id,
          details: {
            planId: plan.id,
            planName: plan.name,
            amount: paymentTransaction.amount,
            transactionId: token,
            paymentMethod: 'TRANSBANK'
          }
        }
      });

      console.log('✅ [TRANSBANK] Proceso completado exitosamente');
      return NextResponse.redirect(getSuccessUrl());

    } else {
      // Pago rechazado
      console.log('🔴 [TRANSBANK] Pago rechazado, código:', response.response_code);

      await prisma.paymentTransaction.update({
        where: { id: paymentTransaction.id },
        data: {
          status: 'FAILED',
          metadata: {
            ...paymentTransaction.metadata,
            response_code: response.response_code,
            reason: 'Pago rechazado por Transbank'
          }
        }
      });

      return NextResponse.redirect(getFailureUrl());
    }

  } catch (error: any) {
    console.error('🔴 [TRANSBANK] Error en callback:', error);
    return NextResponse.redirect(getFailureUrl());
  }
}
