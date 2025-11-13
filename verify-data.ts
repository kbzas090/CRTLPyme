import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando datos en la base de datos...\n');
  
  // Planes
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: [{ price: 'asc' }, { billingCycle: 'asc' }]
  });
  
  console.log('📋 PLANES ACTIVOS:');
  console.log(`Total: ${plans.length}`);
  plans.forEach(p => {
    console.log(`  - ${p.name} (${p.billingCycle}): $${p.price} CLP | Visible: ${p.isVisible}`);
  });
  
  // Suscripciones
  const subscriptions = await prisma.subscription.findMany({
    include: {
      tenant: true,
      plan: true
    }
  });
  
  console.log(`\n💼 SUSCRIPCIONES ACTIVAS:`);
  console.log(`Total: ${subscriptions.length}`);
  
  // Pagos
  const payments = await prisma.subscriptionPayment.findMany();
  console.log(`\n💰 PAGOS HISTÓRICOS:`);
  console.log(`Total: ${payments.length}`);
  
  // Tenants
  const tenants = await prisma.tenant.findMany();
  console.log(`\n🏢 TENANTS:`);
  console.log(`Total: ${tenants.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
