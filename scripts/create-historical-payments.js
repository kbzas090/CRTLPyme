const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createHistoricalPayments() {
  console.log('🚀 Iniciando creación de pagos históricos...\n');
  
  try {
    // Obtener todas las suscripciones activas
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'TRIAL']
        }
      },
      include: {
        plan: true,
        tenant: true,
        payments: true // Para verificar duplicados
      }
    });

    console.log(`✅ Encontradas ${subscriptions.length} suscripciones activas\n`);

    if (subscriptions.length === 0) {
      console.log('⚠️  No hay suscripciones activas para procesar');
      return;
    }

    let totalPaymentsCreated = 0;
    const summary = [];

    // Fecha límite: noviembre 2025
    const currentDate = new Date('2025-11-13');
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    for (const subscription of subscriptions) {
      console.log(`\n📋 Procesando suscripción: ${subscription.id}`);
      console.log(`   Tenant: ${subscription.tenant.businessName}`);
      console.log(`   Plan: ${subscription.plan.name} (${subscription.plan.billingCycle})`);
      console.log(`   Fecha inicio: ${subscription.startDate.toISOString().split('T')[0]}`);
      
      const startDate = new Date(subscription.startDate);
      const planAmount = parseFloat(subscription.plan.price);
      
      // Aplicar descuento si existe y está vigente
      let finalAmount = planAmount;
      if (subscription.discountPercent && subscription.discountEndsAt) {
        const discountEndDate = new Date(subscription.discountEndsAt);
        if (currentDate <= discountEndDate) {
          const discount = parseFloat(subscription.discountPercent);
          finalAmount = planAmount * (1 - discount / 100);
          console.log(`   💰 Descuento aplicado: ${discount}% (Precio: $${planAmount} → $${finalAmount})`);
        }
      }

      let paymentsCreated = 0;
      const existingPayments = subscription.payments;

      // Generar pagos mes a mes desde startDate hasta noviembre 2025
      let paymentDate = new Date(startDate);
      
      // Determinar el intervalo según el ciclo de facturación
      const monthIncrement = subscription.billingCycle === 'ANNUAL' ? 12 : 
                             subscription.billingCycle === 'QUARTERLY' ? 3 : 1;

      while (paymentDate <= currentDate) {
        // Verificar si ya existe un pago para esta fecha (margen de 5 días)
        const paymentMonth = paymentDate.getMonth();
        const paymentYear = paymentDate.getFullYear();
        
        const existingPayment = existingPayments.find(p => {
          if (!p.paymentDate) return false;
          const pDate = new Date(p.paymentDate);
          return pDate.getMonth() === paymentMonth && 
                 pDate.getFullYear() === paymentYear;
        });

        if (!existingPayment) {
          // Crear el pago
          const payment = await prisma.subscriptionPayment.create({
            data: {
              subscriptionId: subscription.id,
              tenantId: subscription.tenantId,
              amount: finalAmount,
              currency: 'CLP',
              status: 'APPROVED',
              paymentMethod: 'WEBPAY',
              paymentDate: new Date(paymentDate),
              transbankBuyOrder: `BO-${subscription.tenantId.substring(0, 8)}-${paymentDate.getFullYear()}${String(paymentDate.getMonth() + 1).padStart(2, '0')}`,
              transactionResponse: {
                vci: 'TSY',
                amount: finalAmount,
                status: 'AUTHORIZED',
                buy_order: `BO-${subscription.tenantId.substring(0, 8)}-${paymentDate.getFullYear()}${String(paymentDate.getMonth() + 1).padStart(2, '0')}`,
                response_code: 0,
                authorization_code: `AUTO-${Math.floor(Math.random() * 1000000)}`,
                payment_type_code: 'VD',
                transaction_date: paymentDate.toISOString(),
                installments_number: 0
              },
              cardLast4: '1234',
              cardType: 'Visa',
              installments: 1
            }
          });

          console.log(`   ✅ Pago creado: ${paymentDate.toISOString().split('T')[0]} - $${finalAmount}`);
          paymentsCreated++;
          totalPaymentsCreated++;
        } else {
          console.log(`   ⏭️  Pago ya existe: ${paymentDate.toISOString().split('T')[0]}`);
        }

        // Avanzar al siguiente período de facturación
        paymentDate.setMonth(paymentDate.getMonth() + monthIncrement);
      }

      summary.push({
        tenant: subscription.tenant.businessName,
        plan: subscription.plan.name,
        billingCycle: subscription.billingCycle,
        startDate: subscription.startDate.toISOString().split('T')[0],
        paymentsCreated,
        totalPayments: existingPayments.length + paymentsCreated,
        amount: finalAmount
      });

      console.log(`   📊 Pagos creados para esta suscripción: ${paymentsCreated}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN DE PAGOS HISTÓRICOS CREADOS');
    console.log('='.repeat(80));
    console.log(`\n✅ Total de pagos creados: ${totalPaymentsCreated}\n`);
    
    console.log('Detalle por suscripción:');
    console.log('-'.repeat(80));
    summary.forEach(item => {
      console.log(`\n🏢 ${item.tenant}`);
      console.log(`   Plan: ${item.plan} (${item.billingCycle})`);
      console.log(`   Fecha inicio: ${item.startDate}`);
      console.log(`   Pagos creados ahora: ${item.paymentsCreated}`);
      console.log(`   Total de pagos: ${item.totalPayments}`);
      console.log(`   Monto por pago: $${item.amount.toLocaleString('es-CL')} CLP`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Proceso completado exitosamente');
    console.log('='.repeat(80) + '\n');

    // Generar reporte detallado
    const reportContent = generateReport(summary, totalPaymentsCreated);
    const fs = require('fs');
    fs.writeFileSync('/home/ubuntu/historical_payments_report.md', reportContent);
    console.log('📄 Reporte guardado en: /home/ubuntu/historical_payments_report.md\n');

  } catch (error) {
    console.error('❌ Error al crear pagos históricos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generateReport(summary, totalPaymentsCreated) {
  const now = new Date().toISOString();
  let report = `# Reporte de Pagos Históricos Creados
## CRTLPyme - Generado el ${now}

---

### 📊 Resumen General

- **Total de pagos creados:** ${totalPaymentsCreated}
- **Suscripciones procesadas:** ${summary.length}
- **Período:** Desde fecha de inicio de cada suscripción hasta Noviembre 2025
- **Estado de pagos:** APPROVED (Completados)

---

### 📋 Detalle por Suscripción

`;

  summary.forEach((item, index) => {
    report += `
#### ${index + 1}. ${item.tenant}

| Campo | Valor |
|-------|-------|
| **Plan** | ${item.plan} |
| **Ciclo de Facturación** | ${item.billingCycle} |
| **Fecha de Inicio** | ${item.startDate} |
| **Pagos Creados** | ${item.paymentsCreated} |
| **Total de Pagos** | ${item.totalPayments} |
| **Monto por Pago** | $${item.amount.toLocaleString('es-CL')} CLP |

`;
  });

  report += `
---

### ✅ Proceso Completado

Todos los clientes ahora tienen sus pagos históricos registrados desde su fecha de inicio hasta noviembre 2025.

**Características de los pagos creados:**
- Estado: APPROVED (Aprobados)
- Método de pago: WEBPAY
- Tipo de tarjeta: Visa
- Últimos 4 dígitos: 1234
- Cuotas: 1
- Código de autorización: AUTO-[random]
- Respuesta de transacción: Completa con todos los campos

**Validación:**
- Se verificó que no existan pagos duplicados para el mismo mes
- Se respetó la fecha de inicio de cada suscripción
- Se aplicaron descuentos vigentes cuando corresponde
- Se respetó el ciclo de facturación de cada suscripción (MONTHLY/QUARTERLY/ANNUAL)

---

*Reporte generado automáticamente por el script de creación de pagos históricos*
`;

  return report;
}

// Ejecutar
createHistoricalPayments()
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
