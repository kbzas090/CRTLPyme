const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log("=== CHECKING SUBSCRIPTION PLANS ===");
  const plans = await prisma.subscriptionPlan.findMany({
    select: {
      id: true,
      name: true,
      billingCycle: true,
      price: true,
      isActive: true
    },
    orderBy: [
      { billingCycle: 'asc' },
      { price: 'asc' }
    ]
  });
  
  console.log(`Total plans: ${plans.length}`);
  console.log("Monthly plans:", plans.filter(p => p.billingCycle === 'MONTHLY').length);
  console.log("Annual plans:", plans.filter(p => p.billingCycle === 'ANNUAL').length);
  console.log("Active plans:", plans.filter(p => p.isActive).length);
  
  console.log("\n=== CHECKING PRODUCTS ===");
  const totalProducts = await prisma.product.count();
  console.log(`Total products in database: ${totalProducts}`);
  
  if (totalProducts > 0) {
    const products = await prisma.product.findMany({
      take: 10,
      include: {
        tenant: {
          select: {
            businessName: true,
            rut: true
          }
        }
      }
    });
    
    console.log("\nSample products:");
    products.forEach(p => {
      console.log(`  - ${p.name} (SKU: ${p.sku}) - Tenant: ${p.tenant.businessName} - Price: $${p.price}`);
    });
  } else {
    console.log("No products found in database");
  }
  
  console.log("\n=== CHECKING TENANTS ===");
  const totalTenants = await prisma.tenant.count();
  console.log(`Total tenants: ${totalTenants}`);
  
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      businessName: true,
      rut: true,
      _count: {
        select: {
          products: true
        }
      }
    },
    take: 10
  });
  
  console.log(`\nSample tenants and their product counts:`);
  tenants.forEach(t => {
    console.log(`  - ${t.businessName} (${t.rut}): ${t._count.products} products`);
  });
  
  // Get aggregate stats
  const tenantsWithProducts = tenants.filter(t => t._count.products > 0).length;
  console.log(`\nTenants with products: ${tenantsWithProducts} out of ${Math.min(10, totalTenants)} checked`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
