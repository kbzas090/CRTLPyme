import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createProductsLegacyTable() {
  try {
    console.log('Creating products_legacy table...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "products_legacy" (
        "id" TEXT NOT NULL,
        "sku" TEXT NOT NULL,
        "barcode" TEXT,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "category" TEXT NOT NULL,
        "brand" TEXT,
        "costPrice" DECIMAL(10,2) NOT NULL,
        "salePrice" DECIMAL(10,2) NOT NULL,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "minStock" INTEGER NOT NULL DEFAULT 5,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "tenantId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "products_legacy_pkey" PRIMARY KEY ("id")
      );
    `;
    
    console.log('✅ products_legacy table created');
    
    console.log('Creating unique constraint and indexes...');
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "products_legacy_tenantId_sku_key" 
      ON "products_legacy"("tenantId", "sku");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "products_legacy_tenantId_barcode_idx" 
      ON "products_legacy"("tenantId", "barcode");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "products_legacy_tenantId_category_idx" 
      ON "products_legacy"("tenantId", "category");
    `;
    
    console.log('✅ Indexes created');
    
    console.log('Creating foreign key constraint...');
    await prisma.$executeRaw`
      ALTER TABLE "products_legacy" 
      ADD CONSTRAINT "products_legacy_tenantId_fkey" 
      FOREIGN KEY ("tenantId") 
      REFERENCES "tenants"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
    `;
    
    console.log('✅ Foreign key constraint created');
    console.log('\n🎉 products_legacy table setup complete!');
    
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

createProductsLegacyTable();
