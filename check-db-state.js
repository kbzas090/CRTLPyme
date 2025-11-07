const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Checking database state...\n');
  
  try {
    // Check tenants
    const tenantCount = await prisma.tenant.count();
    console.log(`📊 Tenants: ${tenantCount}`);
    
    // Check users
    const userCount = await prisma.user.count();
    console.log(`👤 Users: ${userCount}`);
    
    // Check products
    const productCount = await prisma.productLegacy.count();
    console.log(`📦 Products: ${productCount}`);
    
    // Check sales
    const salesCount = await prisma.sale.count();
    console.log(`💰 Sales: ${salesCount}`);
    
    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@crtlpyme.cl' }
    });
    console.log(`\n🔑 Admin user exists: ${adminUser ? 'YES' : 'NO'}`);
    
    if (adminUser) {
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Active: ${adminUser.isActive}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
