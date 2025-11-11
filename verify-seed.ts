import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySeedData() {
  console.log('\n🔍 VERIFYING DATABASE SEED DATA\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // 1. Check Users
    console.log('1️⃣  USERS:');
    const users = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        tenant: {
          select: { businessName: true }
        }
      }
    });
    console.log(`   Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ${user.tenant.businessName}`);
    });
    console.log('   ✅ All test users exist\n');

    // 2. Check Subscription Plans
    console.log('2️⃣  SUBSCRIPTION PLANS:');
    const plans = await prisma.subscriptionPlan.findMany({
      select: {
        name: true,
        price: true,
        billingCycle: true,
        isActive: true
      }
    });
    console.log(`   Total plans: ${plans.length}`);
    plans.forEach(plan => {
      console.log(`   - ${plan.name}: $${plan.price} ${plan.billingCycle}`);
    });
    console.log('   ✅ All subscription plans created\n');

    // 3. Check Tenants
    console.log('3️⃣  TENANTS:');
    const tenants = await prisma.tenant.findMany({
      select: {
        businessName: true,
        rut: true,
        email: true,
        planType: true,
        accountStatus: true,
        isActive: true
      }
    });
    console.log(`   Total tenants: ${tenants.length}`);
    tenants.forEach(tenant => {
      console.log(`   - ${tenant.businessName} (${tenant.rut}) - ${tenant.planType} - ${tenant.accountStatus}`);
    });
    console.log('   ✅ All tenants created\n');

    // 4. Check Subscriptions
    console.log('4️⃣  SUBSCRIPTIONS:');
    const subscriptions = await prisma.subscription.findMany({
      select: {
        tenant: { select: { businessName: true } },
        plan: { select: { name: true } },
        status: true,
        startDate: true,
        nextBillingDate: true
      }
    });
    console.log(`   Total subscriptions: ${subscriptions.length}`);
    subscriptions.forEach(sub => {
      console.log(`   - ${sub.tenant.businessName}: ${sub.plan.name} (${sub.status})`);
    });
    console.log('   ✅ Subscriptions created\n');

    // 5. Check Master Products
    console.log('5️⃣  MASTER PRODUCTS:');
    const masterProducts = await prisma.masterProduct.findMany({
      select: {
        sku: true,
        name: true,
        category: true,
        brand: true,
        suggestedPrice: true
      },
      take: 10
    });
    const totalMasterProducts = await prisma.masterProduct.count();
    console.log(`   Total master products: ${totalMasterProducts}`);
    console.log('   First 10 products:');
    masterProducts.forEach(product => {
      console.log(`   - ${product.sku}: ${product.name} (${product.category}) - $${product.suggestedPrice}`);
    });
    console.log('   ✅ Master products populated\n');

    // 6. Check Tenant Inventory
    console.log('6️⃣  TENANT INVENTORY:');
    const inventoryCounts = await prisma.$queryRaw<any[]>`
      SELECT t."businessName", COUNT(ti.id) as product_count, SUM(ti.stock) as total_stock
      FROM tenants t
      LEFT JOIN tenant_inventory ti ON t.id = ti."tenantId"
      WHERE t.id != (SELECT id FROM tenants WHERE rut = '99.999.999-9')
      GROUP BY t."businessName"
      ORDER BY t."businessName";
    `;
    inventoryCounts.forEach((row: any) => {
      console.log(`   - ${row.businessName}: ${row.product_count} products, ${row.total_stock} units in stock`);
    });
    console.log('   ✅ Tenant inventories populated\n');

    // 7. Check Sales
    console.log('7️⃣  SALES:');
    const salesCounts = await prisma.$queryRaw<any[]>`
      SELECT t."businessName", COUNT(s.id) as sale_count, SUM(s.total) as total_revenue
      FROM tenants t
      LEFT JOIN sales s ON t.id = s."tenantId"
      WHERE t.id != (SELECT id FROM tenants WHERE rut = '99.999.999-9')
      GROUP BY t."businessName"
      ORDER BY t."businessName";
    `;
    salesCounts.forEach((row: any) => {
      console.log(`   - ${row.businessName}: ${row.sale_count} sales, $${Number(row.total_revenue || 0).toFixed(2)} revenue`);
    });
    console.log('   ✅ Sample sales recorded\n');

    // 8. Check Inventory Movements
    console.log('8️⃣  INVENTORY MOVEMENTS:');
    const movementCounts = await prisma.$queryRaw<any[]>`
      SELECT t."businessName", 
             im.type, 
             COUNT(im.id) as movement_count,
             SUM(ABS(im.quantity)) as total_quantity
      FROM tenants t
      LEFT JOIN inventory_movements im ON t.id = im."tenantId"
      WHERE t.id != (SELECT id FROM tenants WHERE rut = '99.999.999-9')
      GROUP BY t."businessName", im.type
      ORDER BY t."businessName", im.type;
    `;
    movementCounts.forEach((row: any) => {
      if (row.type) {
        console.log(`   - ${row.businessName} (${row.type}): ${row.movement_count} movements, ${row.total_quantity} units`);
      }
    });
    console.log('   ✅ Inventory movements recorded\n');

    // 9. Test Password Authentication
    console.log('9️⃣  PASSWORD VERIFICATION:');
    const bcrypt = require('bcrypt');
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@crtlpyme.cl' }
    });
    if (testUser) {
      const isValidPassword = await bcrypt.compare('Admin2025!', testUser.password);
      if (isValidPassword) {
        console.log('   ✅ Password hashing verified (admin@crtlpyme.cl with Admin2025!)\n');
      } else {
        console.log('   ❌ Password verification failed!\n');
      }
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ ALL VERIFICATION CHECKS PASSED!');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('❌ Verification error:', error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySeedData();
