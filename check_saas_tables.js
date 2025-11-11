const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:CRTLPyme2025!@136.116.45.158:5432/crtlpyme?sslmode=require"
    }
  }
});

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas de SaaS y Planes...\n');
    
    // Verificar SubscriptionPlans
    const plansCount = await prisma.subscriptionPlan.count();
    console.log(`✅ Tabla subscription_plans: ${plansCount} registros`);
    
    if (plansCount > 0) {
      const plans = await prisma.subscriptionPlan.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          billingCycle: true,
          isActive: true,
          isVisible: true,
          _count: {
            select: {
              subscriptions: true
            }
          }
        }
      });
      console.log('\n📋 Planes existentes:');
      plans.forEach((plan, i) => {
        console.log(`   ${i+1}. ${plan.name} - $${plan.price} (${plan.billingCycle})`);
        console.log(`      Estado: ${plan.isActive ? '✓ Activo' : '✗ Inactivo'} | Visible: ${plan.isVisible ? 'Sí' : 'No'}`);
        console.log(`      Suscripciones: ${plan._count.subscriptions}`);
      });
    }
    
    // Verificar Subscriptions
    const subsCount = await prisma.subscription.count();
    console.log(`\n✅ Tabla subscriptions: ${subsCount} registros`);
    
    // Verificar PlatformAdmin
    const adminsCount = await prisma.platformAdmin.count();
    console.log(`✅ Tabla platform_admins: ${adminsCount} registros`);
    
    if (adminsCount > 0) {
      const admins = await prisma.platformAdmin.findMany({
        select: {
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true
        }
      });
      console.log('\n👤 Administradores SaaS:');
      admins.forEach((admin, i) => {
        console.log(`   ${i+1}. ${admin.firstName} ${admin.lastName} (${admin.email})`);
        console.log(`      Rol: ${admin.role} | Estado: ${admin.isActive ? '✓ Activo' : '✗ Inactivo'}`);
      });
    }
    
    // Verificar TenantManagement
    const tenantMgmtCount = await prisma.tenantManagement.count();
    console.log(`\n✅ Tabla tenant_management: ${tenantMgmtCount} registros`);
    
    // Verificar SubscriptionPayment
    const paymentsCount = await prisma.subscriptionPayment.count();
    console.log(`✅ Tabla subscription_payments: ${paymentsCount} registros`);
    
    // Verificar PlatformMetrics
    const metricsCount = await prisma.platformMetrics.count();
    console.log(`✅ Tabla platform_metrics: ${metricsCount} registros`);
    
    // Verificar EmailTemplate
    const templatesCount = await prisma.emailTemplate.count();
    console.log(`✅ Tabla email_templates: ${templatesCount} registros`);
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
