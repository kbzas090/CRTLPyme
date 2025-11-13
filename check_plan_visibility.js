const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log("=== CHECKING SUBSCRIPTION PLAN VISIBILITY ===");
  
  const plans = await prisma.subscriptionPlan.findMany({
    select: {
      id: true,
      name: true,
      billingCycle: true,
      price: true,
      isActive: true,
      isVisible: true,
      sortOrder: true
    },
    orderBy: [
      { billingCycle: 'asc' },
      { sortOrder: 'asc' }
    ]
  });
  
  console.log(`\nTotal plans: ${plans.length}`);
  console.log(`Active plans: ${plans.filter(p => p.isActive).length}`);
  console.log(`Visible plans: ${plans.filter(p => p.isVisible).length}`);
  console.log(`Active AND Visible plans: ${plans.filter(p => p.isActive && p.isVisible).length}`);
  
  console.log("\n=== PLAN DETAILS ===");
  plans.forEach(plan => {
    console.log(`${plan.name} (${plan.billingCycle}) - $${plan.price}`);
    console.log(`  Active: ${plan.isActive}, Visible: ${plan.isVisible}, Sort: ${plan.sortOrder}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
