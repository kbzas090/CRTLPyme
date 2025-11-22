
/**
 * API para gestionar tenants (clientes) del sistema SaaS
 * Solo accesible por usuarios con rol PROVEEDOR
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

/**
 * GET /api/admin-saas/tenants
 * Lista todos los tenants del sistema con sus estadísticas básicas
 */
export async function GET(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            tenantInventories: true,  // ✅ Usar tenantInventories (plural) según el schema de Prisma
            sales: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular estadísticas adicionales para cada tenant
    const tenantsWithStats = await Promise.all(
      tenants.map(async (tenant) => {
        // Obtener ventas totales
        const salesTotal = await prisma.sale.aggregate({
          where: {
            tenantId: tenant.id,
            status: 'COMPLETED',
          },
          _sum: {
            total: true,
          },
        });

        // ✅ Obtener productos con stock bajo desde TenantInventory
        // Se filtran productos donde el stock actual <= stock mínimo
        const inventoryItems = await prisma.tenantInventory.findMany({
          where: {
            tenantId: tenant.id,
            isActive: true,
          },
          select: {
            stock: true,
            minStock: true,
          },
        });
        
        const lowStockCount = inventoryItems.filter(
          item => item.stock <= item.minStock
        ).length;

        return {
          id: tenant.id,
          businessName: tenant.businessName,
          rut: tenant.rut,
          email: tenant.email,
          phone: tenant.phone,
          address: tenant.address,
          planType: tenant.planType,
          isActive: tenant.isActive,
          maxCashiers: tenant.maxCashiers,
          extraCashiers: tenant.extraCashiers,
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt,
          stats: {
            totalUsers: tenant._count.users,
            totalProducts: tenant._count.tenantInventories,  // ✅ Usar tenantInventories (plural)
            totalSales: tenant._count.sales,
            salesAmount: salesTotal._sum.total || 0,
            lowStockProducts: lowStockCount,
          },
          users: tenant.users,
        };
      })
    );

    return NextResponse.json({
      tenants: tenantsWithStats,
      total: tenantsWithStats.length,
    });
  } catch (error) {
    console.error('Error al listar tenants:', error);
    return NextResponse.json(
      { error: 'Error al obtener lista de tenants' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin-saas/tenants
 * Crea un nuevo tenant (cliente)
 */
export async function POST(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const body = await request.json();
    const { businessName, rut, email, phone, address, planType, maxCashiers } = body;

    // Validar datos requeridos
    if (!businessName || !rut || !email) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: businessName, rut, email' },
        { status: 400 }
      );
    }

    // Verificar que el RUT no exista
    const existingTenant = await prisma.tenant.findUnique({
      where: { rut },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Ya existe un tenant con ese RUT' },
        { status: 409 }
      );
    }

    // Crear el tenant
    const newTenant = await prisma.tenant.create({
      data: {
        businessName,
        rut,
        email,
        phone: phone || null,
        address: address || null,
        planType: planType || 'BASIC',
        maxCashiers: maxCashiers || 2,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Tenant creado exitosamente',
        tenant: newTenant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear tenant:', error);
    return NextResponse.json(
      { error: 'Error al crear tenant' },
      { status: 500 }
    );
  }
}
