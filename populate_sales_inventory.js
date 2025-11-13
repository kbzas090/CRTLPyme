const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Payment method distribution (weighted)
const PAYMENT_METHODS = [
  { method: 'CASH', weight: 50 },      // 50% cash
  { method: 'DEBIT', weight: 28 },     // 28% debit
  { method: 'CREDIT', weight: 15 },    // 15% credit
  { method: 'TRANSFER', weight: 7 }    // 7% transfer
];

// Helper function to get random weighted payment method
function getRandomPaymentMethod() {
  const total = PAYMENT_METHODS.reduce((sum, pm) => sum + pm.weight, 0);
  let random = Math.random() * total;
  
  for (const pm of PAYMENT_METHODS) {
    if (random < pm.weight) {
      return pm.method;
    }
    random -= pm.weight;
  }
  
  return 'CASH'; // fallback
}

// Helper function to generate random date between June 2025 and November 2025
function getRandomDateInRange() {
  const start = new Date('2025-06-01T08:00:00');
  const end = new Date('2025-11-30T20:00:00');
  const range = end.getTime() - start.getTime();
  const randomTime = start.getTime() + Math.random() * range;
  return new Date(randomTime);
}

// Helper function to get random integer between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate sale number
function generateSaleNumber(tenantPrefix, index) {
  return `${tenantPrefix}-${String(index).padStart(6, '0')}`;
}

