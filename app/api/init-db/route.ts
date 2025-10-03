import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Secret temporal para inicialización
const TEMP_SECRET = 'init-crtlpyme-2025-temp-secret';

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    
    // Verificar secret
    if (secret !== TEMP_SECRET) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        received: secret ? 'secret provided' : 'no secret',
        expected: 'TEMP_SECRET'
      }, { status: 401 });
    }

    console.log('Iniciando seed de base de datos...');

    // Crear tenant
    const tenant = await prisma.tenant.upsert({
      where: { rut: '76.123.456-7' },
      update: {},
      create: {
        businessName: 'Demo Chile SpA',
        rut: '76.123.456-7',
        email: 'contacto@demochile.cl',
        phone: '+56912345678',
        address: 'Av. Providencia 1234, Santiago',
        isActive: true,
      },
    });

    console.log('Tenant creado:', tenant.id);

    // Crear usuario admin
    const hashedPassword = await hash('Demo123!', 10);
    const user = await prisma.user.upsert({
      where: { email: 'admin@demo.cl' },
      update: {},
      create: {
        email: 'admin@demo.cl',
        firstName: 'Administrador',
        lastName: 'Demo',
        password: hashedPassword,
        role: 'ADMIN',
        tenantId: tenant.id,
      },
    });

    console.log('Usuario admin creado:', user.id);

    // Cargar productos desde JSON
    const fs = require('fs');
    const path = require('path');
    const productosPath = path.join(process.cwd(), 'data', 'productos_chilenos.json');
    const productosData = JSON.parse(fs.readFileSync(productosPath, 'utf8'));

    let productosCreados = 0;
    for (const prod of productosData.productos_chilenos) {
      // Generar SKU único basado en el EAN13
      const sku = `SKU-${prod.ean13.slice(-6)}`;
      
      await prisma.product.upsert({
        where: { 
          sku_tenantId: {
            sku: sku,
            tenantId: tenant.id
          }
        },
        update: {},
        create: {
          name: prod.name,
          sku: sku,
          barcode: prod.ean13,
          description: `${prod.brand} - ${prod.subcategory}`,
          category: prod.category,
          price: prod.price_clp,
          cost: Math.round(prod.price_clp * 0.7), // Costo estimado 70% del precio
          stock: 50, // Stock inicial
          minStock: 10, // Stock mínimo
          unit: 'UNIDAD',
          tenantId: tenant.id,
        },
      });
      productosCreados++;
    }

    console.log(`${productosCreados} productos creados`);

    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada correctamente',
      data: {
        tenant: tenant.businessName,
        user: user.email,
        productos: productosCreados,
      },
    });

  } catch (error: any) {
    console.error('Error al inicializar DB:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
