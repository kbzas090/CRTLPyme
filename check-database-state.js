const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking CRTLPyme database state...\n');
    
    // Count records in all major tables
    const counts = {
      subscriptionPlans: await prisma.subscriptionPlan.count(),
      tenants: await prisma.tenant.count(),
      users: await prisma.user.count(),
      masterProducts: await prisma.masterProduct.count(),
      tenantInventories: await prisma.tenantInventory.count(),
      sales: await prisma.sale.count(),
      stockAdjustments: await prisma.stockAdjustment.count(),
      subscriptions: await prisma.subscription.count(),
      subscriptionPayments: await prisma.subscriptionPayment.count(),
    };

    console.log('📊 Current Database State:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Subscription Plans:      ${counts.subscriptionPlans}`);
    console.log(`Tenants (Businesses):    ${counts.tenants}`);
    console.log(`Users:                   ${counts.users}`);
    console.log(`Master Products:         ${counts.masterProducts}`);
    console.log(`Tenant Inventories:      ${counts.tenantInventories}`);
    console.log(`Sales:                   ${counts.sales}`);
    console.log(`Stock Adjustments:       ${counts.stockAdjustments}`);
    console.log(`Subscriptions:           ${counts.subscriptions}`);
    console.log(`Subscription Payments:   ${counts.subscriptionPayments}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Determine if database is populated
    const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
    
    if (totalRecords === 0) {
      console.log('❌ Database is EMPTY - Needs seeding');
      return { populated: false, counts };
    } else if (counts.tenants < 5 || counts.users < 10 || counts.masterProducts < 10) {
      console.log('⚠️  Database has INSUFFICIENT data - May need more products');
      return { populated: false, counts };
    } else {
      console.log('✅ Database is POPULATED with sufficient data');
      return { populated: true, counts };
    }

  } catch (error) {
    console.error('❌ Error checking database state:', error.message);
    return { populated: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState()
  .then((result) => {
    process.exit(result.populated ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
