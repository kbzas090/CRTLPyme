import { PrismaClient, BillingCycle, SubscriptionStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface SubscriptionData {
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  billingCycle: BillingCycle;
  price: number;
  startDate: Date;
}

// Función para generar una fecha aleatoria entre X meses atrás
function randomPastDate(minMonthsAgo: number, maxMonthsAgo: number): Date {
  const now = new Date();
  const monthsAgo = Math.floor(Math.random() * (maxMonthsAgo - minMonthsAgo + 1)) + minMonthsAgo;
  const date = new Date(now);
  date.setMonth(date.getMonth() - monthsAgo);
  // Establecer al primer día del mes
  date.setDate(1);
  return date;
}

// Función para calcular la próxima fecha de facturación
function calculateNextBillingDate(startDate: Date, billingCycle: BillingCycle): Date {
  const now = new Date();
  const nextDate = new Date(startDate);
  
  if (billingCycle === 'MONTHLY') {
    // Avanzar mes por mes hasta pasar la fecha actual
    while (nextDate <= now) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
  } else if (billingCycle === 'ANNUAL') {
    // Avanzar año por año hasta pasar la fecha actual
    while (nextDate <= now) {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
  }
  
  return nextDate;
}

// Función para calcular el lifetime value
function calculateLifetimeValue(startDate: Date, price: number, billingCycle: BillingCycle): number {
  const now = new Date();
  const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + 
                     (now.getMonth() - startDate.getMonth());
  
  if (billingCycle === 'MONTHLY') {
    return price * Math.max(monthsDiff, 1);
  } else {
    const yearsDiff = Math.floor(monthsDiff / 12);
    return price * Math.max(yearsDiff, 1);
  }
}

// Función para generar pagos históricos
async function generateHistoricalPayments(
  subscriptionId: string,
  tenantId: string,
  startDate: Date,
  price: number,
  billingCycle: BillingCycle
): Promise<number> {
  const now = new Date();
  const payments = [];
  
  let currentDate = new Date(startDate);
  let paymentCount = 0;
  
  const cardTypes = ['Visa', 'Mastercard', 'American Express'];
  const cardLast4 = Math.floor(1000 + Math.random() * 9000).toString();
  const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
  
  if (billingCycle === 'MONTHLY') {
    // Generar un pago por cada mes hasta ahora
    while (currentDate <= now) {
      const buyOrder = `ORD${Date.now()}-${paymentCount}`;
      payments.push({
        subscriptionId,
        tenantId,
        amount: price,
        currency: 'CLP',
        transbankOrderId: `TBK${Math.random().toString(36).substring(7).toUpperCase()}`,
        transbankBuyOrder: buyOrder,
        status: 'APPROVED' as PaymentStatus,
        paymentMethod: Math.random() > 0.5 ? 'CREDIT' : 'DEBIT',
        paymentDate: new Date(currentDate),
        cardLast4: cardLast4,
        cardType: cardType,
        installments: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 1,
        transactionResponse: {
          responseCode: 0,
          authorizationCode: `AUTH${Math.random().toString(36).substring(7).toUpperCase()}`,
          cardNumber: `****${cardLast4}`
        }
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
      paymentCount++;
    }
  } else if (billingCycle === 'ANNUAL') {
    // Generar un pago por cada año hasta ahora
    while (currentDate <= now) {
      const buyOrder = `ORD${Date.now()}-${paymentCount}`;
      payments.push({
        subscriptionId,
        tenantId,
        amount: price,
        currency: 'CLP',
        transbankOrderId: `TBK${Math.random().toString(36).substring(7).toUpperCase()}`,
        transbankBuyOrder: buyOrder,
        status: 'APPROVED' as PaymentStatus,
        paymentMethod: Math.random() > 0.5 ? 'CREDIT' : 'DEBIT',
        paymentDate: new Date(currentDate),
        cardLast4: cardLast4,
        cardType: cardType,
        installments: Math.random() > 0.5 ? Math.floor(Math.random() * 6) + 1 : 1,
        transactionResponse: {
          responseCode: 0,
          authorizationCode: `AUTH${Math.random().toString(36).substring(7).toUpperCase()}`,
          cardNumber: `****${cardLast4}`
        }
      });
      
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      paymentCount++;
    }
  }
  
  // Insertar todos los pagos
  if (payments.length > 0) {
    await prisma.subscriptionPayment.createMany({
      data: payments
    });
  }
  
  return payments.length;
}

async function main() {
  console.log('🚀 Iniciando creación de suscripciones y pagos históricos...\n');
  
  // 1. Obtener todos los tenants
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      businessName: true,
      email: true,
    }
  });
  
  console.log(`✅ Encontrados ${tenants.length} tenants en la base de datos\n`);
  
  if (tenants.length === 0) {
    console.log('❌ No hay tenants en la base de datos. Abortando...');
    return;
  }
  
  // 2. Obtener todos los planes activos (excluyendo Gratuito)
  const allPlans = await prisma.subscriptionPlan.findMany({
    where: {
      isActive: true,
      price: { gt: 0 } // Solo planes de pago
    },
    orderBy: [
      { price: 'asc' },
      { billingCycle: 'asc' }
    ]
  });
  
  console.log(`✅ Encontrados ${allPlans.length} planes activos\n`);
  
  if (allPlans.length === 0) {
    console.log('❌ No hay planes activos en la base de datos. Abortando...');
    return;
  }
  
  // Separar planes por ciclo y tipo
  const monthlyBasico = allPlans.find(p => p.billingCycle === 'MONTHLY' && p.name.includes('Básico'));
  const annualBasico = allPlans.find(p => p.billingCycle === 'ANNUAL' && p.name.includes('Básico'));
  const monthlyPro = allPlans.find(p => p.billingCycle === 'MONTHLY' && p.name.includes('Pro'));
  const annualPro = allPlans.find(p => p.billingCycle === 'ANNUAL' && p.name.includes('Pro'));
  const monthlyEnterprise = allPlans.find(p => p.billingCycle === 'MONTHLY' && p.name.includes('Enterprise'));
  const annualEnterprise = allPlans.find(p => p.billingCycle === 'ANNUAL' && p.name.includes('Enterprise'));
  
  // 3. Definir distribución de planes
  // Total: 15 tenants
  // Distribución objetivo:
  // - Básico: 8 tenants (5 mensual, 3 anual) ≈ 53%
  // - Pro: 5 tenants (3 mensual, 2 anual) ≈ 33%
  // - Enterprise: 2 tenants (1 mensual, 1 anual) ≈ 13%
  
  const subscriptionsToCreate: SubscriptionData[] = [];
  let tenantIndex = 0;
  
  // Asignar planes Básico (8 tenants)
  const basicoCount = Math.min(8, tenants.length);
  const basicoMonthly = Math.floor(basicoCount * 0.625); // 5 mensuales
  const basicoAnnual = basicoCount - basicoMonthly; // 3 anuales
  
  // Básico Mensual
  for (let i = 0; i < basicoMonthly && tenantIndex < tenants.length && monthlyBasico; i++) {
    subscriptionsToCreate.push({
      tenantId: tenants[tenantIndex].id,
      tenantName: tenants[tenantIndex].businessName,
      planId: monthlyBasico.id,
      planName: monthlyBasico.name,
      billingCycle: 'MONTHLY',
      price: Number(monthlyBasico.price),
      startDate: randomPastDate(1, 6)
    });
    tenantIndex++;
  }
  
  // Básico Anual
  for (let i = 0; i < basicoAnnual && tenantIndex < tenants.length && annualBasico; i++) {
    subscriptionsToCreate.push({
      tenantId: tenants[tenantIndex].id,
      tenantName: tenants[tenantIndex].businessName,
      planId: annualBasico.id,
      planName: annualBasico.name,
      billingCycle: 'ANNUAL',
      price: Number(annualBasico.price),
      startDate: randomPastDate(1, 6)
    });
    tenantIndex++;
  }
  
  // Asignar planes Pro (5 tenants)
  const proCount = Math.min(5, tenants.length - tenantIndex);
  const proMonthly = Math.floor(proCount * 0.6); // 3 mensuales
  const proAnnual = proCount - proMonthly; // 2 anuales
  
  // Pro Mensual
  for (let i = 0; i < proMonthly && tenantIndex < tenants.length && monthlyPro; i++) {
    subscriptionsToCreate.push({
      tenantId: tenants[tenantIndex].id,
      tenantName: tenants[tenantIndex].businessName,
      planId: monthlyPro.id,
      planName: monthlyPro.name,
      billingCycle: 'MONTHLY',
      price: Number(monthlyPro.price),
      startDate: randomPastDate(1, 6)
    });
    tenantIndex++;
  }
  
  // Pro Anual
  for (let i = 0; i < proAnnual && tenantIndex < tenants.length && annualPro; i++) {
    subscriptionsToCreate.push({
      tenantId: tenants[tenantIndex].id,
      tenantName: tenants[tenantIndex].businessName,
      planId: annualPro.id,
      planName: annualPro.name,
      billingCycle: 'ANNUAL',
      price: Number(annualPro.price),
      startDate: randomPastDate(1, 6)
    });
    tenantIndex++;
  }
  
  // Asignar planes Enterprise (restantes)
  const enterpriseCount = tenants.length - tenantIndex;
  const enterpriseMonthly = Math.floor(enterpriseCount / 2);
  const enterpriseAnnual = enterpriseCount - enterpriseMonthly;
  
  // Enterprise Mensual
  for (let i = 0; i < enterpriseMonthly && tenantIndex < tenants.length && monthlyEnterprise; i++) {
    subscriptionsToCreate.push({
      tenantId: tenants[tenantIndex].id,
      tenantName: tenants[tenantIndex].businessName,
      planId: monthlyEnterprise.id,
      planName: monthlyEnterprise.name,
      billingCycle: 'MONTHLY',
      price: Number(monthlyEnterprise.price),
      startDate: randomPastDate(1, 6)
    });
    tenantIndex++;
  }
  
  // Enterprise Anual
  for (let i = 0; i < enterpriseAnnual && tenantIndex < tenants.length && annualEnterprise; i++) {
    subscriptionsToCreate.push({
      tenantId: tenants[tenantIndex].id,
      tenantName: tenants[tenantIndex].businessName,
      planId: annualEnterprise.id,
      planName: annualEnterprise.name,
      billingCycle: 'ANNUAL',
      price: Number(annualEnterprise.price),
      startDate: randomPastDate(1, 6)
    });
    tenantIndex++;
  }
  
  console.log(`📊 Distribución de suscripciones a crear: ${subscriptionsToCreate.length} total\n`);
  
  // 4. Crear suscripciones y pagos
  let totalPayments = 0;
  let totalRevenue = 0;
  const createdSubscriptions = [];
  
  for (const subData of subscriptionsToCreate) {
    const nextBillingDate = calculateNextBillingDate(subData.startDate, subData.billingCycle);
    const lifetimeValue = calculateLifetimeValue(subData.startDate, subData.price, subData.billingCycle);
    
    // Crear suscripción
    const subscription = await prisma.subscription.create({
      data: {
        tenantId: subData.tenantId,
        planId: subData.planId,
        status: 'ACTIVE',
        startDate: subData.startDate,
        billingCycle: subData.billingCycle,
        nextBillingDate: nextBillingDate,
        lastBillingDate: new Date(), // Última facturación = ahora (aproximado)
        autoRenew: true,
        lifetimeValue: lifetimeValue,
        trialDays: 0
      }
    });
    
    createdSubscriptions.push({
      tenant: subData.tenantName,
      plan: subData.planName,
      cycle: subData.billingCycle,
      startDate: subData.startDate,
      subscriptionId: subscription.id
    });
    
    // Generar pagos históricos
    const paymentsCreated = await generateHistoricalPayments(
      subscription.id,
      subData.tenantId,
      subData.startDate,
      subData.price,
      subData.billingCycle
    );
    
    totalPayments += paymentsCreated;
    totalRevenue += lifetimeValue;
    
    console.log(`✅ ${subData.tenantName}: ${subData.planName} (${subData.billingCycle}) - ${paymentsCreated} pagos`);
  }
  
  // 5. Calcular métricas finales
  const subscriptionsByPlan = await prisma.subscription.groupBy({
    by: ['planId'],
    _count: true
  });
  
  const subscriptionsByCycle = await prisma.subscription.groupBy({
    by: ['billingCycle'],
    _count: true
  });
  
  const planDetails = await Promise.all(
    subscriptionsByPlan.map(async (group) => {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: group.planId }
      });
      return {
        name: plan?.name || 'Desconocido',
        count: group._count
      };
    })
  );
  
  // Calcular MRR y ARR
  const monthlySubscriptions = await prisma.subscription.findMany({
    where: { billingCycle: 'MONTHLY' },
    include: { plan: true }
  });
  
  const annualSubscriptions = await prisma.subscription.findMany({
    where: { billingCycle: 'ANNUAL' },
    include: { plan: true }
  });
  
  const mrr = monthlySubscriptions.reduce((sum, sub) => sum + Number(sub.plan.price), 0);
  const arr = annualSubscriptions.reduce((sum, sub) => sum + Number(sub.plan.price), 0) + (mrr * 12);
  
  // 6. Generar reporte
  const report = `# 📊 Reporte de Suscripciones y Pagos Creados

## ✅ Resumen Ejecutivo

- **Total de Suscripciones Creadas:** ${subscriptionsToCreate.length}
- **Total de Pagos Históricos Generados:** ${totalPayments}
- **Revenue Total Acumulado:** $${totalRevenue.toLocaleString('es-CL')} CLP
- **MRR (Monthly Recurring Revenue):** $${mrr.toLocaleString('es-CL')} CLP
- **ARR (Annual Recurring Revenue):** $${arr.toLocaleString('es-CL')} CLP

## 📈 Distribución por Plan

${planDetails.map(p => `- **${p.name}:** ${p.count} suscripciones`).join('\n')}

## 📅 Distribución por Ciclo de Facturación

${subscriptionsByCycle.map(c => `- **${c.billingCycle}:** ${c._count} suscripciones`).join('\n')}

## 📋 Detalle de Suscripciones Creadas

| Tenant | Plan | Ciclo | Fecha Inicio | ID Suscripción |
|--------|------|-------|--------------|----------------|
${createdSubscriptions.map(s => 
  `| ${s.tenant} | ${s.plan} | ${s.cycle} | ${s.startDate.toISOString().split('T')[0]} | \`${s.subscriptionId.substring(0, 8)}...\` |`
).join('\n')}

