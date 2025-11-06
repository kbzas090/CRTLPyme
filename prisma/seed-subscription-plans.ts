/**
 * Seeder para crear planes de suscripción iniciales
 * Ejecutar con: npm run seed:subscription-plans
 */

import { PrismaClient, BillingCycle } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de planes de suscripción...');

  // Verificar si ya existen planes
  const existingPlans = await prisma.subscriptionPlan.count();
  
  if (existingPlans > 0) {
    console.log('⚠️  Ya existen planes de suscripción. ¿Desea continuar? (se crearán planes adicionales)');
  }

  // === PLANES MENSUALES ===

  const basicMonthly = await prisma.subscriptionPlan.upsert({
    where: { id: 'basic-monthly' },
    update: {},
    create: {
      id: 'basic-monthly',
      name: 'Básico Mensual',
      description: 'Plan básico con las funcionalidades esenciales para pequeños negocios',
      price: 9990, // CLP
      billingCycle: 'MONTHLY' as BillingCycle,
      trialDays: 14,
      isVisible: true,
      sortOrder: 1,
      features: {
        items: [
          '2 cajas/terminales incluidas',
          'Hasta 5 usuarios',
          'Hasta 500 productos',
          'Ventas ilimitadas',
          'Gestión de inventario',
          'Reportes básicos',
          'Soporte por email',
        ],
      },
      maxUsers: 5,
      maxProducts: 500,
      maxSales: null, // ilimitado
      isActive: true,
    },
  });

  const proMonthly = await prisma.subscriptionPlan.upsert({
    where: { id: 'pro-monthly' },
    update: {},
    create: {
      id: 'pro-monthly',
      name: 'Profesional Mensual',
      description: 'Plan profesional con funcionalidades avanzadas para negocios en crecimiento',
      price: 19990, // CLP
      billingCycle: 'MONTHLY' as BillingCycle,
      trialDays: 14,
      isVisible: true,
      sortOrder: 2,
      features: {
        items: [
          '2 cajas/terminales incluidas',
          'Hasta 15 usuarios',
          'Hasta 2000 productos',
          'Ventas ilimitadas',
          'Gestión avanzada de inventario',
          'Reportes avanzados y analítica',
          'Dashboard en tiempo real',
          'Cálculo de punto de equilibrio',
          'Soporte prioritario',
        ],
      },
      maxUsers: 15,
      maxProducts: 2000,
      maxSales: null, // ilimitado
      isActive: true,
    },
  });

  const enterpriseMonthly = await prisma.subscriptionPlan.upsert({
    where: { id: 'enterprise-monthly' },
    update: {},
    create: {
      id: 'enterprise-monthly',
      name: 'Enterprise Mensual',
      description: 'Plan empresarial con todas las funcionalidades y soporte premium',
      price: 39990, // CLP
      billingCycle: 'MONTHLY' as BillingCycle,
      trialDays: 14,
      isVisible: true,
      sortOrder: 3,
      features: {
        items: [
          '2 cajas/terminales incluidas',
          'Usuarios ilimitados',
          'Productos ilimitados',
          'Ventas ilimitadas',
          'Gestión completa de inventario',
          'Reportes personalizados',
          'Dashboard avanzado',
          'Análisis predictivo',
          'API access',
          'Soporte 24/7',
          'Asesoría personalizada',
        ],
      },
      maxUsers: null, // ilimitado
      maxProducts: null, // ilimitado
      maxSales: null, // ilimitado
      isActive: true,
    },
  });

  // === PLANES TRIMESTRALES (10% descuento) ===

  const basicQuarterly = await prisma.subscriptionPlan.upsert({
    where: { id: 'basic-quarterly' },
    update: {},
    create: {
      id: 'basic-quarterly',
      name: 'Básico Trimestral',
      description: 'Plan básico con pago trimestral (10% descuento)',
      price: 26970, // CLP (9990 * 3 * 0.9)
      billingCycle: 'QUARTERLY' as BillingCycle,
      trialDays: 14,
      isVisible: true,
      sortOrder: 4,
      features: {
        items: [
          '2 cajas/terminales incluidas',
          'Hasta 5 usuarios',
          'Hasta 500 productos',
          'Ventas ilimitadas',
          'Gestión de inventario',
          'Reportes básicos',
          'Soporte por email',
          '10% descuento vs plan mensual',
        ],
      },
      maxUsers: 5,
      maxProducts: 500,
      maxSales: null,
      isActive: true,
    },
  });

  const proQuarterly = await prisma.subscriptionPlan.upsert({
    where: { id: 'pro-quarterly' },
    update: {},
    create: {
      id: 'pro-quarterly',
      name: 'Profesional Trimestral',
      description: 'Plan profesional con pago trimestral (10% descuento)',
      price: 53973, // CLP (19990 * 3 * 0.9)
      billingCycle: 'QUARTERLY' as BillingCycle,
      trialDays: 14,
      isVisible: true,
      sortOrder: 5,
      features: {
        items: [
          '2 cajas/terminales incluidas',
          'Hasta 15 usuarios',
          'Hasta 2000 productos',
          'Ventas ilimitadas',
          'Gestión avanzada de inventario',
          'Reportes avanzados y analítica',
          'Dashboard en tiempo real',
          'Cálculo de punto de equilibrio',
          'Soporte prioritario',
          '10% descuento vs plan mensual',
        ],
      },
      maxUsers: 15,
      maxProducts: 2000,
      maxSales: null,
      isActive: true,
    },
  });

  // === PLANES ANUALES (20% descuento) ===

  const basicAnnual = await prisma.subscriptionPlan.upsert({
    where: { id: 'basic-annual' },
    update: {},
    create: {
      id: 'basic-annual',
      name: 'Básico Anual',
      description: 'Plan básico con pago anual (20% descuento)',
      price: 95904, // CLP (9990 * 12 * 0.8)
      billingCycle: 'ANNUAL' as BillingCycle,
      trialDays: 14,
      isVisible: true,
      sortOrder: 6,
      features: {
        items: [
          '2 cajas/terminales incluidas',
          'Hasta 5 usuarios',
          'Hasta 500 productos',
          'Ventas ilimitadas',
          'Gestión de inventario',
          'Reportes básicos',
          'Soporte por email',
          '20% descuento vs plan mensual',
        ],
      },
      maxUsers: 5,
      maxProducts: 500,
      maxSales: null,
      isActive: true,
    },
  });

  const proAnnual = await prisma.subscriptionPlan.upsert({
    where: { id: 'pro-annual' },
    update: {},
    create: {
      id: 'pro-annual',
      name: 'Profesional Anual',
      description: 'Plan profesional con pago anual (20% descuento)',
      price: 191904, // CLP (19990 * 12 * 0.8)
      billingCycle: 'ANNUAL' as BillingCycle,
      trialDays: 14,
      isVisible: true,
      sortOrder: 7,
      features: {
        items: [
          '2 cajas/terminales incluidas',
          'Hasta 15 usuarios',
          'Hasta 2000 productos',
          'Ventas ilimitadas',
          'Gestión avanzada de inventario',
          'Reportes avanzados y analítica',
          'Dashboard en tiempo real',
          'Cálculo de punto de equilibrio',
          'Soporte prioritario',
          '20% descuento vs plan mensual',
        ],
      },
      maxUsers: 15,
      maxProducts: 2000,
      maxSales: null,
      isActive: true,
    },
  });

  const enterpriseAnnual = await prisma.subscriptionPlan.upsert({
    where: { id: 'enterprise-annual' },
    update: {},
    create: {
      id: 'enterprise-annual',
      name: 'Enterprise Anual',
      description: 'Plan empresarial con pago anual (20% descuento)',
      price: 383904, // CLP (39990 * 12 * 0.8)
      billingCycle: 'ANNUAL' as BillingCycle,
      trialDays: 14,
      isVisible: true,
      sortOrder: 8,
      features: {
        items: [
          '2 cajas/terminales incluidas',
          'Usuarios ilimitados',
          'Productos ilimitados',
          'Ventas ilimitadas',
          'Gestión completa de inventario',
          'Reportes personalizados',
          'Dashboard avanzado',
          'Análisis predictivo',
          'API access',
          'Soporte 24/7',
          'Asesoría personalizada',
          '20% descuento vs plan mensual',
        ],
      },
      maxUsers: null,
      maxProducts: null,
      maxSales: null,
      isActive: true,
    },
  });

  console.log('✅ Planes de suscripción creados exitosamente:');
  console.log('   - Básico Mensual:', basicMonthly.id);
  console.log('   - Profesional Mensual:', proMonthly.id);
  console.log('   - Enterprise Mensual:', enterpriseMonthly.id);
  console.log('   - Básico Trimestral:', basicQuarterly.id);
  console.log('   - Profesional Trimestral:', proQuarterly.id);
  console.log('   - Básico Anual:', basicAnnual.id);
  console.log('   - Profesional Anual:', proAnnual.id);
  console.log('   - Enterprise Anual:', enterpriseAnnual.id);
  console.log('');
  console.log('🎉 Seed completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
