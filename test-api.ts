import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log('🧪 Probando la lógica de la API...\n');
    
    // Simular la lógica de la API GET /api/subscription-plans
    const where = { isActive: true, isVisible: true };
    
    const plans = await prisma.subscriptionPlan.findMany({
      where,
      orderBy: {
        sortOrder: 'asc',
      },
    });
    
    console.log(`✅ Planes encontrados: ${plans.length}\n`);
    
    if (plans.length === 0) {
      console.log('❌ No se encontraron planes activos y visibles');
      console.log('\nVerificando todos los planes en la BD...');
      
      const allPlans = await prisma.subscriptionPlan.findMany();
      console.log(`Total de planes en BD: ${allPlans.length}`);
      
      allPlans.forEach(p => {
        console.log(`  - ${p.name}: isActive=${p.isActive}, isVisible=${p.isVisible}`);
      });
    } else {
      console.log('Planes que se mostrarían en la landing:');
      plans.forEach(p => {
        console.log(`  ✓ ${p.name} (${p.billingCycle}): $${p.price} CLP`);
      });
      
      // Simular el filtrado del componente
      const monthly = plans.filter(p => p.billingCycle === 'MONTHLY');
      const annual = plans.filter(p => p.billingCycle === 'ANNUAL');
      
      console.log(`\n📊 Distribución:`);
      console.log(`  - Mensuales: ${monthly.length}`);
      console.log(`  - Anuales: ${annual.length}`);
      
      // Probar la respuesta JSON
      const plansWithStats = await Promise.all(
        plans.map(async (plan) => {
          const activeSubscriptions = await prisma.subscription.count({
            where: {
              planId: plan.id,
              status: 'ACTIVE',
            },
          });
          
          return {
            ...plan,
            activeSubscriptions,
          };
        })
      );
      
      console.log(`\n📈 Suscripciones activas por plan:`);
      plansWithStats.forEach(p => {
        console.log(`  - ${p.name}: ${p.activeSubscriptions} suscripciones`);
      });
      
      console.log('\n✅ La API debería devolver estos datos correctamente');
      console.log(`\nRespuesta que se enviaría:`);
      console.log(JSON.stringify({
        plans: plansWithStats.slice(0, 2), // Solo los primeros 2 como muestra
        total: plansWithStats.length
      }, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
