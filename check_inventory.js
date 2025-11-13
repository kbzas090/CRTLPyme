const { PrismaClient } = require('@prisma/client');

async function checkInventory() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('=== INVENTORY CHECK ===\n');
    
    // Check master products
    const masterProducts = await prisma.masterProduct.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        suggestedPrice: true
      },
      take: 10
    });
    
    console.log(`📦 Master Products (showing first 10 of ${await prisma.masterProduct.count()}):`);
    masterProducts.forEach(p => {
      console.log(`  - ${p.name} (${p.category}) - SKU: ${p.sku} - $${p.suggestedPrice}`);
    });
    
    // Check tenant inventory
    const tenantInventory = await prisma.tenantInventory.groupBy({
      by: ['tenantId'],
      _count: true
    });
    
    console.log(`\n🏪 Tenant Inventory Distribution:`);
    for (const group of tenantInventory) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: group.tenantId },
        select: { businessName: true }
      });
      console.log(`  - ${tenant.businessName}: ${group._count} products`);
    }
    
    // Check tenants with users
    const tenantsWithUsers = await prisma.tenant.findMany({
      select: {
        id: true,
        businessName: true,
        _count: {
          select: { users: true }
        }
      },
      where: {
        isActive: true
      }
    });
    
    console.log(`\n👥 Tenants with Users:`);
    tenantsWithUsers.forEach(t => {
      console.log(`  - ${t.businessName}: ${t._count.users} users`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkInventory();
