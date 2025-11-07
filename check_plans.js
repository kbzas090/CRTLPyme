const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPlans() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        billingCycle: true,
        isActive: true
      }
    });
    
    console.log(`\n✅ Found ${plans.length} subscription plans in database:\n`);
    
    if (plans.length > 0) {
      plans.forEach(plan => {
        console.log(`- ${plan.name}: $${plan.price} (${plan.billingCycle}) - ${plan.isActive ? 'Active' : 'Inactive'}`);
      });
    } else {
      console.log('⚠️ No plans found. Run: npm run seed:plans');
    }
    
  } catch (error) {
    console.error('❌ Error checking plans:', error.message);
    console.log('\n⚠️ Database connection may not be available or Prisma client needs to be generated.');
    console.log('   Run: npx prisma generate');
  } finally {
    await prisma.$disconnect();
  }
}

checkPlans();
