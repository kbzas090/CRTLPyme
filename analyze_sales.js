const { PrismaClient } = require('@prisma/client');

async function analyzeSales() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('=== SALES DATA ANALYSIS ===\n');
    
    // Get sales by tenant
    const salesByTenant = await prisma.sale.groupBy({
      by: ['tenantId'],
      _count: true,
      _sum: {
        total: true
      }
    });
    
    console.log('📊 Sales by Tenant:');
    for (const group of salesByTenant) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: group.tenantId },
        select: { businessName: true }
      });
      console.log(`  - ${tenant.businessName}: ${group._count} sales, Total: $${group._sum.total?.toFixed(0) || 0}`);
    }
    
    // Get payment method distribution
    const paymentMethods = await prisma.sale.groupBy({
      by: ['paymentMethod'],
      _count: true
    });
    
    console.log('\n💳 Payment Method Distribution:');
    paymentMethods.forEach(pm => {
      console.log(`  - ${pm.paymentMethod}: ${pm._count} sales`);
    });
    
    // Get date range
    const dateRange = await prisma.sale.aggregate({
      _min: { createdAt: true },
      _max: { createdAt: true }
    });
    
    console.log('\n📅 Date Range:');
    console.log(`  From: ${dateRange._min.createdAt?.toISOString().split('T')[0]}`);
    console.log(`  To: ${dateRange._max.createdAt?.toISOString().split('T')[0]}`);
    
    // Check if we need to add more sales
    const tenantCount = await prisma.tenant.count({ where: { isActive: true } });
    const totalSales = await prisma.sale.count();
    
    console.log(`\n📈 Summary:`);
    console.log(`  Total Tenants: ${tenantCount}`);
    console.log(`  Total Sales: ${totalSales}`);
    console.log(`  Average Sales per Tenant: ${(totalSales / tenantCount).toFixed(1)}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeSales();
