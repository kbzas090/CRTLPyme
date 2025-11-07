/**
 * Script to diagnose and fix admin password authentication issues
 * 
 * Usage:
 * 1. Check current password: npx tsx scripts/fix-admin-password.ts check
 * 2. Reset password: npx tsx scripts/fix-admin-password.ts reset
 * 3. Test password: npx tsx scripts/fix-admin-password.ts test <email> <password>
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ADMIN_EMAIL = 'admin@crtlpyme.com'
const DEFAULT_PASSWORD = 'Admin2025!'

async function checkUser() {
  console.log('\n🔍 Checking user in database...\n')
  
  const user = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    include: { tenant: true }
  })

  if (!user) {
    console.log('❌ User not found with email:', ADMIN_EMAIL)
    return null
  }

  console.log('✅ User found:')
  console.log('   ID:', user.id)
  console.log('   Email:', user.email)
  console.log('   Name:', user.firstName, user.lastName)
  console.log('   Role:', user.role)
  console.log('   Is Active:', user.isActive)
  console.log('   Tenant ID:', user.tenantId)
  console.log('   Tenant Active:', user.tenant?.isActive)
  console.log('   Password hash length:', user.password?.length || 0)
  console.log('   Password hash prefix:', user.password?.substring(0, 20) || 'NONE')
  
  return user
}

async function testPassword(email: string, password: string) {
  console.log('\n🔐 Testing password...\n')
  
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.log('❌ User not found')
    return false
  }

  console.log('Testing password for:', user.email)
  
  try {
    const isValid = await bcrypt.compare(password, user.password)
    
    if (isValid) {
      console.log('✅ Password is VALID')
    } else {
      console.log('❌ Password is INVALID')
      
      // Try to understand why
      console.log('\nDebugging information:')
      console.log('- Password length provided:', password.length)
      console.log('- Hash stored in DB:', user.password.substring(0, 30) + '...')
      console.log('- Hash format looks correct:', user.password.startsWith('$2'))
      
      // Test if we can create a new hash with same password
      const newHash = await bcrypt.hash(password, 10)
      console.log('- New hash created:', newHash.substring(0, 30) + '...')
      console.log('- Hashes match:', user.password === newHash ? 'NO (expected)' : 'NO (expected)')
    }
    
    return isValid
  } catch (error) {
    console.error('❌ Error comparing password:', error)
    return false
  }
}

async function resetPassword() {
  console.log('\n🔄 Resetting admin password...\n')
  
  const user = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL }
  })

  if (!user) {
    console.log('❌ User not found')
    return false
  }

  console.log('Resetting password for:', user.email)
  console.log('New password will be:', DEFAULT_PASSWORD)
  
  const newHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  console.log('New hash created:', newHash.substring(0, 30) + '...')
  
  await prisma.user.update({
    where: { email: ADMIN_EMAIL },
    data: {
      password: newHash,
      isActive: true  // Also ensure user is active
    }
  })

  console.log('✅ Password reset successfully')
  
  // Verify the new password works
  console.log('\nVerifying new password...')
  const isValid = await bcrypt.compare(DEFAULT_PASSWORD, newHash)
  console.log('Verification result:', isValid ? '✅ SUCCESS' : '❌ FAILED')
  
  return true
}

async function main() {
  const command = process.argv[2]
  
  console.log('═'.repeat(60))
  console.log('🔧 Admin Password Diagnostic Tool')
  console.log('═'.repeat(60))

  try {
    switch (command) {
      case 'check':
        await checkUser()
        break
      
      case 'test':
        const email = process.argv[3] || ADMIN_EMAIL
        const password = process.argv[4]
        
        if (!password) {
          console.log('❌ Please provide a password to test')
          console.log('Usage: npx tsx scripts/fix-admin-password.ts test <email> <password>')
          break
        }
        
        await testPassword(email, password)
        break
      
      case 'reset':
        await resetPassword()
        break
      
      default:
        console.log('\n📖 Usage:')
        console.log('  npx tsx scripts/fix-admin-password.ts check')
        console.log('  npx tsx scripts/fix-admin-password.ts test <email> <password>')
        console.log('  npx tsx scripts/fix-admin-password.ts reset')
        console.log('\nExamples:')
        console.log('  npx tsx scripts/fix-admin-password.ts check')
        console.log('  npx tsx scripts/fix-admin-password.ts test admin@crtlpyme.com Admin2025!')
        console.log('  npx tsx scripts/fix-admin-password.ts reset')
    }
  } catch (error) {
    console.error('\n❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }

  console.log('\n' + '═'.repeat(60) + '\n')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
