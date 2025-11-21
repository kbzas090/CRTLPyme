import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      price: true,
      billingCycle: true,
      isActive: true,
      sortOrder: true,
    },
  });

  console.log('\n📋 Planes de suscripción en la base de datos:\n');
  plans.forEach((plan) => {
    const priceFormatted = Number(plan.price).toLocaleString('es-CL');
    const cycle = plan.billingCycle === 'MONTHLY' ? 'mensual' : plan.billingCycle === 'ANNUAL' ? 'anual' : plan.billingCycle;
    console.log(`${plan.sortOrder}. ${plan.name}`);
    console.log(`   Precio: $${priceFormatted} CLP (${cycle})`);
    console.log(`   Estado: ${plan.isActive ? '✅ Activo' : '❌ Inactivo'}`);
    console.log(`   ID: ${plan.id}\n`);
  });

  console.log(`Total de planes: ${plans.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