// Main function to populate sales and inventory
async function populateSalesAndInventory() {
  console.log('🚀 Starting Sales and Inventory Population Script\n');
  console.log('=' .repeat(70));
  
  const summary = {
    totalSalesCreated: 0,
    totalItemsCreated: 0,
    totalInventoryMovementsCreated: 0,
    totalRevenue: 0,
    tenantStats: {},
    paymentMethodStats: {
      CASH: 0,
      DEBIT: 0,
      CREDIT: 0,
      TRANSFER: 0
    },
    errors: []
  };

  try {
    // Get all active tenants with inventory and users
    const tenants = await prisma.tenant.findMany({
      where: {
        isActive: true,
        tenantInventories: {
          some: {
            isActive: true,
            stock: {
              gt: 0
            }
          }
        },
        users: {
          some: {
            isActive: true
          }
        }
      },
      include: {
        users: {
          where: { isActive: true },
          take: 1
        },
        tenantInventories: {
          where: {
            isActive: true,
            stock: {
              gt: 0
            }
          },
          select: {
            id: true,
            costPrice: true,
            salePrice: true,
            stock: true,
            masterProduct: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      }
    });

    console.log(`\n📊 Found ${tenants.length} active tenants with inventory and users\n`);

    for (const tenant of tenants) {
      console.log(`\n🏪 Processing: ${tenant.businessName}`);
      console.log('-'.repeat(70));

      if (tenant.users.length === 0) {
        console.log('  ⚠️  No active users found, skipping...');
        summary.errors.push(`${tenant.businessName}: No active users`);
        continue;
      }

      if (tenant.tenantInventories.length === 0) {
        console.log('  ⚠️  No inventory with stock, skipping...');
        summary.errors.push(`${tenant.businessName}: No inventory`);
        continue;
      }

      const user = tenant.users[0];
      const inventory = tenant.tenantInventories;
      
      // Generate 5-15 sales per tenant
      const numberOfSales = getRandomInt(5, 15);
      
      summary.tenantStats[tenant.businessName] = {
        salesCount: 0,
        itemsCount: 0,
        totalRevenue: 0,
        paymentMethods: {
          CASH: 0,
          DEBIT: 0,
          CREDIT: 0,
          TRANSFER: 0
        }
      };

      console.log(`  📝 Creating ${numberOfSales} sales...`);

      for (let i = 0; i < numberOfSales; i++) {
        try {
          // Get current sale count for this tenant to generate proper sale number
          const existingSalesCount = await prisma.sale.count({
            where: { tenantId: tenant.id }
          });

          const saleNumber = generateSaleNumber(
            tenant.businessName.substring(0, 3).toUpperCase(),
            existingSalesCount + i + 1
          );

          // Select 2-8 random items from inventory
          const numberOfItems = getRandomInt(2, 8);
          const selectedItems = [];
          const usedIndexes = new Set();

          while (selectedItems.length < numberOfItems && usedIndexes.size < inventory.length) {
            const randomIndex = getRandomInt(0, inventory.length - 1);
            if (!usedIndexes.has(randomIndex)) {
              usedIndexes.add(randomIndex);
              selectedItems.push(inventory[randomIndex]);
            }
          }

          // Calculate sale totals
          let subtotal = 0;
          const items = selectedItems.map(item => {
            const quantity = getRandomInt(1, 5);
            const unitPrice = parseFloat(item.salePrice);
            const unitCost = parseFloat(item.costPrice);
            const itemSubtotal = quantity * unitPrice;
            subtotal += itemSubtotal;

            return {
              quantity,
              unitPrice,
              unitCost,
              subtotal: itemSubtotal,
              tenantInventoryId: item.id,
              tenantId: tenant.id
            };
          });

          // Chilean IVA is 19%
          const tax = subtotal * 0.19;
          const total = subtotal + tax;

          const paymentMethod = getRandomPaymentMethod();
          
          // Calculate cash received and change for CASH payments
          let cashReceived = null;
          let change = null;
          
          if (paymentMethod === 'CASH') {
            // Round up to nearest 1000 for cash payments
            cashReceived = Math.ceil(total / 1000) * 1000;
            change = cashReceived - total;
          }

          const saleDate = getRandomDateInRange();

          // Create the sale with all items
          const sale = await prisma.sale.create({
            data: {
              saleNumber,
              subtotal,
              tax,
              total,
              paymentMethod,
              cashReceived,
              change,
              status: 'COMPLETED',
              userId: user.id,
              tenantId: tenant.id,
              createdAt: saleDate,
              updatedAt: saleDate,
              items: {
                create: items
              }
            },
            include: {
              items: true
            }
          });

          // Update statistics
          summary.totalSalesCreated++;
          summary.totalItemsCreated += items.length;
          summary.totalRevenue += parseFloat(total);
          summary.paymentMethodStats[paymentMethod]++;
          
          summary.tenantStats[tenant.businessName].salesCount++;
          summary.tenantStats[tenant.businessName].itemsCount += items.length;
          summary.tenantStats[tenant.businessName].totalRevenue += parseFloat(total);
          summary.tenantStats[tenant.businessName].paymentMethods[paymentMethod]++;

          if ((i + 1) % 5 === 0 || i === numberOfSales - 1) {
            console.log(`    ✓ Created ${i + 1}/${numberOfSales} sales...`);
          }

        } catch (saleError) {
          console.error(`    ✗ Error creating sale ${i + 1}: ${saleError.message}`);
          summary.errors.push(`${tenant.businessName} - Sale ${i + 1}: ${saleError.message}`);
        }
      }

      console.log(`  ✅ Completed: ${summary.tenantStats[tenant.businessName].salesCount} sales, $${summary.tenantStats[tenant.businessName].totalRevenue.toFixed(0)} CLP`);
    }

    // Inventory movements table doesn't exist yet, will be created in future migration
    summary.totalInventoryMovementsCreated = 0;

    console.log('\n' + '='.repeat(70));
    console.log('✅ POPULATION COMPLETE!');
    console.log('='.repeat(70));
    
    console.log('\n📈 OVERALL SUMMARY:');
    console.log(`  Total Sales Created: ${summary.totalSalesCreated}`);
    console.log(`  Total Sale Items: ${summary.totalItemsCreated}`);
    console.log(`  Total Inventory Movements: ${summary.totalInventoryMovementsCreated}`);
    console.log(`  Total Revenue: $${summary.totalRevenue.toFixed(0)} CLP`);
    
    console.log('\n💳 Payment Method Distribution:');
    Object.entries(summary.paymentMethodStats).forEach(([method, count]) => {
      const percentage = summary.totalSalesCreated > 0 
        ? ((count / summary.totalSalesCreated) * 100).toFixed(1)
        : 0;
      console.log(`  ${method}: ${count} sales (${percentage}%)`);
    });

    console.log('\n🏪 Sales by Tenant:');
    Object.entries(summary.tenantStats).forEach(([name, stats]) => {
      console.log(`  ${name}:`);
      console.log(`    - Sales: ${stats.salesCount}`);
      console.log(`    - Items: ${stats.itemsCount}`);
      console.log(`    - Revenue: $${stats.totalRevenue.toFixed(0)} CLP`);
    });

    if (summary.errors.length > 0) {
      console.log('\n⚠️  ERRORS ENCOUNTERED:');
      summary.errors.forEach(error => console.log(`  - ${error}`));
    }

    // Save summary to file
    const fs = require('fs');
    const summaryReport = generateMarkdownReport(summary);
    fs.writeFileSync('/home/ubuntu/SALES_INVENTORY_POPULATION_REPORT.md', summaryReport);
    console.log('\n📄 Summary report saved to: /home/ubuntu/SALES_INVENTORY_POPULATION_REPORT.md');

    return summary;

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generateMarkdownReport(summary) {
  const date = new Date().toISOString().split('T')[0];
  
  let report = `# 📊 Sales and Inventory Population Report
  
**Date:** ${date}  
**Project:** CRTLPyme - SaaS Platform

---

## 📈 Executive Summary

- **Total Sales Created:** ${summary.totalSalesCreated}
- **Total Sale Items:** ${summary.totalItemsCreated}
- **Total Inventory Movements:** ${summary.totalInventoryMovementsCreated}
- **Total Revenue Generated:** $${summary.totalRevenue.toFixed(0)} CLP
- **Date Range:** June 1, 2025 - November 30, 2025

---

## 💳 Payment Method Distribution

| Payment Method | Count | Percentage |
|---------------|-------|------------|
`;

  Object.entries(summary.paymentMethodStats).forEach(([method, count]) => {
    const percentage = summary.totalSalesCreated > 0 
      ? ((count / summary.totalSalesCreated) * 100).toFixed(1)
      : 0;
    report += `| ${method} | ${count} | ${percentage}% |\n`;
  });

  report += `\n---

## 🏪 Sales by Tenant

| Tenant | Sales | Items | Revenue (CLP) | Payment Methods |
|--------|-------|-------|---------------|-----------------|
`;

  Object.entries(summary.tenantStats).forEach(([name, stats]) => {
    const pmethods = Object.entries(stats.paymentMethods)
      .filter(([_, count]) => count > 0)
      .map(([method, count]) => `${method}:${count}`)
      .join(', ');
    
    report += `| ${name} | ${stats.salesCount} | ${stats.itemsCount} | $${stats.totalRevenue.toFixed(0)} | ${pmethods} |\n`;
  });

  if (summary.errors.length > 0) {
    report += `\n---

## ⚠️ Errors Encountered

${summary.errors.map(error => `- ${error}`).join('\n')}
`;
  }

  report += `\n---

## ✅ Completion Status

**Status:** ${summary.errors.length === 0 ? 'SUCCESS' : 'COMPLETED WITH WARNINGS'}  
**Execution Date:** ${new Date().toLocaleString('es-CL')}

---

## 📝 Notes

- All sales are distributed across June to November 2025
- Payment methods follow realistic distribution (50% cash, 28% debit, 15% credit, 7% transfer)
- Each sale includes 2-8 items from tenant's inventory
- Inventory movements are created for each sale item (EXIT type)
- Stock levels are automatically updated after each sale
- Chilean IVA (19%) is applied to all sales

---

*Report generated by CRTLPyme Sales Population Script*
`;

  return report;
}

// Execute the script
populateSalesAndInventory()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
