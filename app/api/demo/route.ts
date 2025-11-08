
/**
 * API Route: Create Demo Account
 * 
 * POST /api/demo - Creates a demo account with sample data and 14-day trial
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/sendgrid';

const prisma = new PrismaClient();

interface DemoRequest {
  email: string;
  businessName: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * POST /api/demo
 * 
 * Creates a demo account with:
 * - New tenant with 14-day trial
 * - Admin user
 * - Sample products (optional)
 * 
 * Body:
 * {
 *   email: string,
 *   businessName: string,
 *   firstName: string,
 *   lastName: string,
 *   phone?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: DemoRequest = await request.json();
    const { email, businessName, firstName, lastName, phone } = body;

    // Validate required fields
    if (!email || !businessName || !firstName || !lastName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos incompletos',
          message: 'Email, nombre de empresa, nombre y apellido son requeridos'
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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email ya registrado',
          message: 'Este email ya está siendo usado por otra cuenta'
        },
        { status: 409 }
      );
    }

    // Check if business already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { email },
    });

    if (existingTenant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Empresa ya registrada',
          message: 'Esta empresa ya tiene una cuenta demo'
        },
        { status: 409 }
      );
    }

    // Generate temporary RUT for demo (format: DEMO-timestamp)
    const demoRut = `DEMO-${Date.now()}`;

    // Calculate trial dates (14 days)
    const trialStartedAt = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    console.log('🚀 Creating demo tenant...');

    // Create tenant with trial
    const tenant = await prisma.tenant.create({
      data: {
        businessName,
        rut: demoRut,
        email,
        phone: phone || null,
        address: null,
        isActive: true,
        planType: 'BASIC',
        maxCashiers: 2,
        extraCashiers: 0,
        accountStatus: 'TRIAL',
        trialStartedAt,
        trialEndsAt,
        onboardingCompleted: false,
        lastActivityAt: new Date(),
      },
    });

    console.log('✅ Demo tenant created:', tenant.id);

    // Generate random password for demo
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'ADMIN',
        isActive: true,
        tenantId: tenant.id,
      },
    });

    console.log('✅ Demo user created:', user.id);

    // Create basic subscription plan (for demo, it's free during trial)
    const basicPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: 'BASIC', isActive: true },
      orderBy: { price: 'asc' },
    });

    if (basicPlan) {
      await prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: basicPlan.id,
          status: 'TRIAL',
          startDate: trialStartedAt,
          endDate: trialEndsAt,
          billingCycle: basicPlan.billingCycle,
          trialEndsAt,
          trialDays: 14,
          autoRenew: false, // Don't auto-renew demo accounts
        },
      });

      console.log('✅ Demo subscription created');
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Tenant',
        entityId: tenant.id,
        newValues: {
          businessName,
          email,
          accountStatus: 'TRIAL',
          trialEndsAt: trialEndsAt.toISOString(),
        },
        userId: user.id,
        tenantId: tenant.id,
      },
    });

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail(email, businessName, 'Demo (14 días)');
      console.log('✅ Welcome email sent');
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    // Return success with login credentials
    return NextResponse.json({
      success: true,
      data: {
        tenantId: tenant.id,
        userId: user.id,
        email,
        tempPassword: randomPassword,
        trialEndsAt,
        message: 'Cuenta demo creada exitosamente. Revisa tu email para más detalles.',
      },
    });

  } catch (error) {
    console.error('❌ Error creating demo account:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear cuenta demo',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

