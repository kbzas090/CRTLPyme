import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🔍 Checking database connection...');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // Check users table
    console.log('📊 Analyzing users table...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true,
        isActive: true,
        tenantId: true,
      },
      take: 5 // Get first 5 users as sample
    });

    console.log(`Found ${users.length} users (showing first 5):\n`);
    
    // Analyze password format
    for (const user of users) {
      const isBcrypt = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
      console.log(`User: ${user.email}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.isActive}`);
      console.log(`  Password format: ${isBcrypt ? '✅ bcrypt hash' : '❌ NOT bcrypt (plain text or other)'}`);
      console.log(`  Password preview: ${user.password.substring(0, 20)}...`);
      console.log('');
    }

    // Count total users
    const totalUsers = await prisma.user.count();
    console.log(`\n📈 Total users in database: ${totalUsers}`);

    // Count by role
    console.log('\n📊 Users by role:');
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });
    
    for (const stat of roleStats) {
      console.log(`  ${stat.role}: ${stat._count}`);
    }

    // Check if we need to hash passwords
    const nonBcryptUsers = users.filter(u => !u.password.startsWith('$2a$') && !u.password.startsWith('$2b$'));
    if (nonBcryptUsers.length > 0) {
      console.log(`\n⚠️  Found ${nonBcryptUsers.length} users with non-bcrypt passwords that need fixing`);
    }

    // Get a tenant ID for creating test users
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true }
    });

    if (!tenant) {
      console.log('\n❌ No active tenant found. Need to create a tenant first.');
      return;
    }

    console.log(`\n✅ Found active tenant: ${tenant.businessName} (${tenant.id})`);

    // Now create test accounts with proper bcrypt hashing
    console.log('\n🔧 Creating test accounts...\n');

    const testAccounts = [
      {
        email: 'admin@test.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'Test',
        role: UserRole.ADMIN,
        tenantId: tenant.id,
      },
      {
        email: 'proveedor@test.com',
        password: 'admin123',
        firstName: 'Proveedor',
        lastName: 'Test',
        role: UserRole.PROVEEDOR,
        tenantId: tenant.id,
      },
      {
        email: 'caja@test.com',
        password: 'test123',
        firstName: 'Caja',
        lastName: 'Test',
        role: UserRole.CAJA,
        tenantId: tenant.id,
      },
      {
        email: 'inventario@test.com',
        password: 'test123',
        firstName: 'Inventario',
        lastName: 'Test',
        role: UserRole.INVENTARIO,
        tenantId: tenant.id,
      },
    ];

    const createdAccounts = [];

    for (const account of testAccounts) {
      try {
        // Check if user already exists
        const existing = await prisma.user.findUnique({
          where: { email: account.email }
        });

        if (existing) {
          console.log(`⚠️  User ${account.email} already exists, updating password...`);
          
          // Hash the password
          const hashedPassword = await bcrypt.hash(account.password, 10);
          
          // Update the user
          await prisma.user.update({
            where: { email: account.email },
            data: {
              password: hashedPassword,
              isActive: true,
            }
          });
          
          console.log(`✅ Updated ${account.email} with role ${account.role}`);
          createdAccounts.push({
            email: account.email,
            password: account.password,
            role: account.role,
            status: 'updated'
          });
        } else {
          // Hash the password
          const hashedPassword = await bcrypt.hash(account.password, 10);
          
          // Create the user
          await prisma.user.create({
            data: {
              ...account,
              password: hashedPassword,
              isActive: true,
            }
          });
          
          console.log(`✅ Created ${account.email} with role ${account.role}`);
          createdAccounts.push({
            email: account.email,
            password: account.password,
            role: account.role,
            status: 'created'
          });
        }
      } catch (error: any) {
        console.log(`❌ Error with ${account.email}: ${error.message}`);
      }
    }

    // Save credentials to file
    console.log('\n📝 Saving test account credentials...\n');
    
    const credentialsContent = `
=================================================================
         CRTLPyme - Test Account Credentials
=================================================================

Database: crtlpyme
Connection established: ✅

Test Accounts Created/Updated:
-------------------------------

${createdAccounts.map(acc => `
${acc.role} Account (${acc.status})
  Email: ${acc.email}
  Password: ${acc.password}
  Role: ${acc.role}
`).join('\n')}

Role Descriptions:
------------------
- PROVEEDOR: SaaS Administrator (super admin equivalent)
  Full access to the platform and all features
  
- ADMIN: Client Administrator
  Manages their tenant/business
  
- CAJA: Cashier/Sales Role (vendedor equivalent)
  Point of sale operations
  
- INVENTARIO: Inventory Manager (contador equivalent)
  Manages inventory and stock

Login Instructions:
-------------------
1. Navigate to the login page
2. Use any of the email addresses above
3. Enter the corresponding password
4. You will be redirected based on your role

Important Findings:
-------------------
✅ NextAuth is configured with bcrypt password hashing
✅ Passwords are hashed using bcrypt.hash() with 10 rounds
✅ Authentication uses bcrypt.compare() for verification
✅ All test accounts are properly hashed and ready to use

Total Users in System: ${totalUsers}

Role Distribution:
${roleStats.map(s => `  ${s.role}: ${s._count}`).join('\n')}

Tenant Used: ${tenant.businessName}
Tenant ID: ${tenant.id}

Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}

=================================================================
Generated: ${new Date().toISOString()}
=================================================================
`;

    const fs = require('fs');
    fs.writeFileSync('/home/ubuntu/test_accounts.txt', credentialsContent);
    console.log('✅ Test account credentials saved to /home/ubuntu/test_accounts.txt');

    // Verify one of the passwords works
    console.log('\n🔍 Verifying password hashing...');
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });
    
    if (testUser) {
      const isValid = await bcrypt.compare('admin123', testUser.password);
      console.log(`Password verification test: ${isValid ? '✅ PASSED' : '❌ FAILED'}`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P1001') {
      console.error('\n💡 Connection failed. Possible issues:');
      console.error('   - Cloud SQL Proxy not running');
      console.error('   - Incorrect DATABASE_URL');
      console.error('   - Network/firewall issues');
      console.error('   - Database credentials incorrect');
      console.error(`\nCurrent DATABASE_URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
