import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createInventoryMovementsTable() {
  try {
    console.log('Creating inventory_movements table...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "inventory_movements" (
        "id" TEXT NOT NULL,
        "tenantInventoryId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "reason" TEXT,
        "notes" TEXT,
        "createdBy" TEXT NOT NULL,
        "tenantId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
      );
    `;
    
    console.log('✅ inventory_movements table created');
    
    console.log('Creating indexes...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "inventory_movements_tenantId_tenantInventoryId_idx" 
      ON "inventory_movements"("tenantId", "tenantInventoryId");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "inventory_movements_tenantId_type_idx" 
      ON "inventory_movements"("tenantId", "type");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "inventory_movements_tenantId_createdAt_idx" 
      ON "inventory_movements"("tenantId", "createdAt");
    `;
    
    console.log('✅ Indexes created');
    
    console.log('Creating foreign key constraints...');
    await prisma.$executeRaw`
      ALTER TABLE "inventory_movements" 
      ADD CONSTRAINT "inventory_movements_tenantInventoryId_fkey" 
      FOREIGN KEY ("tenantInventoryId") 
      REFERENCES "tenant_inventory"("id") 
      ON DELETE RESTRICT ON UPDATE CASCADE;
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "inventory_movements" 
      ADD CONSTRAINT "inventory_movements_createdBy_fkey" 
      FOREIGN KEY ("createdBy") 
      REFERENCES "users"("id") 
      ON DELETE RESTRICT ON UPDATE CASCADE;
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "inventory_movements" 
      ADD CONSTRAINT "inventory_movements_tenantId_fkey" 
      FOREIGN KEY ("tenantId") 
      REFERENCES "tenants"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
    `;
    
    console.log('✅ Foreign key constraints created');
    console.log('\n🎉 inventory_movements table setup complete!');
    
  } catch (error: any) {
    if (error.message && error.message.includes('already exists')) {
      console.log('⚠️  Table or constraint already exists, skipping...');
    } else {
      console.error('Error:', error.message || error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createInventoryMovementsTable();
