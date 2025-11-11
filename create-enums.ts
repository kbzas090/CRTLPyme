import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createEnums() {
  try {
    console.log('Creating missing enum types...\n');
    
    // Check and create MovementType enum
    console.log('Creating MovementType enum...');
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "MovementType" AS ENUM ('ENTRY', 'EXIT', 'ADJUSTMENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('✅ MovementType enum created/verified');
    
    // Verify all enums exist
    const enums = [
      { name: 'UserRole', values: ['PROVEEDOR', 'ADMIN', 'CAJA', 'INVENTARIO', 'SOPORTE'] },
      { name: 'PlanType', values: ['BASIC', 'PRO', 'ENTERPRISE'] },
      { name: 'PaymentMethod', values: ['CASH', 'DEBIT', 'CREDIT', 'TRANSFER'] },
      { name: 'SaleStatus', values: ['PENDING', 'COMPLETED', 'CANCELLED'] },
      { name: 'CashSessionStatus', values: ['OPEN', 'CLOSED'] },
      { name: 'AdjustmentType', values: ['PURCHASE', 'LOSS', 'CORRECTION', 'RETURN'] },
      { name: 'ExpenseFrequency', values: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] },
      { name: 'AccountStatus', values: ['ACTIVE', 'TRIAL', 'SUSPENDED', 'BLOCKED', 'CANCELLED'] },
      { name: 'AdminRole', values: ['SUPER_ADMIN', 'SUPPORT', 'BILLING_ADMIN'] },
      { name: 'RiskLevel', values: ['LOW', 'MEDIUM', 'HIGH'] },
      { name: 'TenantAction', values: ['CREATED', 'SUSPENDED', 'BLOCKED', 'UNBLOCKED', 'SUBSCRIPTION_CHANGED', 'USER_CREATED', 'SETTINGS_UPDATED'] },
      { name: 'ReportPeriod', values: ['DAILY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'] },
      { name: 'BillingCycle', values: ['MONTHLY', 'QUARTERLY', 'ANNUAL'] },
      { name: 'SubscriptionStatus', values: ['ACTIVE', 'TRIAL', 'CANCELLED', 'EXPIRED', 'SUSPENDED'] },
      { name: 'EmailCategory', values: ['SUBSCRIPTION', 'PAYMENT', 'SYSTEM', 'MARKETING'] },
      { name: 'EmailPriority', values: ['HIGH', 'NORMAL', 'LOW'] },
      { name: 'EmailStatus', values: ['PENDING', 'SENT', 'FAILED'] },
      { name: 'EmailEvent', values: ['QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED'] },
      { name: 'NotificationType', values: ['PAYMENT', 'SUBSCRIPTION', 'SYSTEM', 'ALERT'] },
      { name: 'NotificationChannel', values: ['EMAIL', 'IN_APP'] },
      { name: 'NotificationStatus', values: ['SENT', 'FAILED', 'READ'] },
      { name: 'PaymentStatus', values: ['PENDING', 'APPROVED', 'REJECTED', 'FAILED', 'REFUNDED'] },
      { name: 'RefundStatus', values: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] }
    ];
    
    console.log('\nVerifying all other enums...');
    for (const enumDef of enums) {
      try {
        const values = enumDef.values.map(v => `'${v}'`).join(', ');
        await prisma.$executeRaw`
          DO $$ BEGIN
            EXECUTE format('CREATE TYPE "%I" AS ENUM (' || ${values} || ')', ${enumDef.name});
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `;
        console.log(`✅ ${enumDef.name} verified`);
      } catch (error: any) {
        console.log(`⚠️  ${enumDef.name}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 All enums setup complete!');
    
  } catch (error: any) {
    console.error('Error:', error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

createEnums();
