import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function testLogin(email: string, password: string) {
  console.log(`\n🔐 Testing login for: ${email}`);
  console.log('Password:', password);
  console.log('─'.repeat(50));

  try {
    // This simulates the NextAuth authorize function
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user) {
      console.log('❌ User not found');
      return false;
    }

    console.log(`✅ User found: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Tenant: ${user.tenant.businessName}`);
    console.log(`   Tenant Active: ${user.tenant.isActive}`);

    if (!user.isActive) {
      console.log('❌ User is not active');
      return false;
    }

    if (!user.tenant?.isActive) {
      console.log('❌ Tenant is not active');
      return false;
    }

    // Test password verification
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      return false;
    }

    console.log('✅ Password verification successful!');
    console.log('✅ Login would succeed!');
    
    return true;
  } catch (error: any) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('═'.repeat(60));
  console.log('         CRTLPyme Authentication Verification');
  console.log('═'.repeat(60));

  const testAccounts = [
    { email: 'proveedor@test.com', password: 'admin123', role: 'PROVEEDOR (Super Admin)' },
    { email: 'admin@test.com', password: 'admin123', role: 'ADMIN (Client Admin)' },
    { email: 'caja@test.com', password: 'test123', role: 'CAJA (Cashier/Sales)' },
    { email: 'inventario@test.com', password: 'test123', role: 'INVENTARIO (Inventory)' },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const account of testAccounts) {
    const success = await testLogin(account.email, account.password);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('                    Results Summary');
  console.log('═'.repeat(60));
  console.log(`✅ Successful logins: ${successCount}/${testAccounts.length}`);
  console.log(`❌ Failed logins: ${failCount}/${testAccounts.length}`);
  
  if (successCount === testAccounts.length) {
    console.log('\n🎉 All authentication tests passed!');
    console.log('✅ The authentication system is working correctly.');
  } else {
    console.log('\n⚠️  Some authentication tests failed.');
    console.log('Please review the errors above.');
  }

  console.log('═'.repeat(60));

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
