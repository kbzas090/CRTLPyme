/**
 * Script to create or update admin user with specific credentials
 * 
 * This script ensures the admin user exists with the correct credentials
 * and all necessary attributes for successful authentication.
 * 
 * Usage:
 *   npx tsx scripts/create-admin-user.ts
 *   npx tsx scripts/create-admin-user.ts <email> <password>
 */

import { PrismaClient, UserRole, PlanType, AccountStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Default credentials - can be overridden via command line
const DEFAULT_ADMIN_EMAIL = 'admin@crtlpyme.com'
const DEFAULT_ADMIN_PASSWORD = 'Admin2025!'

async function createOrUpdateAdmin(email: string, password: string) {
  console.log('\n🔧 Creating/Updating Admin User\n')
  console.log('═'.repeat(60))
  
  try {
    // Step 1: Ensure platform tenant exists
    console.log('\n1️⃣ Checking platform tenant...')
    
    const platformTenant = await prisma.tenant.upsert({
      where: { rut: '99.999.999-9' },
      update: {
        isActive: true,
        accountStatus: AccountStatus.ACTIVE
      },
      create: {
        businessName: 'CRTLPyme - Plataforma',
        rut: '99.999.999-9',
        email: 'plataforma@crtlpyme.com',
        phone: '+56900000000',
        address: 'Santiago, Chile',
        isActive: true,
        planType: PlanType.ENTERPRISE,
        accountStatus: AccountStatus.ACTIVE,
        maxCashiers: 10,
        onboardingCompleted: true
      }
    })
    
    console.log('✅ Platform tenant ready:', platformTenant.businessName)
    
    // Step 2: Hash the password
    console.log('\n2️⃣ Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('✅ Password hashed successfully')
    console.log('   Hash prefix:', hashedPassword.substring(0, 20))
    
    // Step 3: Verify hash works
    console.log('\n3️⃣ Verifying hash...')
    const testVerification = await bcrypt.compare(password, hashedPassword)
    if (!testVerification) {
      throw new Error('Password hash verification failed!')
    }
    console.log('✅ Hash verification successful')
    
    // Step 4: Create or update admin user
    console.log('\n4️⃣ Creating/updating admin user...')
    
    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Plataforma',
        role: UserRole.PROVEEDOR,
        isActive: true,
        tenantId: platformTenant.id
      },
      create: {
        email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Plataforma',
        role: UserRole.PROVEEDOR,
        isActive: true,
        tenantId: platformTenant.id
      },
      include: {
        tenant: true
      }
    })
    
    console.log('✅ Admin user created/updated successfully')
    
    // Step 5: Verify everything
    console.log('\n5️⃣ Verifying admin user...')
    console.log('   Email:', admin.email)
    console.log('   Role:', admin.role)
    console.log('   Is Active:', admin.isActive)
    console.log('   Tenant:', admin.tenant.businessName)
    console.log('   Tenant Active:', admin.tenant.isActive)
    
    // Step 6: Final password test
    console.log('\n6️⃣ Final password verification...')
    const finalTest = await bcrypt.compare(password, admin.password)
    console.log('   Result:', finalTest ? '✅ SUCCESS' : '❌ FAILED')
    
    if (!finalTest) {
      throw new Error('Final password verification failed!')
    }
    
    // Success summary
    console.log('\n' + '═'.repeat(60))
    console.log('✨ ADMIN USER READY ✨')
    console.log('═'.repeat(60))
    console.log('\n🔐 Credentials:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   Role: ${admin.role} (Super Admin)`)
    console.log('\n📝 Next steps:')
    console.log('   1. Try logging in with these credentials')
    console.log('   2. If still getting 401 errors, check Cloud Run logs')
    console.log('   3. Consider deploying the debug version for more logs')
    console.log('\n' + '═'.repeat(60) + '\n')
    
    return admin
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error)
    throw error
  }
}

async function main() {
  const email = process.argv[2] || DEFAULT_ADMIN_EMAIL
  const password = process.argv[3] || DEFAULT_ADMIN_PASSWORD
  
  console.log('\n🚀 Admin User Setup Script')
  console.log('═'.repeat(60))
  
  try {
    await createOrUpdateAdmin(email, password)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
