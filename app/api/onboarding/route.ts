/**
 * API Route: Onboarding
 * 
 * POST /api/onboarding - Creates a new tenant account during onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface OnboardingRequest {
  businessName: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
  planId: string;
}

/**
 * POST /api/onboarding
 * 
 * Creates a new tenant account with basic information
 * User will complete payment in the next step
 * 
 * Body:
 * {
 *   businessName: string,
 *   rut: string,
 *   email: string,
 *   phone: string,
 *   address: string,
 *   planId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: OnboardingRequest = await request.json();
    const { businessName, rut, email, phone, address, planId } = body;

    // Validate required fields
    if (!businessName || !rut || !email || !phone || !address || !planId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos incompletos',
          message: 'Todos los campos son requeridos'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validate RUT format (basic)
    const rutRegex = /^[0-9]{7,8}-[0-9Kk]$/;
    if (!rutRegex.test(rut)) {
      return NextResponse.json(
        { success: false, error: 'Formato de RUT inválido' },
        { status: 400 }
      );
    }

    // Check if RUT already exists
    const existingTenantByRut = await prisma.tenant.findUnique({
      where: { rut },
    });

    if (existingTenantByRut) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'RUT ya registrado',
          message: 'Este RUT ya está siendo usado por otra empresa'
        },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email ya registrado',
          message: 'Este email ya está siendo usado'
        },
        { status: 409 }
      );
    }

    // Check if tenant email already exists
    const existingTenantByEmail = await prisma.tenant.findUnique({
      where: { email },
    });

    if (existingTenantByEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email ya registrado',
          message: 'Este email ya está siendo usado por otra empresa'
        },
        { status: 409 }
      );
    }

    // Verify plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, error: 'Plan no disponible' },
        { status: 404 }
      );
    }

    console.log('🚀 Creating new tenant...');

    // Determine plan type based on plan name
    let planType: 'BASIC' | 'PRO' | 'ENTERPRISE' = 'BASIC';
    if (plan.name.toUpperCase().includes('PRO')) {
      planType = 'PRO';
    } else if (plan.name.toUpperCase().includes('ENTERPRISE')) {
      planType = 'ENTERPRISE';
    }

    // Create tenant (inactive until payment is confirmed)
    const tenant = await prisma.tenant.create({
      data: {
        businessName,
        rut,
        email,
        phone,
        address,
        isActive: false, // Will be activated after payment
        planType,
        maxCashiers: planType === 'BASIC' ? 2 : planType === 'PRO' ? 5 : 10,
        extraCashiers: 0,
        accountStatus: 'SUSPENDED', // Suspended until payment
        onboardingCompleted: false,
        lastActivityAt: new Date(),
      },
    });

    console.log('✅ Tenant created:', tenant.id);

    // Generate random password for the user
    const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Extract first and last name from email (temporary)
    const emailParts = email.split('@')[0].split('.');
    const firstName = emailParts[0] || 'Usuario';
    const lastName = emailParts[1] || 'Admin';

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
        role: 'ADMIN',
        isActive: true,
        tenantId: tenant.id,
      },
    });

    console.log('✅ Admin user created:', user.id);

    // Create pending subscription (will be activated after payment)
    const subscription = await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: plan.id,
        status: 'SUSPENDED', // Will change to ACTIVE after payment
        startDate: new Date(),
        billingCycle: plan.billingCycle,
        autoRenew: true,
      },
    });

    console.log('✅ Subscription created:', subscription.id);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Tenant',
        entityId: tenant.id,
        newValues: {
          businessName,
          rut,
          email,
          accountStatus: 'SUSPENDED',
          planType,
        },
        userId: user.id,
        tenantId: tenant.id,
      },
    });

    // Return tenant and user info
    return NextResponse.json({
      success: true,
      data: {
        tenantId: tenant.id,
        userId: user.id,
        subscriptionId: subscription.id,
        email,
        tempPassword: randomPassword,
        message: 'Cuenta creada exitosamente. Por favor completa el pago.',
      },
    });

  } catch (error) {
    console.error('❌ Error creating onboarding account:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear cuenta',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