## 🎯 Distribución Objetivo vs Real

### Objetivo:
- Básico: ~53% (8 tenants)
- Pro: ~33% (5 tenants)
- Enterprise: ~13% (2 tenants)

### Real:
${planDetails.map(p => {
  const percentage = ((p.count / subscriptionsToCreate.length) * 100).toFixed(1);
  return `- ${p.name}: ${percentage}% (${p.count} tenants)`;
}).join('\n')}

## 💰 Métricas de Revenue

- **Lifetime Value Promedio:** $${(totalRevenue / subscriptionsToCreate.length).toLocaleString('es-CL', { maximumFractionDigits: 0 })} CLP
- **Revenue Mensual Promedio:** $${(mrr).toLocaleString('es-CL')} CLP
- **Proyección Anual:** $${(arr).toLocaleString('es-CL')} CLP

## ✅ Estado del Sistema

- ✅ Todas las suscripciones están en estado **ACTIVE**
- ✅ Todas tienen **autoRenew** habilitado
- ✅ Todos los pagos están en estado **APPROVED**
- ✅ Fechas de inicio distribuidas entre 1-6 meses atrás
- ✅ Próximas fechas de facturación calculadas correctamente

## 🔍 Verificación Recomendada

Para verificar los datos en la aplicación:

1. **Landing Page:** Verifica que los 8 planes se muestren correctamente
2. **Admin Panel:** Accede a /admin-saas/subscriptions y verifica las ${subscriptionsToCreate.length} suscripciones
3. **Dashboard:** Revisa las métricas de MRR y ARR
4. **Pagos:** Verifica el historial de pagos de cada tenant

---

*Generado el ${new Date().toLocaleString('es-CL')}*
`;
  
  console.log('\n' + '='.repeat(80));
  console.log(report);
  console.log('='.repeat(80));
  
  // Guardar reporte
  const fs = require('fs');
  fs.writeFileSync('/home/ubuntu/SUSCRIPCIONES_CREADAS.md', report);
  console.log('\n✅ Reporte guardado en: /home/ubuntu/SUSCRIPCIONES_CREADAS.md');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
