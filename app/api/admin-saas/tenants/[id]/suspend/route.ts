
/**
 * API para suspender un tenant
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';
import { sendAccountSuspendedEmail } from '@/lib/sendgrid';

/**
 * POST /api/admin-saas/tenants/[id]/suspend
 * Suspende un tenant (impago, violación de términos, etc.)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: 'El motivo de suspensión es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant no encontrado' },
        { status: 404 }
      );
    }

    // Suspender el tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: params.id },
      data: {
        isActive: false,
        accountStatus: 'SUSPENDED',
      },
    });

    // Suspender sus suscripciones activas
    await prisma.subscription.updateMany({
      where: {
        tenantId: params.id,
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
      data: {
        status: 'SUSPENDED',
      },
    });

    // Registrar acción en logs
    await prisma.auditLog.create({
      data: {
        action: 'TENANT_SUSPENDED',
        entity: 'Tenant',
        entityId: params.id,
        oldValues: {
          isActive: tenant.isActive,
          accountStatus: tenant.accountStatus,
        },
        newValues: {
          isActive: false,
          accountStatus: 'SUSPENDED',
          reason,
        },
        tenantId: params.id,
      },
    });

    // Enviar email de suspensión
    await sendAccountSuspendedEmail(
      updatedTenant.email,
      updatedTenant.businessName,
      reason
    );

    return NextResponse.json({
      message: 'Tenant suspendido exitosamente',
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error('Error al suspender tenant:', error);
    return NextResponse.json(
      { error: 'Error al suspender tenant' },
      { status: 500 }
    );
  }
}
