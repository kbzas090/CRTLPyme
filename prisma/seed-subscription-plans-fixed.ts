/**
 * Script de inicialización de planes de suscripción para CRTLPyme SaaS
 * 
 * Este script crea los 7 planes de suscripción iniciales:
 * - 4 planes mensuales (FREE, BASIC, PROFESSIONAL, ENTERPRISE)
 * - 3 planes anuales con descuento (BASIC 20%, PROFESSIONAL 20%, ENTERPRISE 25%)
 */

import { PrismaClient, BillingCycle } from '@prisma/client';

const prisma = new PrismaClient();

// Definición de los planes de suscripción
const subscriptionPlans = [
  // ========================================
  // PLANES MENSUALES
  // ========================================
  {
    name: 'Plan Gratuito',
    description: 'Perfecto para comenzar y probar el sistema',
    price: 0,
    billingCycle: 'MONTHLY' as BillingCycle,
    trialDays: 0,
    isVisible: true,
    sortOrder: 1,
    features: JSON.stringify([
      '1 Usuario',
      '50 Productos',
      '100 Ventas/mes',
      'Soporte por email',
      'Reportes básicos',
      '1 Caja registradora'
    ]),
    maxUsers: 1,
    maxProducts: 50,
    maxSales: 100,
    isActive: true,
  },
  {
    name: 'Plan Básico - Mensual',
    description: 'Ideal para pequeños negocios que están creciendo',
    price: 19990,
    billingCycle: 'MONTHLY' as BillingCycle,
    trialDays: 14,
    isVisible: true,
    sortOrder: 2,
    features: JSON.stringify([
      '3 Usuarios',
      '500 Productos',
      'Ventas ilimitadas',
      'Soporte prioritario',
      'Reportes avanzados',
      '2 Cajas registradoras',
      'Control de inventario',
      'Gestión de clientes'
    ]),
    maxUsers: 3,
    maxProducts: 500,
    maxSales: null,
    isActive: true,
  },
  {
    name: 'Plan Profesional - Mensual',
    description: 'Para negocios establecidos con múltiples puntos de venta',
    price: 39990,
    billingCycle: 'MONTHLY' as BillingCycle,
    trialDays: 14,
    isVisible: true,
    sortOrder: 3,
    features: JSON.stringify([
      '10 Usuarios',
      '2000 Productos',
      'Ventas ilimitadas',
      'Soporte 24/7',
      'Reportes personalizados',
      '5 Cajas registradoras',
      'Multi-sucursal',
      'Integración con Transbank',
      'Facturación electrónica',
      'API de integración',
      'Backup automático diario'
    ]),
    maxUsers: 10,
    maxProducts: 2000,
    maxSales: null,
    isActive: true,
  },
  {
    name: 'Plan Empresarial - Mensual',
    description: 'Solución completa para cadenas y grandes empresas',
    price: 79990,
    billingCycle: 'MONTHLY' as BillingCycle,
    trialDays: 30,
    isVisible: true,
    sortOrder: 4,
    features: JSON.stringify([
      'Usuarios ilimitados',
      'Productos ilimitados',
      'Ventas ilimitadas',
      'Soporte dedicado 24/7',
      'Reportes personalizados',
      'Cajas registradoras ilimitadas',
      'Multi-sucursal avanzado',
      'Integración con todos los medios de pago',
      'Facturación electrónica SII',
      'API completa',
      'Backup en tiempo real',
      'Personalización del sistema',
      'Capacitación incluida'
    ]),
    maxUsers: null,
    maxProducts: null,
    maxSales: null,
    isActive: true,
  },

  // ========================================
  // PLANES ANUALES (con 20% de descuento)
  // ========================================
  {
    name: 'Plan Básico - Anual',
    description: 'Ahorra 20% pagando anualmente',
    price: 191904, // 19990 * 12 * 0.8
    billingCycle: 'ANNUAL' as BillingCycle,
    trialDays: 30,
    isVisible: true,
    sortOrder: 5,
    features: JSON.stringify([
      '3 Usuarios',
      '500 Productos',
      'Ventas ilimitadas',
      'Soporte prioritario',
      'Reportes avanzados',
      '2 Cajas registradoras',
      'Control de inventario',
      'Gestión de clientes',
      '⭐ 20% de descuento',
      '⭐ 2 meses gratis'
    ]),
    maxUsers: 3,
    maxProducts: 500,
    maxSales: null,
    isActive: true,
  },
  {
    name: 'Plan Profesional - Anual',
    description: 'Ahorra 20% pagando anualmente',
    price: 383904, // 39990 * 12 * 0.8
    billingCycle: 'ANNUAL' as BillingCycle,
    trialDays: 30,
    isVisible: true,
    sortOrder: 6,
    features: JSON.stringify([
      '10 Usuarios',
      '2000 Productos',
      'Ventas ilimitadas',
      'Soporte 24/7',
      'Reportes personalizados',
      '5 Cajas registradoras',
      'Multi-sucursal',
      'Integración con Transbank',
      'Facturación electrónica',
      'API de integración',
      'Backup automático diario',
      '⭐ 20% de descuento',
      '⭐ 2 meses gratis'
    ]),
    maxUsers: 10,
    maxProducts: 2000,
    maxSales: null,
    isActive: true,
  },
  {
    name: 'Plan Empresarial - Anual',
    description: 'Ahorra 25% pagando anualmente',
    price: 719928, // 79990 * 12 * 0.75 (25% descuento)
    billingCycle: 'ANNUAL' as BillingCycle,
    trialDays: 30,
    isVisible: true,
    sortOrder: 7,
    features: JSON.stringify([
      'Usuarios ilimitados',
      'Productos ilimitados',
      'Ventas ilimitadas',
      'Soporte dedicado 24/7',
      'Reportes personalizados',
      'Cajas registradoras ilimitadas',
      'Multi-sucursal avanzado',
      'Integración con todos los medios de pago',
      'Facturación electrónica SII',
      'API completa',
      'Backup en tiempo real',
      'Personalización del sistema',
      'Capacitación incluida',
      '⭐ 25% de descuento',
      '⭐ 3 meses gratis'
    ]),
    maxUsers: null,
    maxProducts: null,
    maxSales: null,
    isActive: true,
  },
];

