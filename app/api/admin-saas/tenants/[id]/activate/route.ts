
/**
 * API para activar un tenant suspendido
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';
import { sendAccountReactivatedEmail } from '@/lib/sendgrid';

/**
 * POST /api/admin-saas/tenants/[id]/activate
 * Activa un tenant que estaba suspendido o bloqueado
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    // Verificar que el tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: (await params).id },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant no encontrado' },
        { status: 404 }
      );
    }

    // Activar el tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: (await params).id },
      data: {
        isActive: true,
        accountStatus: 'ACTIVE',
        lastActivityAt: new Date(),
      },
    });

    // Activar sus suscripciones si las tiene
    await prisma.subscription.updateMany({
      where: {
        tenantId: (await params).id,
        status: 'SUSPENDED',
      },
      data: {
        status: 'ACTIVE',
      },
    });

    // Registrar acción en logs
    await prisma.auditLog.create({
      data: {
        action: 'TENANT_ACTIVATED',
        entity: 'Tenant',
        entityId: (await params).id,
        newValues: {
          isActive: true,
          accountStatus: 'ACTIVE',
        },
        tenantId: (await params).id,
      },
    });

    // Enviar email de reactivación
    await sendAccountReactivatedEmail(
      updatedTenant.email,
      updatedTenant.businessName
    );

    return NextResponse.json({
      message: 'Tenant activado exitosamente',
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error('Error al activar tenant:', error);
    return NextResponse.json(
      { error: 'Error al activar tenant' },
      { status: 500 }
    );
  }
}
