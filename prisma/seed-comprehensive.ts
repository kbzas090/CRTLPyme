/**
 * Script de seed comprehensivo para CRTLPyme SaaS
 * 
 * Este script crea un conjunto completo de datos de prueba:
 * - Administradores de plataforma (SaaS admins)
 * - Planes de suscripción
 * - 5 Tenants (clientes del SaaS) con diferentes industrias
 * - Usuarios con diferentes roles para cada tenant
 * - Catálogo de productos maestros
 * - Inventario específico de cada tenant
 * - Datos históricos de ventas (últimos 3 meses)
 * - Sesiones de caja
 * - Suscripciones activas
 * - Gastos fijos
 */

import { PrismaClient, UserRole, PlanType, PaymentMethod, BillingCycle, SubscriptionStatus, AdminRole, AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Función para hashear contraseñas
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Función para generar fecha aleatoria en los últimos N días
function randomDateInLastDays(days: number): Date {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * days);
  const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  return date;
}

// Función para generar hora de negocio (9 AM - 8 PM)
function randomBusinessHour(): Date {
  const date = randomDateInLastDays(90); // últimos 90 días
  const hour = 9 + Math.floor(Math.random() * 11); // 9 AM - 8 PM
  const minute = Math.floor(Math.random() * 60);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  console.log('🚀 Iniciando seed comprehensivo de CRTLPyme...\n');

  // ========================================
  // 1. CREAR ADMINISTRADORES DE PLATAFORMA
  // ========================================
  console.log('👑 Creando administradores de plataforma...');
  
  const superAdmin = await prisma.platformAdmin.upsert({
    where: { email: 'superadmin@crtlpyme.cl' },
    update: {},
    create: {
      email: 'superadmin@crtlpyme.cl',
      passwordHash: await hashPassword('SuperAdmin2025!'),
      firstName: 'Roberto',
      lastName: 'Administrador',
      phone: '+56912345678',
      role: 'SUPER_ADMIN',
      isActive: true,
      lastLoginAt: new Date(),
    },
  });

  const supportAdmin = await prisma.platformAdmin.upsert({
    where: { email: 'soporte@crtlpyme.cl' },
    update: {},
    create: {
      email: 'soporte@crtlpyme.cl',
      passwordHash: await hashPassword('Soporte2025!'),
      firstName: 'María',
      lastName: 'Soporte',
      phone: '+56923456789',
      role: 'SUPPORT',
      isActive: true,
      lastLoginAt: new Date(),
    },
  });

  const billingAdmin = await prisma.platformAdmin.upsert({
    where: { email: 'facturacion@crtlpyme.cl' },
    update: {},
    create: {
      email: 'facturacion@crtlpyme.cl',
      passwordHash: await hashPassword('Billing2025!'),
      firstName: 'Carlos',
      lastName: 'Finanzas',
      phone: '+56934567890',
      role: 'BILLING_ADMIN',
      isActive: true,
      lastLoginAt: new Date(),
    },
  });

  console.log(`✅ ${3} administradores de plataforma creados\n`);

  // ========================================
  // 2. CREAR PLANES DE SUSCRIPCIÓN
  // ========================================
  console.log('💳 Creando planes de suscripción...');

  const subscriptionPlans = [
    {
      name: 'Plan Básico',
      description: 'Ideal para pequeños negocios',
      price: 19990,
      billingCycle: 'MONTHLY' as BillingCycle,
      trialDays: 14,
      features: ['3 Usuarios', '500 Productos', 'Ventas ilimitadas', '2 Cajas registradoras'],
      maxUsers: 3,
      maxProducts: 500,
      maxSales: null,
    },
    {
      name: 'Plan Profesional',
      description: 'Para negocios en crecimiento',
      price: 39990,
      billingCycle: 'MONTHLY' as BillingCycle,
      trialDays: 14,
      features: ['10 Usuarios', '2000 Productos', 'Ventas ilimitadas', '5 Cajas registradoras'],
      maxUsers: 10,
      maxProducts: 2000,
      maxSales: null,
    },
    {
      name: 'Plan Empresarial',
      description: 'Para grandes empresas',
      price: 79990,
      billingCycle: 'MONTHLY' as BillingCycle,
      trialDays: 30,
      features: ['Usuarios ilimitados', 'Productos ilimitados', 'Ventas ilimitadas', 'Cajas ilimitadas'],
      maxUsers: null,
      maxProducts: null,
      maxSales: null,
    },
  ];

  const createdPlans = [];
  for (const plan of subscriptionPlans) {
    const createdPlan = await prisma.subscriptionPlan.upsert({
      where: { 
        name_billingCycle: {
          name: plan.name,
          billingCycle: plan.billingCycle
        }
      },
      update: {},
      create: {
        name: plan.name,
        description: plan.description,
        price: plan.price.toString(),
        billingCycle: plan.billingCycle,
        trialDays: plan.trialDays,
        isVisible: true,
        sortOrder: subscriptionPlans.indexOf(plan) + 1,
        features: JSON.stringify(plan.features),
        maxUsers: plan.maxUsers,
        maxProducts: plan.maxProducts,
        maxSales: plan.maxSales,
        isActive: true,
      },
    });
    createdPlans.push(createdPlan);
  }

  console.log(`✅ ${createdPlans.length} planes de suscripción creados\n`);

  // ========================================
  // 3. CREAR CATÁLOGO MAESTRO DE PRODUCTOS
  // ========================================
  console.log('📦 Creando catálogo maestro de productos...');

  const masterProducts = [
    // Abarrotes
    { sku: 'MP-001', barcode: '7800001000001', name: 'Arroz Grado 1 1kg', category: 'Abarrotes', brand: 'Tucapel', suggestedPrice: 900 },
    { sku: 'MP-002', barcode: '7800001000002', name: 'Fideos Spaghetti 400g', category: 'Abarrotes', brand: 'Carozzi', suggestedPrice: 800 },
    { sku: 'MP-003', barcode: '7800001000003', name: 'Azúcar Granulada 1kg', category: 'Abarrotes', brand: 'Iansagro', suggestedPrice: 1100 },
    { sku: 'MP-004', barcode: '7800001000004', name: 'Aceite Vegetal 900ml', category: 'Abarrotes', brand: 'Chef', suggestedPrice: 1800 },
    { sku: 'MP-005', barcode: '7800001000005', name: 'Harina Blanca 1kg', category: 'Abarrotes', brand: 'Selecta', suggestedPrice: 700 },
    
    // Bebidas
    { sku: 'MP-010', barcode: '7800001000010', name: 'Coca-Cola 1.5L', category: 'Bebidas', brand: 'Coca-Cola', suggestedPrice: 1200 },
    { sku: 'MP-011', barcode: '7800001000011', name: 'Jugo Naranja 1L', category: 'Bebidas', brand: 'Watts', suggestedPrice: 1500 },
    { sku: 'MP-012', barcode: '7800001000012', name: 'Agua Mineral 1.5L', category: 'Bebidas', brand: 'Cachantún', suggestedPrice: 600 },
    { sku: 'MP-013', barcode: '7800001000013', name: 'Cerveza Lata 350ml', category: 'Bebidas', brand: 'Cristal', suggestedPrice: 800 },
    
    // Lácteos
    { sku: 'MP-020', barcode: '7800001000020', name: 'Leche Entera 1L', category: 'Lácteos', brand: 'Colun', suggestedPrice: 1000 },
    { sku: 'MP-021', barcode: '7800001000021', name: 'Yogurt Natural 1L', category: 'Lácteos', brand: 'Soprole', suggestedPrice: 1300 },
    { sku: 'MP-022', barcode: '7800001000022', name: 'Queso Mantecoso 500g', category: 'Lácteos', brand: 'Surlat', suggestedPrice: 2500 },
    { sku: 'MP-023', barcode: '7800001000023', name: 'Huevos Rojos x12', category: 'Lácteos', brand: 'Santa Rosa', suggestedPrice: 2200 },
    
    // Panadería
    { sku: 'MP-030', barcode: '7800001000030', name: 'Pan Hallulla', category: 'Panadería', brand: 'Ideal', suggestedPrice: 500 },
    { sku: 'MP-031', barcode: '7800001000031', name: 'Pan Molde Integral', category: 'Panadería', brand: 'Ideal', suggestedPrice: 1800 },
    
    // Limpieza
    { sku: 'MP-040', barcode: '7800001000040', name: 'Detergente Polvo 1kg', category: 'Limpieza', brand: 'Omo', suggestedPrice: 2800 },
    { sku: 'MP-041', barcode: '7800001000041', name: 'Cloro 1L', category: 'Limpieza', brand: 'Clorox', suggestedPrice: 1200 },
    { sku: 'MP-042', barcode: '7800001000042', name: 'Lavaloza 500ml', category: 'Limpieza', brand: 'Quix', suggestedPrice: 1500 },
    
    // Higiene Personal
    { sku: 'MP-050', barcode: '7800001000050', name: 'Papel Higiénico x4', category: 'Higiene', brand: 'Elite', suggestedPrice: 2500 },
    { sku: 'MP-051', barcode: '7800001000051', name: 'Shampoo 400ml', category: 'Higiene', brand: 'Pantene', suggestedPrice: 2200 },
    { sku: 'MP-052', barcode: '7800001000052', name: 'Jabón en Barra', category: 'Higiene', brand: 'Protex', suggestedPrice: 800 },
    
    // Snacks
    { sku: 'MP-060', barcode: '7800001000060', name: 'Papas Fritas 150g', category: 'Snacks', brand: 'Lays', suggestedPrice: 1200 },
    { sku: 'MP-061', barcode: '7800001000061', name: 'Galletas Dulces 200g', category: 'Snacks', brand: 'McKay', suggestedPrice: 1300 },
    { sku: 'MP-062', barcode: '7800001000062', name: 'Chocolate 100g', category: 'Snacks', brand: 'Nestlé', suggestedPrice: 1100 },
    
    // Carnes y Cecinas
    { sku: 'MP-070', barcode: '7800001000070', name: 'Pollo Entero kg', category: 'Carnes', brand: 'Agrosuper', suggestedPrice: 3500 },
    { sku: 'MP-071', barcode: '7800001000071', name: 'Jamón kg', category: 'Cecinas', brand: 'PF', suggestedPrice: 4500 },
  ];

  const createdMasterProducts = [];
  for (const product of masterProducts) {
    const created = await prisma.masterProduct.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        category: product.category,
        brand: product.brand,
        suggestedPrice: product.suggestedPrice.toString(),
        unit: 'unidad',
        isActive: true,
      },
    });
    createdMasterProducts.push(created);
  }

  console.log(`✅ ${createdMasterProducts.length} productos maestros creados\n`);

  // ========================================
  // 4. CREAR TENANTS Y SUS DATOS
  // ========================================
  console.log('🏢 Creando tenants (clientes del SaaS)...\n');

  // TENANT 1: Minimarket Doña Rosa
  console.log('  📍 Tenant 1: Minimarket Doña Rosa');
  const tenant1 = await prisma.tenant.upsert({
    where: { rut: '76.543.210-1' },
    update: {},
    create: {
      businessName: 'Minimarket Doña Rosa',
      rut: '76.543.210-1',
      email: 'contacto@minimarketdonarosa.cl',
      phone: '+56945678901',
      address: 'Av. Providencia 1234, Santiago',
      isActive: true,
      planType: 'BASIC',
      maxCashiers: 2,
      extraCashiers: 0,
      accountStatus: 'ACTIVE',
      onboardingCompleted: true,
      lastActivityAt: new Date(),
      totalRevenue: '2500000',
      lifetimeMonths: 6,
    },
  });

  // Crear suscripción para tenant1
  await prisma.subscription.create({
    data: {
      tenantId: tenant1.id,
      planId: createdPlans[0].id, // Plan Básico
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 meses atrás
      billingCycle: 'MONTHLY',
      nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // en 7 días
      lastBillingDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), // hace 23 días
      autoRenew: true,
      trialDays: 0,
      lifetimeValue: '119940', // 6 meses * 19990
    },
  });

  // Usuarios de Minimarket Doña Rosa
  const t1Admin = await prisma.user.create({
    data: {
      email: 'admin@minimarketdonarosa.cl',
      password: await hashPassword('Admin123!'),
      firstName: 'Rosa',
      lastName: 'Pérez',
      role: 'ADMIN',
      isActive: true,
      tenantId: tenant1.id,
    },
  });

  const t1Cashier1 = await prisma.user.create({
    data: {
      email: 'caja1@minimarketdonarosa.cl',
      password: await hashPassword('Caja123!'),
      firstName: 'Carmen',
      lastName: 'Silva',
      role: 'CAJA',
      isActive: true,
      tenantId: tenant1.id,
    },
  });

  const t1Cashier2 = await prisma.user.create({
    data: {
      email: 'caja2@minimarketdonarosa.cl',
      password: await hashPassword('Caja123!'),
      firstName: 'Juan',
      lastName: 'González',
      role: 'CAJA',
      isActive: true,
      tenantId: tenant1.id,
    },
  });

  // Inventario de Minimarket Doña Rosa (productos de abarrotes, bebidas, lácteos)
  const t1ProductSelection = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23];
  const t1Inventory = [];
  for (const idx of t1ProductSelection) {
    const mp = createdMasterProducts[idx];
    const inventory = await prisma.tenantInventory.create({
      data: {
        tenantId: tenant1.id,
        masterProductId: mp.id,
        costPrice: (parseFloat(mp.suggestedPrice) * 0.65).toFixed(0),
        salePrice: mp.suggestedPrice,
        stock: Math.floor(Math.random() * 50) + 20,
        minStock: 10,
        isActive: true,
      },
    });
    t1Inventory.push(inventory);
  }

  // Gastos fijos de tenant1
  await prisma.fixedExpense.createMany({
    data: [
      { name: 'Arriendo Local', amount: '450000', frequency: 'MONTHLY', tenantId: tenant1.id },
      { name: 'Servicios Básicos', amount: '80000', frequency: 'MONTHLY', tenantId: tenant1.id },
      { name: 'Sueldos Personal', amount: '1200000', frequency: 'MONTHLY', tenantId: tenant1.id },
    ],
  });

  console.log(`    ✅ 3 usuarios, ${t1Inventory.length} productos en inventario, 3 gastos fijos\n`);

  // TENANT 2: Librería El Lápiz Mágico
  console.log('  📍 Tenant 2: Librería El Lápiz Mágico');
  const tenant2 = await prisma.tenant.upsert({
    where: { rut: '77.654.321-2' },
    update: {},
    create: {
      businessName: 'Librería El Lápiz Mágico',
      rut: '77.654.321-2',
      email: 'contacto@librerialapizmagico.cl',
      phone: '+56956789012',
      address: 'Calle Arturo Prat 456, Valparaíso',
      isActive: true,
      planType: 'PRO',
      maxCashiers: 3,
      extraCashiers: 1,
      accountStatus: 'ACTIVE',
      onboardingCompleted: true,
      lastActivityAt: new Date(),
      totalRevenue: '4800000',
      lifetimeMonths: 12,
    },
  });

  await prisma.subscription.create({
    data: {
      tenantId: tenant2.id,
      planId: createdPlans[1].id, // Plan Profesional
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000), // 12 meses atrás
      billingCycle: 'MONTHLY',
      nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      lastBillingDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      lifetimeValue: '479880', // 12 meses * 39990
    },
  });

  const t2Admin = await prisma.user.create({
    data: {
      email: 'admin@librerialapizmagico.cl',
      password: await hashPassword('Admin123!'),
      firstName: 'Patricia',
      lastName: 'Morales',
      role: 'ADMIN',
      isActive: true,
      tenantId: tenant2.id,
    },
  });

  const t2Cashier = await prisma.user.create({
    data: {
      email: 'caja@librerialapizmagico.cl',
      password: await hashPassword('Caja123!'),
      firstName: 'Andrea',
      lastName: 'Rojas',
      role: 'CAJA',
      isActive: true,
      tenantId: tenant2.id,
    },
  });

  const t2Inventory = await prisma.user.create({
    data: {
      email: 'inventario@librerialapizmagico.cl',
      password: await hashPassword('Inv123!'),
      firstName: 'Luis',
      lastName: 'Fernández',
      role: 'INVENTARIO',
      isActive: true,
      tenantId: tenant2.id,
    },
  });

  // Productos de librería (crear productos maestros adicionales)
  const libreriaProducts = [
    { sku: 'MP-100', barcode: '7800002000001', name: 'Cuaderno Universitario 100 hojas', category: 'Escolares', brand: 'Torre', suggestedPrice: 1400 },
    { sku: 'MP-101', barcode: '7800002000002', name: 'Lápiz Grafito HB x12', category: 'Escritura', brand: 'Faber-Castell', suggestedPrice: 2400 },
    { sku: 'MP-102', barcode: '7800002000003', name: 'Goma de Borrar', category: 'Corrección', brand: 'Staedtler', suggestedPrice: 400 },
    { sku: 'MP-103', barcode: '7800002000004', name: 'Tijera Escolar', category: 'Escolares', brand: 'Maped', suggestedPrice: 1800 },
    { sku: 'MP-104', barcode: '7800002000005', name: 'Pegamento en Barra', category: 'Adhesivos', brand: 'UHU', suggestedPrice: 1300 },
    { sku: 'MP-105', barcode: '7800002000006', name: 'Marcadores x12', category: 'Arte', brand: 'BIC', suggestedPrice: 4000 },
    { sku: 'MP-106', barcode: '7800002000007', name: 'Carpeta Cartón', category: 'Archivadores', brand: 'Rhein', suggestedPrice: 1100 },
    { sku: 'MP-107', barcode: '7800002000008', name: 'Resma Papel 500 hojas', category: 'Papelería', brand: 'Chamex', suggestedPrice: 4800 },
  ];

  const t2MasterProducts = [];
  for (const product of libreriaProducts) {
    const created = await prisma.masterProduct.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        category: product.category,
        brand: product.brand,
        suggestedPrice: product.suggestedPrice.toString(),
        unit: 'unidad',
        isActive: true,
      },
    });
    t2MasterProducts.push(created);
  }

  const t2InventoryItems = [];
  for (const mp of t2MasterProducts) {
    const inventory = await prisma.tenantInventory.create({
      data: {
        tenantId: tenant2.id,
        masterProductId: mp.id,
        costPrice: (parseFloat(mp.suggestedPrice) * 0.60).toFixed(0),
        salePrice: mp.suggestedPrice,
        stock: Math.floor(Math.random() * 80) + 30,
        minStock: 15,
        isActive: true,
      },
    });
    t2InventoryItems.push(inventory);
  }

  await prisma.fixedExpense.createMany({
    data: [
      { name: 'Arriendo Local', amount: '650000', frequency: 'MONTHLY', tenantId: tenant2.id },
      { name: 'Servicios Básicos', amount: '120000', frequency: 'MONTHLY', tenantId: tenant2.id },
      { name: 'Sueldos Personal', amount: '2000000', frequency: 'MONTHLY', tenantId: tenant2.id },
      { name: 'Internet y Teléfono', amount: '45000', frequency: 'MONTHLY', tenantId: tenant2.id },
    ],
  });

  console.log(`    ✅ 3 usuarios, ${t2InventoryItems.length} productos en inventario, 4 gastos fijos\n`);

  // TENANT 3: Ferretería El Martillo
  console.log('  📍 Tenant 3: Ferretería El Martillo');
  const tenant3 = await prisma.tenant.upsert({
    where: { rut: '78.765.432-3' },
    update: {},
    create: {
      businessName: 'Ferretería El Martillo',
      rut: '78.765.432-3',
      email: 'contacto@ferreteriaelmartillo.cl',
      phone: '+56967890123',
      address: 'Av. Industrial 789, Concepción',
      isActive: true,
      planType: 'PRO',
      maxCashiers: 3,
      extraCashiers: 1,
      accountStatus: 'ACTIVE',
      onboardingCompleted: true,
      lastActivityAt: new Date(),
      totalRevenue: '6200000',
      lifetimeMonths: 9,
    },
  });

  await prisma.subscription.create({
    data: {
      tenantId: tenant3.id,
      planId: createdPlans[1].id, // Plan Profesional
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000), // 9 meses atrás
      billingCycle: 'MONTHLY',
      nextBillingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      lastBillingDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      lifetimeValue: '359910', // 9 meses * 39990
    },
  });

  const t3Admin = await prisma.user.create({
    data: {
      email: 'admin@ferreteriaelmartillo.cl',
      password: await hashPassword('Admin123!'),
      firstName: 'Roberto',
      lastName: 'Castro',
      role: 'ADMIN',
      isActive: true,
      tenantId: tenant3.id,
    },
  });

  const t3Cashier = await prisma.user.create({
    data: {
      email: 'caja@ferreteriaelmartillo.cl',
      password: await hashPassword('Caja123!'),
      firstName: 'Marcela',
      lastName: 'Vargas',
      role: 'CAJA',
      isActive: true,
      tenantId: tenant3.id,
    },
  });

  const t3Inventory = await prisma.user.create({
    data: {
      email: 'inventario@ferreteriaelmartillo.cl',
      password: await hashPassword('Inv123!'),
      firstName: 'Diego',
      lastName: 'Muñoz',
      role: 'INVENTARIO',
      isActive: true,
      tenantId: tenant3.id,
    },
  });

  // Productos de ferretería
  const ferreteriaProducts = [
    { sku: 'MP-200', barcode: '7800003000001', name: 'Martillo Carpintero 500g', category: 'Herramientas', brand: 'Stanley', suggestedPrice: 7500 },
    { sku: 'MP-201', barcode: '7800003000002', name: 'Destornillador Plano', category: 'Herramientas', brand: 'Truper', suggestedPrice: 2500 },
    { sku: 'MP-202', barcode: '7800003000003', name: 'Tornillos Madera x100', category: 'Fijación', brand: 'Hilti', suggestedPrice: 3200 },
    { sku: 'MP-203', barcode: '7800003000004', name: 'Pintura Látex Blanco 1L', category: 'Pinturas', brand: 'Ceresita', suggestedPrice: 6800 },
    { sku: 'MP-204', barcode: '7800003000005', name: 'Brocha 3"', category: 'Pinturas', brand: 'Condor', suggestedPrice: 2000 },
    { sku: 'MP-205', barcode: '7800003000006', name: 'Cerradura Embutir', category: 'Cerrajería', brand: 'Phillips', suggestedPrice: 12000 },
    { sku: 'MP-206', barcode: '7800003000007', name: 'Candado 40mm', category: 'Cerrajería', brand: 'Master Lock', suggestedPrice: 5500 },
    { sku: 'MP-207', barcode: '7800003000008', name: 'Taladro Eléctrico', category: 'Herramientas Eléctricas', brand: 'Bosch', suggestedPrice: 45000 },
  ];

  const t3MasterProducts = [];
  for (const product of ferreteriaProducts) {
    const created = await prisma.masterProduct.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        category: product.category,
        brand: product.brand,
        suggestedPrice: product.suggestedPrice.toString(),
        unit: 'unidad',
        isActive: true,
      },
    });
    t3MasterProducts.push(created);
  }

  const t3InventoryItems = [];
  for (const mp of t3MasterProducts) {
    const inventory = await prisma.tenantInventory.create({
      data: {
        tenantId: tenant3.id,
        masterProductId: mp.id,
        costPrice: (parseFloat(mp.suggestedPrice) * 0.55).toFixed(0),
        salePrice: mp.suggestedPrice,
        stock: Math.floor(Math.random() * 40) + 10,
        minStock: 5,
        isActive: true,
      },
    });
    t3InventoryItems.push(inventory);
  }

  await prisma.fixedExpense.createMany({
    data: [
      { name: 'Arriendo Local', amount: '800000', frequency: 'MONTHLY', tenantId: tenant3.id },
      { name: 'Servicios Básicos', amount: '150000', frequency: 'MONTHLY', tenantId: tenant3.id },
      { name: 'Sueldos Personal', amount: '2500000', frequency: 'MONTHLY', tenantId: tenant3.id },
    ],
  });

  console.log(`    ✅ 3 usuarios, ${t3InventoryItems.length} productos en inventario, 3 gastos fijos\n`);

  // TENANT 4: Almacén Don Pepe
  console.log('  📍 Tenant 4: Almacén Don Pepe');
  const tenant4 = await prisma.tenant.upsert({
    where: { rut: '79.876.543-4' },
    update: {},
    create: {
      businessName: 'Almacén Don Pepe',
      rut: '79.876.543-4',
      email: 'contacto@almacendonpepe.cl',
      phone: '+56978901234',
      address: 'Pasaje Los Boldos 234, Temuco',
      isActive: true,
      planType: 'BASIC',
      maxCashiers: 2,
      extraCashiers: 0,
      accountStatus: 'ACTIVE',
      onboardingCompleted: true,
      lastActivityAt: new Date(),
      totalRevenue: '1800000',
      lifetimeMonths: 4,
    },
  });

  await prisma.subscription.create({
    data: {
      tenantId: tenant4.id,
      planId: createdPlans[0].id, // Plan Básico
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 4 meses atrás
      billingCycle: 'MONTHLY',
      nextBillingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      lastBillingDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      lifetimeValue: '79960', // 4 meses * 19990
    },
  });

  const t4Admin = await prisma.user.create({
    data: {
      email: 'admin@almacendonpepe.cl',
      password: await hashPassword('Admin123!'),
      firstName: 'José',
      lastName: 'Ramírez',
      role: 'ADMIN',
      isActive: true,
      tenantId: tenant4.id,
    },
  });

  const t4Cashier = await prisma.user.create({
    data: {
      email: 'caja@almacendonpepe.cl',
      password: await hashPassword('Caja123!'),
      firstName: 'Elena',
      lastName: 'Torres',
      role: 'CAJA',
      isActive: true,
      tenantId: tenant4.id,
    },
  });

  // Inventario de almacén (productos de abarrotes, bebidas, snacks)
  const t4ProductSelection = [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 13, 20, 21, 22, 23];
  const t4InventoryItems = [];
  for (const idx of t4ProductSelection) {
    const mp = createdMasterProducts[idx];
    const inventory = await prisma.tenantInventory.create({
      data: {
        tenantId: tenant4.id,
        masterProductId: mp.id,
        costPrice: (parseFloat(mp.suggestedPrice) * 0.68).toFixed(0),
        salePrice: mp.suggestedPrice,
        stock: Math.floor(Math.random() * 40) + 15,
        minStock: 8,
        isActive: true,
      },
    });
    t4InventoryItems.push(inventory);
  }

  await prisma.fixedExpense.createMany({
    data: [
      { name: 'Arriendo Local', amount: '350000', frequency: 'MONTHLY', tenantId: tenant4.id },
      { name: 'Servicios Básicos', amount: '60000', frequency: 'MONTHLY', tenantId: tenant4.id },
      { name: 'Sueldos Personal', amount: '800000', frequency: 'MONTHLY', tenantId: tenant4.id },
    ],
  });

  console.log(`    ✅ 2 usuarios, ${t4InventoryItems.length} productos en inventario, 3 gastos fijos\n`);

  // TENANT 5: Farmacia Salud Total
  console.log('  📍 Tenant 5: Farmacia Salud Total');
  const tenant5 = await prisma.tenant.upsert({
    where: { rut: '80.987.654-5' },
    update: {},
    create: {
      businessName: 'Farmacia Salud Total',
      rut: '80.987.654-5',
      email: 'contacto@farmaciasaludtotal.cl',
      phone: '+56989012345',
      address: 'Av. Libertad 567, La Serena',
      isActive: true,
      planType: 'ENTERPRISE',
      maxCashiers: 5,
      extraCashiers: 2,
      accountStatus: 'ACTIVE',
      onboardingCompleted: true,
      lastActivityAt: new Date(),
      totalRevenue: '9600000',
      lifetimeMonths: 12,
    },
  });

  await prisma.subscription.create({
    data: {
      tenantId: tenant5.id,
      planId: createdPlans[2].id, // Plan Empresarial
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000), // 12 meses atrás
      billingCycle: 'MONTHLY',
      nextBillingDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      lastBillingDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      lifetimeValue: '959880', // 12 meses * 79990
    },
  });

  const t5Admin = await prisma.user.create({
    data: {
      email: 'admin@farmaciasaludtotal.cl',
      password: await hashPassword('Admin123!'),
      firstName: 'Carolina',
      lastName: 'Bravo',
      role: 'ADMIN',
      isActive: true,
      tenantId: tenant5.id,
    },
  });

  const t5Cashier1 = await prisma.user.create({
    data: {
      email: 'caja1@farmaciasaludtotal.cl',
      password: await hashPassword('Caja123!'),
      firstName: 'Daniela',
      lastName: 'Soto',
      role: 'CAJA',
      isActive: true,
      tenantId: tenant5.id,
    },
  });

  const t5Cashier2 = await prisma.user.create({
    data: {
      email: 'caja2@farmaciasaludtotal.cl',
      password: await hashPassword('Caja123!'),
      firstName: 'Manuel',
      lastName: 'Campos',
      role: 'CAJA',
      isActive: true,
      tenantId: tenant5.id,
    },
  });

  const t5Inventory = await prisma.user.create({
    data: {
      email: 'inventario@farmaciasaludtotal.cl',
      password: await hashPassword('Inv123!'),
      firstName: 'Sandra',
      lastName: 'López',
      role: 'INVENTARIO',
      isActive: true,
      tenantId: tenant5.id,
    },
  });

  // Productos de farmacia
  const farmaciaProducts = [
    { sku: 'MP-300', barcode: '7800004000001', name: 'Paracetamol 500mg x20', category: 'Medicamentos', brand: 'Genérico', suggestedPrice: 1200 },
    { sku: 'MP-301', barcode: '7800004000002', name: 'Ibuprofeno 400mg x20', category: 'Medicamentos', brand: 'Genérico', suggestedPrice: 1500 },
    { sku: 'MP-302', barcode: '7800004000003', name: 'Vitamina C 1g x30', category: 'Suplementos', brand: 'Redoxon', suggestedPrice: 5500 },
    { sku: 'MP-303', barcode: '7800004000004', name: 'Alcohol Gel 250ml', category: 'Higiene', brand: 'Salcobrand', suggestedPrice: 2800 },
    { sku: 'MP-304', barcode: '7800004000005', name: 'Termómetro Digital', category: 'Equipos', brand: 'Omron', suggestedPrice: 8900 },
    { sku: 'MP-305', barcode: '7800004000006', name: 'Mascarillas x50', category: 'Protección', brand: 'Protemax', suggestedPrice: 4500 },
    { sku: 'MP-306', barcode: '7800004000007', name: 'Guantes Latex x100', category: 'Protección', brand: 'Sempermed', suggestedPrice: 6800 },
    { sku: 'MP-307', barcode: '7800004000008', name: 'Curitas x50', category: 'Primeros Auxilios', brand: 'Band-Aid', suggestedPrice: 3200 },
  ];

  const t5MasterProducts = [];
  for (const product of farmaciaProducts) {
    const created = await prisma.masterProduct.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        category: product.category,
        brand: product.brand,
        suggestedPrice: product.suggestedPrice.toString(),
        unit: 'unidad',
        isActive: true,
      },
    });
    t5MasterProducts.push(created);
  }

  const t5InventoryItems = [];
  for (const mp of t5MasterProducts) {
    const inventory = await prisma.tenantInventory.create({
      data: {
        tenantId: tenant5.id,
        masterProductId: mp.id,
        costPrice: (parseFloat(mp.suggestedPrice) * 0.50).toFixed(0),
        salePrice: mp.suggestedPrice,
        stock: Math.floor(Math.random() * 100) + 50,
        minStock: 20,
        isActive: true,
      },
    });
    t5InventoryItems.push(inventory);
  }

  await prisma.fixedExpense.createMany({
    data: [
      { name: 'Arriendo Local', amount: '1200000', frequency: 'MONTHLY', tenantId: tenant5.id },
      { name: 'Servicios Básicos', amount: '200000', frequency: 'MONTHLY', tenantId: tenant5.id },
      { name: 'Sueldos Personal', amount: '4000000', frequency: 'MONTHLY', tenantId: tenant5.id },
      { name: 'Internet y Sistemas', amount: '80000', frequency: 'MONTHLY', tenantId: tenant5.id },
    ],
  });

  console.log(`    ✅ 4 usuarios, ${t5InventoryItems.length} productos en inventario, 4 gastos fijos\n`);

  // ========================================
  // 5. CREAR DATOS HISTÓRICOS DE VENTAS
  // ========================================
  console.log('💰 Generando datos históricos de ventas (últimos 90 días)...\n');

  // Función para crear ventas para un tenant
  async function createSalesForTenant(
    tenantId: string, 
    tenantInventory: any[], 
    users: any[], 
    numSales: number,
    tenantName: string
  ) {
    let saleNumber = 1;
    const salesCreated = [];

    for (let i = 0; i < numSales; i++) {
      const saleDate = randomBusinessHour();
      const cashier = users[Math.floor(Math.random() * users.length)];
      
      // Crear sesión de caja si no existe para ese día y usuario
      const sessionDate = new Date(saleDate);
      sessionDate.setHours(9, 0, 0, 0);
      
      let cashSession = await prisma.cashSession.findFirst({
        where: {
          tenantId,
          userId: cashier.id,
          openedAt: {
            gte: sessionDate,
            lt: new Date(sessionDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      if (!cashSession) {
        cashSession = await prisma.cashSession.create({
          data: {
            tenantId,
            userId: cashier.id,
            initialAmount: '50000',
            status: 'CLOSED',
            openedAt: sessionDate,
            closedAt: new Date(sessionDate.getTime() + 11 * 60 * 60 * 1000), // cerrada a las 8 PM
            finalAmount: (50000 + Math.random() * 200000).toFixed(0),
            expectedAmount: (50000 + Math.random() * 200000).toFixed(0),
            difference: (Math.random() * 2000 - 1000).toFixed(0),
          },
        });
      }

      // Crear venta con 1-5 items
      const numItems = Math.floor(Math.random() * 5) + 1;
      const saleItems = [];
      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        const inventory = tenantInventory[Math.floor(Math.random() * tenantInventory.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = parseFloat(inventory.salePrice);
        const unitCost = parseFloat(inventory.costPrice);
        const itemSubtotal = unitPrice * quantity;

        saleItems.push({
          tenantInventoryId: inventory.id,
          quantity,
          unitPrice: unitPrice.toString(),
          unitCost: unitCost.toString(),
          subtotal: itemSubtotal.toString(),
          tenantId,
        });

        subtotal += itemSubtotal;
      }

      const paymentMethods: PaymentMethod[] = ['CASH', 'DEBIT', 'CREDIT', 'TRANSFER'];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const cashReceived = paymentMethod === 'CASH' ? (subtotal + Math.random() * 10000).toFixed(0) : null;
      const change = cashReceived ? (parseFloat(cashReceived) - subtotal).toFixed(0) : null;

      const sale = await prisma.sale.create({
        data: {
          tenantId,
          userId: cashier.id,
          cashSessionId: cashSession.id,
          saleNumber: `${String(saleNumber).padStart(6, '0')}`,
          subtotal: subtotal.toString(),
          tax: '0',
          total: subtotal.toString(),
          paymentMethod,
          cashReceived,
          change,
          status: 'COMPLETED',
          createdAt: saleDate,
          updatedAt: saleDate,
          items: {
            create: saleItems,
          },
        },
      });

      salesCreated.push(sale);
      saleNumber++;
    }

    console.log(`    ✅ ${tenantName}: ${salesCreated.length} ventas creadas`);
    return salesCreated;
  }

  // Crear ventas para cada tenant
  await createSalesForTenant(tenant1.id, t1Inventory, [t1Cashier1, t1Cashier2], 150, 'Minimarket Doña Rosa');
  await createSalesForTenant(tenant2.id, t2InventoryItems, [t2Cashier], 120, 'Librería El Lápiz Mágico');
  await createSalesForTenant(tenant3.id, t3InventoryItems, [t3Cashier], 90, 'Ferretería El Martillo');
  await createSalesForTenant(tenant4.id, t4InventoryItems, [t4Cashier], 100, 'Almacén Don Pepe');
  await createSalesForTenant(tenant5.id, t5InventoryItems, [t5Cashier1, t5Cashier2], 200, 'Farmacia Salud Total');

  console.log('');

  // ========================================
  // RESUMEN FINAL
  // ========================================
  console.log('✨ ¡Seed comprehensivo completado exitosamente!\n');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
  console.log('📊 RESUMEN DE DATOS CREADOS:\n');
  
  console.log('👑 ADMINISTRADORES DE PLATAFORMA SAAS:');
  console.log('   📧 Email: superadmin@crtlpyme.cl');
  console.log('   🔑 Password: SuperAdmin2025!');
  console.log('   👤 Rol: SUPER_ADMIN (acceso total)\n');
  
  console.log('   📧 Email: soporte@crtlpyme.cl');
  console.log('   🔑 Password: Soporte2025!');
  console.log('   👤 Rol: SUPPORT (soporte técnico)\n');
  
  console.log('   📧 Email: facturacion@crtlpyme.cl');
  console.log('   🔑 Password: Billing2025!');
  console.log('   👤 Rol: BILLING_ADMIN (administración de pagos)\n');
  
  console.log('───────────────────────────────────────────────────────────────────────────\n');
  
  console.log('🏢 TENANTS (CLIENTES DEL SAAS):\n');
  
  console.log('1. 🏪 MINIMARKET DOÑA ROSA');
  console.log('   📧 Admin: admin@minimarketdonarosa.cl / Admin123!');
  console.log('   📧 Caja 1: caja1@minimarketdonarosa.cl / Caja123!');
  console.log('   📧 Caja 2: caja2@minimarketdonarosa.cl / Caja123!');
  console.log(`   📦 Productos: ${t1Inventory.length}`);
  console.log('   💰 Ventas: ~150 transacciones');
  console.log('   📋 Plan: Básico ($19,990/mes)');
  console.log('   🕐 Antigüedad: 6 meses\n');
  
  console.log('2. 📚 LIBRERÍA EL LÁPIZ MÁGICO');
  console.log('   📧 Admin: admin@librerialapizmagico.cl / Admin123!');
  console.log('   📧 Caja: caja@librerialapizmagico.cl / Caja123!');
  console.log('   📧 Inventario: inventario@librerialapizmagico.cl / Inv123!');
  console.log(`   📦 Productos: ${t2InventoryItems.length}`);
  console.log('   💰 Ventas: ~120 transacciones');
  console.log('   📋 Plan: Profesional ($39,990/mes)');
  console.log('   🕐 Antigüedad: 12 meses\n');
  
  console.log('3. 🔧 FERRETERÍA EL MARTILLO');
  console.log('   📧 Admin: admin@ferreteriaelmartillo.cl / Admin123!');
  console.log('   📧 Caja: caja@ferreteriaelmartillo.cl / Caja123!');
  console.log('   📧 Inventario: inventario@ferreteriaelmartillo.cl / Inv123!');
  console.log(`   📦 Productos: ${t3InventoryItems.length}`);
  console.log('   💰 Ventas: ~90 transacciones');
  console.log('   📋 Plan: Profesional ($39,990/mes)');
  console.log('   🕐 Antigüedad: 9 meses\n');
  
  console.log('4. 🏬 ALMACÉN DON PEPE');
  console.log('   📧 Admin: admin@almacendonpepe.cl / Admin123!');
  console.log('   📧 Caja: caja@almacendonpepe.cl / Caja123!');
  console.log(`   📦 Productos: ${t4InventoryItems.length}`);
  console.log('   💰 Ventas: ~100 transacciones');
  console.log('   📋 Plan: Básico ($19,990/mes)');
  console.log('   🕐 Antigüedad: 4 meses\n');
  
  console.log('5. 💊 FARMACIA SALUD TOTAL');
  console.log('   📧 Admin: admin@farmaciasaludtotal.cl / Admin123!');
  console.log('   📧 Caja 1: caja1@farmaciasaludtotal.cl / Caja123!');
  console.log('   📧 Caja 2: caja2@farmaciasaludtotal.cl / Caja123!');
  console.log('   📧 Inventario: inventario@farmaciasaludtotal.cl / Inv123!');
  console.log(`   📦 Productos: ${t5InventoryItems.length}`);
  console.log('   💰 Ventas: ~200 transacciones');
  console.log('   📋 Plan: Empresarial ($79,990/mes)');
  console.log('   🕐 Antigüedad: 12 meses\n');
  
  console.log('───────────────────────────────────────────────────────────────────────────\n');
  
  console.log('📈 ESTADÍSTICAS GENERALES:');
  const totalTenants = await prisma.tenant.count();
  const totalUsers = await prisma.user.count();
  const totalMasterProducts = await prisma.masterProduct.count();
  const totalSales = await prisma.sale.count();
  const totalSubscriptions = await prisma.subscription.count();
  
  console.log(`   🏢 Tenants: ${totalTenants}`);
  console.log(`   👥 Usuarios: ${totalUsers}`);
  console.log(`   📦 Productos Maestros: ${totalMasterProducts}`);
  console.log(`   💰 Ventas Totales: ${totalSales}`);
  console.log(`   💳 Suscripciones Activas: ${totalSubscriptions}`);
  
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('✅ Base de datos lista para pruebas completas del sistema CRTLPyme');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
