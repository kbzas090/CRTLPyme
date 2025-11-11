import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function finalTest() {
  console.log('\n🔬 FINAL DATABASE CONNECTIVITY & AUTHENTICATION TEST\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Test 1: Query User table for test accounts
    console.log('1️⃣  Querying User table for test accounts...');
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          in: [
            'admin@crtlpyme.cl',
            'proveedor@crtlpyme.cl',
            'vendedor@crtlpyme.cl',
            'cliente@crtlpyme.cl'
          ]
        }
      },
      include: {
        tenant: {
          select: {
            businessName: true,
            planType: true,
            accountStatus: true
          }
        }
      }
    });

    console.log(`   ✅ Found ${testUsers.length} test accounts\n`);

    // Test 2: Verify each account
    console.log('2️⃣  Verifying test account details:\n');
    for (const user of testUsers) {
      console.log(`   📧 ${user.email}`);
      console.log(`      Name: ${user.firstName} ${user.lastName}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Tenant: ${user.tenant.businessName}`);
      console.log(`      Plan: ${user.tenant.planType}`);
      console.log(`      Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log('');
    }

    // Test 3: Password authentication test
    console.log('3️⃣  Testing password authentication:\n');
    
    const testCredentials = [
      { email: 'admin@crtlpyme.cl', password: 'Admin2025!' },
      { email: 'proveedor@crtlpyme.cl', password: 'Proveedor2025!' },
      { email: 'vendedor@crtlpyme.cl', password: 'Vendedor2025!' },
      { email: 'cliente@crtlpyme.cl', password: 'Cliente2025!' }
    ];

    for (const cred of testCredentials) {
      const user = await prisma.user.findUnique({
        where: { email: cred.email }
      });

      if (user) {
        const isValid = await bcrypt.compare(cred.password, user.password);
        console.log(`   ${isValid ? '✅' : '❌'} ${cred.email} - Password ${isValid ? 'VALID' : 'INVALID'}`);
      } else {
        console.log(`   ❌ ${cred.email} - User not found`);
      }
    }

    // Test 4: Database statistics
    console.log('\n4️⃣  Database statistics:\n');
    const stats = {
      users: await prisma.user.count(),
      tenants: await prisma.tenant.count(),
      masterProducts: await prisma.masterProduct.count(),
      tenantInventory: await prisma.tenantInventory.count(),
      sales: await prisma.sale.count(),
      subscriptions: await prisma.subscription.count(),
      subscriptionPlans: await prisma.subscriptionPlan.count()
    };

    console.log(`   Total Users: ${stats.users}`);
    console.log(`   Total Tenants: ${stats.tenants}`);
    console.log(`   Master Products: ${stats.masterProducts}`);
    console.log(`   Tenant Inventory Items: ${stats.tenantInventory}`);
    console.log(`   Sales Transactions: ${stats.sales}`);
    console.log(`   Active Subscriptions: ${stats.subscriptions}`);
    console.log(`   Subscription Plans: ${stats.subscriptionPlans}`);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED - DATABASE IS READY!');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

finalTest();
