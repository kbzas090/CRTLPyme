/**
 * Script de inicialización de datos multi-tenant para CRTLPyme
 * 
 * Este script crea:
 * - 4 tenants (negocios) diferentes
 * - 1 usuario Administrador SaaS (PROVEEDOR)
 * - Para cada tenant: 2-3 usuarios con diferentes roles
 * - Para cada tenant: 5-8 productos únicos apropiados para su tipo de negocio
 */

import { PrismaClient, UserRole, PlanType, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Función para hashear contraseñas
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async function main() {
  console.log('🚀 Iniciando seed de datos multi-tenant...\n');

  // ========================================
  // 1. CREAR USUARIO ADMINISTRADOR SAAS
  // ========================================
  console.log('👑 Creando usuario Administrador SaaS...');
  
  // Primero, crear un tenant especial para el administrador SaaS
  const adminTenant = await prisma.tenant.upsert({
    where: { rut: '99.999.999-9' },
    update: {},
    create: {
      businessName: 'CRTLPyme - Administración',
      rut: '99.999.999-9',
      email: 'admin@crtlpyme.cl',
      phone: '+56912345678',
      address: 'Santiago, Chile',
      isActive: true,
      planType: 'ENTERPRISE',
      maxCashiers: 999,
      extraCashiers: 0,
    },
  });

  const adminSaas = await prisma.user.upsert({
    where: { email: 'admin_saas@crtlpyme.cl' },
    update: {},
    create: {
      email: 'admin_saas@crtlpyme.cl',
      password: await hashPassword('Admin2025!'),
      firstName: 'Administrador',
      lastName: 'SaaS',
      role: 'PROVEEDOR',
      isActive: true,
      tenantId: adminTenant.id,
    },
  });

  console.log(`✅ Usuario Admin SaaS creado: ${adminSaas.email} / Admin2025!\n`);

  // ========================================
  // 2. CREAR TENANTS Y SUS DATOS
  // ========================================

  // TENANT 1: Minimarket Los Andes
  console.log('🏪 Creando Tenant 1: Minimarket Los Andes...');
  const tenant1 = await prisma.tenant.upsert({
    where: { rut: '76.543.210-1' },
    update: {},
    create: {
      businessName: 'Minimarket Los Andes',
      rut: '76.543.210-1',
      email: 'contacto@minimercadolosandes.cl',
      phone: '+56945678901',
      address: 'Av. Los Andes 234, Santiago',
      isActive: true,
      planType: 'BASIC',
      maxCashiers: 2,
      extraCashiers: 0,
    },
  });

  // Usuarios de Minimarket Los Andes
  const tenant1Admin = await prisma.user.create({
    data: {
      email: 'admin@minimercadolosandes.cl',
      password: await hashPassword('Admin123!'),
      firstName: 'Carlos',
      lastName: 'Muñoz',
      role: 'ADMIN',
      isActive: true,
      tenantId: tenant1.id,
    },
  });

  const tenant1Cashier = await prisma.user.create({
    data: {
      email: 'caja@minimercadolosandes.cl',
      password: await hashPassword('Caja123!'),
      firstName: 'María',
      lastName: 'González',
      role: 'CAJA',
      isActive: true,
      tenantId: tenant1.id,
    },
  });

  const tenant1Inventory = await prisma.user.create({
    data: {
      email: 'inventario@minimercadolosandes.cl',
      password: await hashPassword('Inv123!'),
      firstName: 'Pedro',
      lastName: 'Rojas',
      role: 'INVENTARIO',
      isActive: true,
      tenantId: tenant1.id,
    },
  });

  // Productos de Minimarket Los Andes
  const minimarketProducts = [
    { sku: 'MM-001', barcode: '7800123456789', name: 'Coca-Cola 1.5L', category: 'Bebidas', brand: 'Coca-Cola', costPrice: 800, salePrice: 1200, stock: 50 },
    { sku: 'MM-002', barcode: '7800234567890', name: 'Pan Hallulla', category: 'Panadería', brand: 'Ideal', costPrice: 300, salePrice: 500, stock: 100 },
    { sku: 'MM-003', barcode: '7800345678901', name: 'Leche Entera 1L', category: 'Lácteos', brand: 'Colun', costPrice: 700, salePrice: 1000, stock: 30 },
    { sku: 'MM-004', barcode: '7800456789012', name: 'Arroz Grado 1 1kg', category: 'Abarrotes', brand: 'Tucapel', costPrice: 600, salePrice: 900, stock: 40 },
    { sku: 'MM-005', barcode: '7800567890123', name: 'Aceite Vegetal 900ml', category: 'Abarrotes', brand: 'Chef', costPrice: 1200, salePrice: 1800, stock: 25 },
    { sku: 'MM-006', barcode: '7800678901234', name: 'Huevos Rojos x12', category: 'Lácteos', brand: 'Santa Isabel', costPrice: 1500, salePrice: 2200, stock: 20 },
    { sku: 'MM-007', barcode: '7800789012345', name: 'Detergente En Polvo 1kg', category: 'Limpieza', brand: 'Omo', costPrice: 2000, salePrice: 2800, stock: 15 },
    { sku: 'MM-008', barcode: '7800890123456', name: 'Papel Higiénico x4', category: 'Higiene', brand: 'Elite', costPrice: 1800, salePrice: 2500, stock: 35 },
  ];

  for (const product of minimarketProducts) {
    await prisma.product.create({
      data: {
        ...product,
        costPrice: product.costPrice.toString(),
        salePrice: product.salePrice.toString(),
        minStock: 5,
        isActive: true,
        tenantId: tenant1.id,
      },
    });
  }

  console.log(`✅ Tenant 1 creado con ${minimarketProducts.length} productos\n`);

  // TENANT 2: Ferretería El Tornillo
  console.log('🔧 Creando Tenant 2: Ferretería El Tornillo...');
  const tenant2 = await prisma.tenant.upsert({
    where: { rut: '77.654.321-2' },
    update: {},
    create: {
      businessName: 'Ferretería El Tornillo',
      rut: '77.654.321-2',
      email: 'contacto@ferreteriaeltornillo.cl',
      phone: '+56956789012',
      address: 'Calle Industrial 567, Valparaíso',
      isActive: true,
      planType: 'PRO',
      maxCashiers: 3,
      extraCashiers: 1,
    },
  });

  // Usuarios de Ferretería El Tornillo
  const tenant2Admin = await prisma.user.create({
    data: {
      email: 'admin@ferreteriaeltornillo.cl',
      password: await hashPassword('Admin123!'),
      firstName: 'Roberto',
      lastName: 'Fernández',
      role: 'ADMIN',
      isActive: true,
      tenantId: tenant2.id,
    },
  });

  const tenant2Cashier = await prisma.user.create({
    data: {
      email: 'caja@ferreteriaeltornillo.cl',
      password: await hashPassword('Caja123!'),
      firstName: 'Andrea',
      lastName: 'Silva',
      role: 'CAJA',
      isActive: true,
      tenantId: tenant2.id,
    },
  });

  const tenant2Inventory = await prisma.user.create({
    data: {
      email: 'inventario@ferreteriaeltornillo.cl',
      password: await hashPassword('Inv123!'),
      firstName: 'Luis',
      lastName: 'Morales',
      role: 'INVENTARIO',
      isActive: true,
      tenantId: tenant2.id,
    },
  });

  // Productos de Ferretería El Tornillo
  const ferreteriaProducts = [
    { sku: 'FE-001', barcode: '7801234567890', name: 'Martillo Carpintero 500g', category: 'Herramientas', brand: 'Stanley', costPrice: 5000, salePrice: 7500, stock: 20 },
    { sku: 'FE-002', barcode: '7802345678901', name: 'Destornillador Plano 6"', category: 'Herramientas', brand: 'Truper', costPrice: 1500, salePrice: 2500, stock: 35 },
    { sku: 'FE-003', barcode: '7803456789012', name: 'Tornillos Madera x100', category: 'Fijación', brand: 'Hilti', costPrice: 2000, salePrice: 3200, stock: 50 },
    { sku: 'FE-004', barcode: '7804567890123', name: 'Pintura Látex Blanco 1L', category: 'Pinturas', brand: 'Ceresita', costPrice: 4500, salePrice: 6800, stock: 15 },
    { sku: 'FE-005', barcode: '7805678901234', name: 'Brocha 3"', category: 'Pinturas', brand: 'Condor', costPrice: 1200, salePrice: 2000, stock: 25 },
    { sku: 'FE-006', barcode: '7806789012345', name: 'Cerradura Embutir', category: 'Cerrajería', brand: 'Phillips', costPrice: 8000, salePrice: 12000, stock: 10 },
    { sku: 'FE-007', barcode: '7807890123456', name: 'Candado 40mm', category: 'Cerrajería', brand: 'Master Lock', costPrice: 3500, salePrice: 5500, stock: 30 },
  ];

  for (const product of ferreteriaProducts) {
    await prisma.product.create({
      data: {
        ...product,
        costPrice: product.costPrice.toString(),
        salePrice: product.salePrice.toString(),
        minStock: 5,
        isActive: true,
        tenantId: tenant2.id,
      },
    });
  }

  console.log(`✅ Tenant 2 creado con ${ferreteriaProducts.length} productos\n`);

  // TENANT 3: Librería Papelito
  console.log('📚 Creando Tenant 3: Librería Papelito...');
  const tenant3 = await prisma.tenant.upsert({
    where: { rut: '78.765.432-3' },
    update: {},
    create: {
      businessName: 'Librería Papelito',
      rut: '78.765.432-3',
      email: 'contacto@libreriapapelito.cl',
      phone: '+56967890123',
      address: 'Av. Educación 890, Concepción',
      isActive: true,
      planType: 'BASIC',
      maxCashiers: 2,
      extraCashiers: 0,
    },
  });

  // Usuarios de Librería Papelito
  const tenant3Admin = await prisma.user.create({
    data: {
      email: 'admin@libreriapapelito.cl',
      password: await hashPassword('Admin123!'),
      firstName: 'Claudia',
      lastName: 'Vargas',
      role: 'ADMIN',
      isActive: true,
      tenantId: tenant3.id,
    },
  });

  const tenant3Cashier = await prisma.user.create({
    data: {
      email: 'caja@libreriapapelito.cl',
      password: await hashPassword('Caja123!'),
      firstName: 'Daniela',
      lastName: 'Torres',
      role: 'CAJA',
      isActive: true,
      tenantId: tenant3.id,
    },
  });

  // Productos de Librería Papelito
  const libreriaProducts = [
    { sku: 'LI-001', barcode: '7811234567890', name: 'Cuaderno Universitario 100 hojas', category: 'Escolares', brand: 'Torre', costPrice: 800, salePrice: 1400, stock: 100 },
    { sku: 'LI-002', barcode: '7812345678901', name: 'Lápiz Grafito HB x12', category: 'Escritura', brand: 'Faber-Castell', costPrice: 1500, salePrice: 2400, stock: 50 },
    { sku: 'LI-003', barcode: '7813456789012', name: 'Goma de Borrar Blanca', category: 'Corrección', brand: 'Staedtler', costPrice: 200, salePrice: 400, stock: 80 },
    { sku: 'LI-004', barcode: '7814567890123', name: 'Tijera Escolar 5"', category: 'Escolares', brand: 'Maped', costPrice: 1000, salePrice: 1800, stock: 40 },
    { sku: 'LI-005', barcode: '7815678901234', name: 'Pegamento en Barra 40g', category: 'Adhesivos', brand: 'UHU', costPrice: 800, salePrice: 1300, stock: 60 },
    { sku: 'LI-006', barcode: '7816789012345', name: 'Marcadores Colores x12', category: 'Arte', brand: 'BIC', costPrice: 2500, salePrice: 4000, stock: 30 },
    { sku: 'LI-007', barcode: '7817890123456', name: 'Carpeta Cartón Oficio', category: 'Archivadores', brand: 'Rhein', costPrice: 600, salePrice: 1100, stock: 45 },
    { sku: 'LI-008', barcode: '7818901234567', name: 'Resma Papel Carta 500 hojas', category: 'Papelería', brand: 'Chamex', costPrice: 3000, salePrice: 4800, stock: 25 },
  ];

  for (const product of libreriaProducts) {
    await prisma.product.create({
      data: {
        ...product,
        costPrice: product.costPrice.toString(),
        salePrice: product.salePrice.toString(),
        minStock: 5,
        isActive: true,
        tenantId: tenant3.id,
      },
    });
  }

  console.log(`✅ Tenant 3 creado con ${libreriaProducts.length} productos\n`);

  // TENANT 4: Almacén Don José
  console.log('🏬 Creando Tenant 4: Almacén Don José...');
  const tenant4 = await prisma.tenant.upsert({
    where: { rut: '79.876.543-4' },
    update: {},
    create: {
      businessName: 'Almacén Don José',
      rut: '79.876.543-4',
      email: 'contacto@almacendonjose.cl',
      phone: '+56978901234',
      address: 'Pasaje Los Almendros 123, Temuco',
      isActive: true,
      planType: 'BASIC',
      maxCashiers: 2,
      extraCashiers: 0,
    },
  });

  // Usuarios de Almacén Don José
  const tenant4Admin = await prisma.user.create({
    data: {
      email: 'admin@almacendonjose.cl',
      password: await hashPassword('Admin123!'),
      firstName: 'José',
      lastName: 'Sepúlveda',
      role: 'ADMIN',
      isActive: true,
      tenantId: tenant4.id,
    },
  });

  const tenant4Cashier = await prisma.user.create({
    data: {
      email: 'caja@almacendonjose.cl',
      password: await hashPassword('Caja123!'),
      firstName: 'Rosa',
      lastName: 'Contreras',
      role: 'CAJA',
      isActive: true,
      tenantId: tenant4.id,
    },
  });

  const tenant4Inventory = await prisma.user.create({
    data: {
      email: 'inventario@almacendonjose.cl',
      password: await hashPassword('Inv123!'),
      firstName: 'Miguel',
      lastName: 'Bravo',
      role: 'INVENTARIO',
      isActive: true,
      tenantId: tenant4.id,
    },
  });

  // Productos de Almacén Don José
  const almacenProducts = [
    { sku: 'AL-001', barcode: '7821234567890', name: 'Fideos Cabello de Ángel 400g', category: 'Abarrotes', brand: 'Carozzi', costPrice: 500, salePrice: 800, stock: 60 },
    { sku: 'AL-002', barcode: '7822345678901', name: 'Azúcar Granulada 1kg', category: 'Abarrotes', brand: 'Iansagro', costPrice: 700, salePrice: 1100, stock: 40 },
    { sku: 'AL-003', barcode: '7823456789012', name: 'Té en Bolsitas x100', category: 'Bebidas', brand: 'Suprême', costPrice: 1200, salePrice: 1900, stock: 35 },
    { sku: 'AL-004', barcode: '7824567890123', name: 'Café Instantáneo 170g', category: 'Bebidas', brand: 'Nescafé', costPrice: 2500, salePrice: 3800, stock: 20 },
    { sku: 'AL-005', barcode: '7825678901234', name: 'Galletas de Agua x200g', category: 'Snacks', brand: 'McKay', costPrice: 800, salePrice: 1300, stock: 50 },
    { sku: 'AL-006', barcode: '7826789012345', name: 'Mermelada de Frutilla 250g', category: 'Conservas', brand: 'Watts', costPrice: 1500, salePrice: 2300, stock: 25 },
  ];

  for (const product of almacenProducts) {
    await prisma.product.create({
      data: {
        ...product,
        costPrice: product.costPrice.toString(),
        salePrice: product.salePrice.toString(),
        minStock: 5,
        isActive: true,
        tenantId: tenant4.id,
      },
    });
  }

  console.log(`✅ Tenant 4 creado con ${almacenProducts.length} productos\n`);

  // ========================================
  // RESUMEN FINAL
  // ========================================
  console.log('\n✨ ¡Seed completado exitosamente!\n');
  console.log('📊 Resumen de datos creados:');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log('👑 ADMINISTRADOR SAAS:');
  console.log(`   Email: admin_saas@crtlpyme.cl`);
  console.log(`   Password: Admin2025!\n`);
  
  console.log('🏪 TENANT 1 - Minimarket Los Andes:');
  console.log(`   Admin: admin@minimercadolosandes.cl / Admin123!`);
  console.log(`   Caja: caja@minimercadolosandes.cl / Caja123!`);
  console.log(`   Inventario: inventario@minimercadolosandes.cl / Inv123!`);
  console.log(`   Productos: ${minimarketProducts.length}\n`);
  
  console.log('🔧 TENANT 2 - Ferretería El Tornillo:');
  console.log(`   Admin: admin@ferreteriaeltornillo.cl / Admin123!`);
  console.log(`   Caja: caja@ferreteriaeltornillo.cl / Caja123!`);
  console.log(`   Inventario: inventario@ferreteriaeltornillo.cl / Inv123!`);
  console.log(`   Productos: ${ferreteriaProducts.length}\n`);
  
  console.log('📚 TENANT 3 - Librería Papelito:');
  console.log(`   Admin: admin@libreriapapelito.cl / Admin123!`);
  console.log(`   Caja: caja@libreriapapelito.cl / Caja123!`);
  console.log(`   Productos: ${libreriaProducts.length}\n`);
  
  console.log('🏬 TENANT 4 - Almacén Don José:');
  console.log(`   Admin: admin@almacendonjose.cl / Admin123!`);
  console.log(`   Caja: caja@almacendonjose.cl / Caja123!`);
  console.log(`   Inventario: inventario@almacendonjose.cl / Inv123!`);
  console.log(`   Productos: ${almacenProducts.length}\n`);
  
  console.log('═══════════════════════════════════════════════════');
  console.log('✅ Base de datos lista para la demo multi-tenant\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