async function main() {
  console.log('🚀 Iniciando seed de planes de suscripción...\n');

  try {
    // Eliminar planes existentes si es necesario (solo en desarrollo)
    // await prisma.subscriptionPlan.deleteMany({});
    // console.log('🗑️  Planes existentes eliminados\n');

    // Crear los planes de suscripción
    let createdCount = 0;
    let updatedCount = 0;

    for (const plan of subscriptionPlans) {
      try {
        const existingPlan = await prisma.subscriptionPlan.findFirst({
          where: {
            name: plan.name,
            billingCycle: plan.billingCycle,
          },
        });

        if (existingPlan) {
          // Actualizar el plan existente
          await prisma.subscriptionPlan.update({
            where: { id: existingPlan.id },
            data: plan,
          });
          console.log(`✅ Plan actualizado: ${plan.name}`);
          updatedCount++;
        } else {
          // Crear nuevo plan
          await prisma.subscriptionPlan.create({
            data: plan,
          });
          console.log(`✅ Plan creado: ${plan.name} - $${plan.price.toLocaleString('es-CL')}`);
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Error procesando plan ${plan.name}:`, error);
      }
    }

    console.log(`\n✅ Seed completado exitosamente!`);
    console.log(`📊 Resumen:`);
    console.log(`   - Planes creados: ${createdCount}`);
    console.log(`   - Planes actualizados: ${updatedCount}`);
    console.log(`   - Total: ${createdCount + updatedCount}`);

    // Mostrar todos los planes creados
    const allPlans = await prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    console.log('\n📋 Planes de suscripción disponibles:');
    allPlans.forEach((plan) => {
      console.log(`   ${plan.sortOrder}. ${plan.name} - $${Number(plan.price).toLocaleString('es-CL')} ${plan.billingCycle === 'MONTHLY' ? '/mes' : '/año'}`);
    });

  } catch (error) {
    console.error('❌ Error en el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
