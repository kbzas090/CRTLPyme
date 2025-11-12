# 📋 PLAN DETALLADO DE POBLADO DE DATOS - CRTLPYME
## Análisis Completo del Archivo seed-complete.ts

---

## 📊 RESUMEN EJECUTIVO

Este documento detalla el plan completo de poblado de datos para la plataforma CRTLPyme basado en el análisis del archivo `/home/ubuntu/CRTLPyme/prisma/seed-complete.ts`.

### Datos que se poblarán:
- ✅ **500 productos** en el catálogo maestro (desde productos_chile.json)
- ✅ **1 cuenta PROVEEDOR** (Super Admin de la plataforma)
- ✅ **13 negocios PyME** chilenos (tenants)
- ✅ **3 planes de suscripción** (Básico, Pro, Enterprise)
- ✅ **26-39 usuarios** (2-3 por negocio + admin)
- ✅ **650-2,600 productos en inventarios** (50-200 por negocio)
- ✅ **13 suscripciones activas** (1 por negocio)
- ✅ **650-3,900 ventas históricas** (50-300 por negocio, últimos 3 meses)
- ✅ **65-195 movimientos de inventario** (5-15 por negocio)

---

## 🔄 ORDEN DE EJECUCIÓN

El script ejecuta los pasos en el siguiente orden (según la función `main()`):

```
1. Limpiar base de datos (si se usa flag --clean)
2. Crear planes de suscripción
3. Importar productos del catálogo maestro
4. Crear usuario administrador de plataforma (PROVEEDOR)
5. Crear negocios (tenants)
6. Crear usuarios para negocios
7. Crear inventario
8. Crear suscripciones
9. Crear ventas históricas
10. Crear movimientos de inventario
```

---

## 📦 PASO 0 - PLANES DE SUSCRIPCIÓN (Prerequisito)

**Función:** `crearPlanesSuscripcion()`

### Planes que se crearán:

| Plan | Precio Mensual | Trial | Usuarios | Productos | Características |
|------|----------------|-------|----------|-----------|-----------------|
| **Plan Básico** | $9,990 CLP | 15 días | 2 | 500 | • 2 usuarios incluidos<br>• Hasta 500 productos<br>• Reportes básicos<br>• Soporte por email<br>• App móvil |
| **Plan Pro** | $19,990 CLP | 15 días | 5 | Ilimitados | • 5 usuarios incluidos<br>• Productos ilimitados<br>• Reportes avanzados<br>• Soporte prioritario<br>• App móvil<br>• Integración con Transbank |
| **Plan Enterprise** | $49,990 CLP | 30 días | Ilimitados | Ilimitados | • Usuarios ilimitados<br>• Productos ilimitados<br>• Reportes personalizados<br>• Soporte 24/7<br>• App móvil<br>• Integración con Transbank<br>• API personalizada<br>• Gestor de cuenta dedicado |

**Nota:** El script verifica si ya existen planes. Si existen, omite este paso.

---

## 📦 PASO 1 - MAESTRO DE PRODUCTOS

**Función:** `importarProductos(500)`

### Detalles:
- **Fuente:** `/home/ubuntu/productos_chile.json`
- **Cantidad:** 500 productos
- **Método:** Importación desde archivo JSON existente

### Estructura de cada producto:
```typescript
{
  sku: string                    // SKU único o EAN13
  barcode: string | null         // Código de barras EAN13
  name: string                   // Nombre del producto
  category: string               // Categoría (ej: "Abarrotes", "Bebidas")
  brand: string                  // Marca del producto
  suggestedPrice: number         // Precio sugerido de venta
  unit: "unidad"                 // Unidad de medida
  isActive: true                 // Estado del producto
}
```

### Características:
- Usa `upsert` para evitar duplicados (busca por SKU)
- Si el producto no tiene EAN13, genera un SKU único: `SKU-{timestamp}-{random}`
- Precio sugerido calculado: `precio_venta || precio_compra * 1.5`

### Ejemplo de productos esperados:
```
Coca-Cola 1.5L
Pan Hallulla
Leche Colun 1L
Arroz Tucapel 1kg
Aceite Ideal 900ml
... (495 productos más)
```

---

## 👨‍💼 PASO 2 - CUENTA PROVEEDOR (SUPER IMPORTANTE)

**Función:** `crearAdminPlataforma()`

### ⚠️ SUPER ADMINISTRADOR DE LA PLATAFORMA

Esta es la cuenta principal que administra TODA la plataforma SaaS.

### Datos del Tenant Plataforma:
```typescript
{
  businessName: "CRTLPyme - Plataforma"
  rut: "99.999.999-9"
  email: "plataforma@crtlpyme.com"
  phone: "+56900000000"
  address: "Santiago, Chile"
  isActive: true
  planType: ENTERPRISE
  accountStatus: ACTIVE
}
```

### 🔐 CREDENCIALES DEL PROVEEDOR:
```
Email:     admin@crtlpyme.com
Contraseña: Admin2025!
Rol:       PROVEEDOR (Super Admin)
Tenant:    CRTLPyme - Plataforma
```

### Permisos y Capacidades:
- ✅ Acceso total a todos los tenants
- ✅ Gestión de planes de suscripción
- ✅ Visualización de métricas globales
- ✅ Administración de la plataforma
- ✅ Acceso a todas las funcionalidades del sistema

---

## 🏢 PASO 3 - CLIENTES (TENANTS)

**Función:** `crearNegocios()`

### Se crearán 13 negocios PyME chilenos:

| # | Nombre del Negocio | RUT | Email | Teléfono | Dirección | Plan |
|---|-------------------|-----|-------|----------|-----------|------|
| 1 | **Minimarket Don Luis** | 76.123.456-7 | contacto@minimarketdonluis.cl | +56912345678 | Av. Providencia 1234, Providencia, Santiago | PRO |
| 2 | **Almacén El Rinconcito** | 76.234.567-8 | elrinconcito@gmail.com | +56923456789 | Calle Los Carrera 567, Maipú, Santiago | BASIC |
| 3 | **Supermercado Familiar** | 76.345.678-9 | info@superfamiliar.cl | +56934567890 | Av. Grecia 890, Ñuñoa, Santiago | PRO |
| 4 | **Tienda La Esquina** | 76.456.789-0 | laesquina@hotmail.com | +56945678901 | Pasaje Los Aromos 123, La Florida, Santiago | BASIC |
| 5 | **Abarrotes San José** | 76.567.890-1 | sanjose.abarrotes@gmail.com | +56956789012 | Av. Los Pajaritos 456, Estación Central, Santiago | BASIC |
| 6 | **Minimarket Express 24/7** | 76.678.901-2 | express247@gmail.com | +56967890123 | Av. Vicuña Mackenna 789, La Reina, Santiago | PRO |
| 7 | **Almacén Doña Rosa** | 76.789.012-3 | almacendonarosa@outlook.com | +56978901234 | Calle Santa Rosa 234, San Bernardo, Santiago | BASIC |
| 8 | **Supermercado Los Andes** | 76.890.123-4 | contacto@losandessupermarket.cl | +56989012345 | Av. Apoquindo 1567, Las Condes, Santiago | ENTERPRISE |
| 9 | **Tienda Don Pedro** | 76.901.234-5 | donpedro.tienda@gmail.com | +56990123456 | Calle O'Higgins 678, Puente Alto, Santiago | BASIC |
| 10 | **Minimarket Central** | 77.012.345-6 | minimarketcentral@yahoo.com | +56901234567 | Av. Libertador B. O'Higgins 2345, Santiago Centro | PRO |
| 11 | **Almacén El Buen Vecino** | 77.123.456-7 | buenvecino@gmail.com | +56912345670 | Pasaje Los Olivos 89, Quilicura, Santiago | BASIC |
| 12 | **Supermercado La Familia** | 77.234.567-8 | superfamilia@outlook.com | +56923456701 | Av. Pajaritos 3456, Maipú, Santiago | PRO |
| 13 | **Minimarket Nuevo Amanecer** | 77.345.678-9 | nuevoamanecer.mm@gmail.com | +56934567012 | Calle Los Cerezos 567, Cerrillos, Santiago | BASIC |

### Configuración por Plan:
- **BASIC**: 2 cajas máximas
- **PRO**: 5 cajas máximas
- **ENTERPRISE**: 10 cajas máximas

### Estado de todos los negocios:
- `isActive: true`
- `accountStatus: ACTIVE`
- `onboardingCompleted: true`

### Distribución de Planes:
- **BASIC**: 7 negocios (54%)
- **PRO**: 5 negocios (38%)
- **ENTERPRISE**: 1 negocio (8%)

---

## 👥 PASO 4 - USUARIOS POR CLIENTE

**Función:** `crearUsuariosNegocios(tenants)`

### Se crearán 2-3 usuarios por negocio:

### Roles disponibles:
- **ADMIN**: Administrador del negocio (1 por negocio)
- **CAJA**: Cajero/vendedor
- **INVENTARIO**: Encargado de inventario

### 🔐 CONTRASEÑA UNIVERSAL PARA TODOS LOS USUARIOS DE NEGOCIOS:
```
Contraseña: Demo2025!
```

### Estructura de usuarios por negocio:

#### Ejemplo: Minimarket Don Luis
```
1. admin@minimarketdonluis.cl
   - Rol: ADMIN
   - Nombre: [Aleatorio de lista chilena]
   - Contraseña: Demo2025!

2. [nombre]1@minimarketdonluis.cl
   - Rol: CAJA o INVENTARIO (aleatorio)
   - Nombre: [Aleatorio de lista chilena]
   - Contraseña: Demo2025!

3. [nombre]2@minimarketdonluis.cl (50% probabilidad)
   - Rol: CAJA o INVENTARIO (aleatorio)
   - Nombre: [Aleatorio de lista chilena]
   - Contraseña: Demo2025!
```

### Nombres chilenos usados (aleatorios):
**Nombres:** Juan, María, Pedro, Carmen, José, Ana, Luis, Patricia, Carlos, Rosa, Jorge, Isabel, Miguel, Claudia, Ricardo

**Apellidos:** González, Muñoz, Rojas, Díaz, Pérez, Soto, Contreras, Silva, Martínez, Sepúlveda, Morales, Rodríguez, López, Fuentes, Hernández

### Patrón de email:
- **Admin**: `admin@[dominio-del-negocio]`
- **Otros usuarios**: `[nombre-lowercase][número]@[dominio-del-negocio]`

### Total de usuarios esperados:
- **Administradores**: 13 (1 por negocio)
- **Otros usuarios**: 13-26 (1-2 por negocio)
- **Total**: 26-39 usuarios de negocios
- **Más**: 1 usuario PROVEEDOR
- **TOTAL GENERAL**: 27-40 usuarios

---

## 📦 PASO 5 - INVENTARIOS POR CLIENTE

**Función:** `crearInventario(tenants, productos)`

### Detalles por negocio:

Cada negocio tendrá:
- **Cantidad de productos**: 50-200 (aleatorio)
- **Productos seleccionados**: Aleatorios del catálogo maestro de 500

### Cálculo de precios por producto:

```typescript
// Precio de costo: -10% a +10% del precio sugerido
costoBase = precioSugerido * 0.6
variación = -10% a +10% (aleatoria)
precioCompra = costoBase * (1 + variación)

// Precio de venta: 30% a 60% de margen
margen = 30% a 60% (aleatorio)
precioVenta = precioCompra * (1 + margen)

// Stock inicial: 5 a 100 unidades
stock = 5 - 100 (aleatorio)

// Stock mínimo: 5 a 15 unidades
stockMinimo = 5 - 15 (aleatorio)
```

### Ejemplo para un negocio (Minimarket Don Luis):
```
Suponiendo 100 productos seleccionados:

Producto 1: Coca-Cola 1.5L
  - SKU: 7791234567890
  - Precio compra: $890
  - Precio venta: $1,290
  - Stock: 45 unidades
  - Stock mínimo: 10

Producto 2: Pan Hallulla
  - SKU: SKU-1699123456789-abc123
  - Precio compra: $350
  - Precio venta: $520
  - Stock: 78 unidades
  - Stock mínimo: 15

... (98 productos más)
```

### Total de productos en inventarios:
- **Mínimo**: 13 negocios × 50 productos = 650 productos
- **Máximo**: 13 negocios × 200 productos = 2,600 productos
- **Promedio esperado**: ~1,625 productos en inventario

---

## 💰 PASO 6 - VENTAS HISTÓRICAS

**Función:** `crearVentasHistoricas(tenants, usuarios)`

### Período de ventas:
- **Últimos 90 días** (3 meses)

### Cantidad de ventas por negocio:
- **50 a 300 ventas** (aleatorio)

### Estructura de cada venta:

```typescript
{
  saleNumber: "000001" (secuencial por tenant)
  subtotal: number              // Suma de items
  tax: number                   // IVA 19%
  total: subtotal + tax
  paymentMethod: CASH | DEBIT | CREDIT | TRANSFER
  cashReceived: number | null   // Solo si es CASH
  change: number | null         // Vuelto
  status: "COMPLETED"
  userId: [cajero que realizó la venta]
  tenantId: [negocio]
  createdAt: [fecha aleatoria en últimos 90 días]
  items: [
    {
      tenantInventoryId: [producto]
      quantity: 1-5 unidades
      unitPrice: [precio de venta]
      unitCost: [costo del producto]
      subtotal: unitPrice * quantity
    }
  ]
}
```

### Distribución de métodos de pago:
- **CASH (Efectivo)**: 50%
- **DEBIT (Débito)**: 30%
- **CREDIT (Crédito)**: 15%
- **TRANSFER (Transferencia)**: 5%

### Productos por venta:
- **1 a 8 productos** por venta (aleatorio)
- **Cantidad por producto**: 1-5 unidades

### Ejemplo de una venta:

```
Negocio: Minimarket Don Luis
Número de venta: 000123
Fecha: 2025-10-15 14:32:00
Cajero: juan1@minimarketdonluis.cl

Items:
  1. Coca-Cola 1.5L × 2 = $2,580
  2. Pan Hallulla × 5 = $2,600
  3. Leche Colun 1L × 1 = $950

Subtotal: $6,130
IVA (19%): $1,165
Total: $7,295

Método de pago: CASH
Efectivo recibido: $8,000
Vuelto: $705
```

### Impacto en inventario:
- **Cada venta reduce el stock** de los productos vendidos
- Actualización automática del inventario

### Total de ventas esperadas:
- **Mínimo**: 13 negocios × 50 ventas = 650 ventas
- **Máximo**: 13 negocios × 300 ventas = 3,900 ventas
- **Promedio esperado**: ~2,275 ventas históricas

---

## 🔄 PASO 7 - MOVIMIENTOS DE INVENTARIO

**Función:** `crearMovimientosInventario(tenants, usuarios)`

### Cantidad por negocio:
- **5 a 15 movimientos** (aleatorio)

### Tipos de movimientos:

| Tipo | Descripción | Cantidad | Razón |
|------|-------------|----------|-------|
| **PURCHASE** (Compra) | Ingreso de mercadería | +10 a +60 unidades | "Compra a proveedor" |
| **LOSS** (Pérdida) | Merma o producto dañado | -1 a -6 unidades | "Producto vencido" |
| **CORRECTION** (Corrección) | Ajuste de inventario | -5 a +5 unidades | "Corrección de inventario" |
| **RETURN** (Devolución) | Devolución de cliente | +1 a +6 unidades | "Devolución de cliente" |

### Estructura de cada movimiento:

```typescript
{
  tenantInventoryId: [producto afectado]
  quantity: [positivo o negativo según tipo]
  type: PURCHASE | LOSS | CORRECTION | RETURN
  reason: string
  userId: [usuario que realizó el movimiento]
  tenantId: [negocio]
  createdAt: [fecha aleatoria en últimos 90 días]
}
```

### Ejemplo de movimientos:

```
Negocio: Minimarket Don Luis

1. Compra a proveedor
   - Producto: Coca-Cola 1.5L
   - Cantidad: +48 unidades
   - Fecha: 2025-09-20
   - Usuario: admin@minimarketdonluis.cl

2. Producto vencido
   - Producto: Pan Hallulla
   - Cantidad: -3 unidades
   - Fecha: 2025-10-05
   - Usuario: juan1@minimarketdonluis.cl

3. Corrección de inventario
   - Producto: Leche Colun 1L
   - Cantidad: +2 unidades
   - Fecha: 2025-10-28
   - Usuario: admin@minimarketdonluis.cl

... (2-12 movimientos más)
```

### Impacto en inventario:
- **Cada movimiento actualiza el stock** del producto
- Stock se incrementa o decrementa según el tipo

### Total de movimientos esperados:
- **Mínimo**: 13 negocios × 5 movimientos = 65 movimientos
- **Máximo**: 13 negocios × 15 movimientos = 195 movimientos
- **Promedio esperado**: ~130 movimientos de inventario

---

## 💳 PASO 8 - SUSCRIPCIONES

**Función:** `crearSuscripciones(tenants, planes)`

### Se crea 1 suscripción por negocio (13 total)

### Detalles de cada suscripción:

```typescript
{
  tenantId: [negocio]
  planId: [plan según planType del negocio]
  status: ACTIVE
  startDate: [hace 1-6 meses]
  billingCycle: MONTHLY
  nextBillingDate: [próximo mes]
  lastBillingDate: [mes pasado]
  autoRenew: true
  lifetimeValue: precio × meses_activo
}
```

### Pagos históricos:
- Se crean **pagos mensuales** desde la fecha de inicio hasta ahora
- Todos los pagos tienen estado: **APPROVED**
- Método de pago: **CREDIT**
- Tipo de tarjeta: **Visa o Mastercard** (aleatorio)

### Ejemplo para Minimarket Don Luis (Plan PRO):

```
Suscripción:
  - Plan: Plan Pro ($19,990/mes)
  - Fecha inicio: 2025-06-12
  - Meses activo: 5
  - Lifetime value: $99,950
  - Estado: ACTIVE
  - Próxima facturación: 2025-12-12

Pagos históricos:
  1. 2025-06-12: $19,990 - APPROVED (Visa ****)
  2. 2025-07-12: $19,990 - APPROVED (Mastercard ****)
  3. 2025-08-12: $19,990 - APPROVED (Visa ****)
  4. 2025-09-12: $19,990 - APPROVED (Visa ****)
  5. 2025-10-12: $19,990 - APPROVED (Mastercard ****)
```

### Distribución de suscripciones:
- **Plan Básico ($9,990)**: 7 suscripciones
- **Plan Pro ($19,990)**: 5 suscripciones
- **Plan Enterprise ($49,990)**: 1 suscripción

---

## 📊 RESUMEN DE DATOS A POBLAR

### Totales esperados:

| Categoría | Cantidad Exacta / Rango | Detalles |
|-----------|-------------------------|----------|
| **Planes de suscripción** | 3 | Básico, Pro, Enterprise |
| **Productos maestros** | 500 | Desde productos_chile.json |
| **Negocios (Tenants)** | 13 + 1 | 13 PyME + 1 Plataforma |
| **Usuarios totales** | 27-40 | 1 PROVEEDOR + 26-39 usuarios de negocios |
| **Usuarios ADMIN** | 13 | 1 por negocio |
| **Usuarios CAJA/INVENTARIO** | 13-26 | 1-2 por negocio |
| **Productos en inventarios** | 650-2,600 | 50-200 por negocio |
| **Suscripciones activas** | 13 | 1 por negocio |
| **Pagos de suscripción** | 39-78 | Histórico de 1-6 meses |
| **Ventas históricas** | 650-3,900 | 50-300 por negocio |
| **Items de venta** | 650-31,200 | 1-8 productos por venta |
| **Movimientos de inventario** | 65-195 | 5-15 por negocio |

---

## 🔐 TABLA DE CREDENCIALES

### 👨‍💼 Administrador de Plataforma (PROVEEDOR)

| Email | Contraseña | Rol | Tenant | Permisos |
|-------|------------|-----|--------|----------|
| admin@crtlpyme.com | Admin2025! | PROVEEDOR | CRTLPyme - Plataforma | Super Admin - Acceso total |

---

### 👥 Usuarios de Negocios

**CONTRASEÑA UNIVERSAL: `Demo2025!`**

#### Patrón de emails por negocio:

| Negocio | Dominio | Admin | Usuario 2 | Usuario 3 |
|---------|---------|-------|-----------|-----------|
| Minimarket Don Luis | minimarketdonluis.cl | admin@ | [nombre]1@ | [nombre]2@ |
| Almacén El Rinconcito | gmail.com | admin@elrinconcito | [nombre]1@ | [nombre]2@ |
| Supermercado Familiar | superfamiliar.cl | admin@ | [nombre]1@ | [nombre]2@ |
| Tienda La Esquina | hotmail.com | admin@laesquina | [nombre]1@ | [nombre]2@ |
| Abarrotes San José | gmail.com | admin@sanjose.abarrotes | [nombre]1@ | [nombre]2@ |
| Minimarket Express 24/7 | gmail.com | admin@express247 | [nombre]1@ | [nombre]2@ |
| Almacén Doña Rosa | outlook.com | admin@almacendonarosa | [nombre]1@ | [nombre]2@ |
| Supermercado Los Andes | losandessupermarket.cl | admin@ | [nombre]1@ | [nombre]2@ |
| Tienda Don Pedro | gmail.com | admin@donpedro.tienda | [nombre]1@ | [nombre]2@ |
| Minimarket Central | yahoo.com | admin@minimarketcentral | [nombre]1@ | [nombre]2@ |
| Almacén El Buen Vecino | gmail.com | admin@buenvecino | [nombre]1@ | [nombre]2@ |
| Supermercado La Familia | outlook.com | admin@superfamilia | [nombre]1@ | [nombre]2@ |
| Minimarket Nuevo Amanecer | gmail.com | admin@nuevoamanecer.mm | [nombre]1@ | [nombre]2@ |

**Nota:** `[nombre]` será reemplazado por un nombre chileno aleatorio en minúsculas (ej: juan, maria, pedro, etc.)

---

## ⚠️ ADVERTENCIAS Y CONSIDERACIONES

### 🚨 IMPORTANTE - Limpieza de Base de Datos

El script tiene un flag `--clean` que **ELIMINA TODOS LOS DATOS** existentes:

```bash
# ⚠️ PELIGRO: Elimina todos los datos
npm run seed -- --clean

# ✅ SEGURO: Mantiene datos existentes, crea solo lo que falta
npm run seed
```

### Orden de eliminación (si se usa --clean):
1. SaleItem
2. Sale
3. StockAdjustment
4. TenantInventory
5. MasterProduct
6. CashSession
7. SubscriptionPayment
8. Subscription
9. SubscriptionPlan
10. User
11. Tenant

### 🔄 Manejo de Datos Existentes

El script usa **upsert** y **verificaciones** para evitar duplicados:

- ✅ **Planes**: Verifica si existen, omite si ya hay planes
- ✅ **Productos**: Usa `upsert` por SKU
- ✅ **Tenants**: Verifica por RUT
- ✅ **Usuarios**: Verifica por email
- ✅ **Inventario**: Verifica combinación tenant + producto

### 📁 Archivo Requerido

**CRÍTICO:** El archivo `/home/ubuntu/productos_chile.json` debe existir.

Si no existe, el script:
- ❌ Mostrará error: "No se encontró el archivo"
- ❌ No importará productos
- ❌ Continuará con el resto del proceso (pero sin inventarios ni ventas)

### 🔢 Números Aleatorios

Los siguientes datos son **aleatorios** en cada ejecución:

- Nombres y apellidos de usuarios
- Cantidad exacta de usuarios por negocio (2-3)
- Cantidad de productos por inventario (50-200)
- Precios de compra y venta (dentro de rangos)
- Stock inicial (5-100 unidades)
- Cantidad de ventas (50-300)
- Fechas de ventas (últimos 90 días)
- Productos en cada venta (1-8)
- Métodos de pago (según distribución)
- Movimientos de inventario (5-15)

### 💾 Impacto en Base de Datos

**Tamaño estimado:**

- Tablas pequeñas: ~100 KB (planes, tenants, usuarios)
- Productos maestros: ~1-2 MB (500 productos)
- Inventarios: ~2-20 MB (650-2,600 registros)
- Ventas + Items: ~5-30 MB (650-31,200 registros)
- Movimientos: ~100-500 KB (65-195 registros)

**Total estimado:** 10-50 MB de datos

### ⏱️ Tiempo de Ejecución Estimado

- Planes: ~1 segundo
- Productos: ~30-60 segundos (500 productos con upsert)
- Tenants: ~2-3 segundos
- Usuarios: ~5-10 segundos
- Inventarios: ~2-5 minutos (650-2,600 productos)
- Suscripciones: ~5-10 segundos
- Ventas: ~5-15 minutos (650-3,900 ventas)
- Movimientos: ~30-60 segundos

**Total estimado:** 10-25 minutos

---

## 🎯 COMANDOS ESPECÍFICOS PARA EJECUTAR

### 1. Verificar requisitos previos

```bash
# Verificar que existe el archivo de productos
ls -lh /home/ubuntu/productos_chile.json

# Verificar conexión a la base de datos
cd /home/ubuntu/CRTLPyme
npx prisma db pull
```

### 2. Opción A: Ejecutar completo (MANTIENE datos existentes)

```bash
cd /home/ubuntu/CRTLPyme
npm run tsx prisma/seed-complete.ts
```

### 3. Opción B: Ejecutar completo (LIMPIA todo primero) ⚠️

```bash
cd /home/ubuntu/CRTLPyme
npm run tsx prisma/seed-complete.ts -- --clean
```

### 4. Monitorear ejecución

```bash
# Ver logs en tiempo real
cd /home/ubuntu/CRTLPyme
npm run tsx prisma/seed-complete.ts 2>&1 | tee seed-execution.log

# Verificar progreso en otra terminal
watch -n 2 "echo 'Tenants:' && psql $DATABASE_URL -c 'SELECT COUNT(*) FROM \"Tenant\";' && echo 'Usuarios:' && psql $DATABASE_URL -c 'SELECT COUNT(*) FROM \"User\";' && echo 'Productos:' && psql $DATABASE_URL -c 'SELECT COUNT(*) FROM \"MasterProduct\";'"
```

### 5. Verificar resultados

```bash
# Conectar a la base de datos
cd /home/ubuntu/CRTLPyme

# Verificar planes
npx prisma studio
# O usar consultas SQL:

# Ver resumen de datos
psql $DATABASE_URL << 'SQL'
SELECT 'Planes' as tabla, COUNT(*) as cantidad FROM "SubscriptionPlan"
UNION ALL
SELECT 'Productos Maestros', COUNT(*) FROM "MasterProduct"
UNION ALL
SELECT 'Tenants', COUNT(*) FROM "Tenant"
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM "User"
UNION ALL
SELECT 'Inventarios', COUNT(*) FROM "TenantInventory"
UNION ALL
SELECT 'Suscripciones', COUNT(*) FROM "Subscription"
UNION ALL
SELECT 'Ventas', COUNT(*) FROM "Sale"
UNION ALL
SELECT 'Items de Venta', COUNT(*) FROM "SaleItem"
UNION ALL
SELECT 'Movimientos', COUNT(*) FROM "StockAdjustment";
SQL
```

### 6. Extraer credenciales creadas

```bash
cd /home/ubuntu/CRTLPyme

# Listar todos los usuarios y sus emails
psql $DATABASE_URL -c "
SELECT 
  u.email,
  u.role,
  t.\"businessName\" as negocio,
  u.\"isActive\"
FROM \"User\" u
LEFT JOIN \"Tenant\" t ON u.\"tenantId\" = t.id
ORDER BY u.role DESC, t.\"businessName\";
" > /home/ubuntu/CREDENCIALES_CREADAS.txt

cat /home/ubuntu/CREDENCIALES_CREADAS.txt
```

---

## 📈 MÉTRICAS Y KPIs ESPERADOS

Después del poblado, la plataforma tendrá:

### Métricas de Negocios:
- **13 tenants activos**
- **7 en Plan Básico** ($9,990/mes)
- **5 en Plan Pro** ($19,990/mes)
- **1 en Plan Enterprise** ($49,990/mes)
- **MRR Total**: ~$229,870 CLP/mes

### Métricas de Usuarios:
- **27-40 usuarios activos**
- **Tasa de usuarios por negocio**: 2-3 usuarios
- **13 administradores** de negocio

### Métricas de Catálogo:
- **500 productos** en catálogo maestro
- **650-2,600 productos** en inventarios
- **Promedio de SKUs por negocio**: 50-200

### Métricas de Ventas:
- **650-3,900 ventas** en 3 meses
- **Promedio por negocio**: 50-300 ventas
- **Ticket promedio estimado**: $3,000-$15,000 CLP
- **Volumen de ventas total**: ~$5-$45 millones CLP

### Métodos de Pago:
- **50% Efectivo**
- **30% Débito**
- **15% Crédito**
- **5% Transferencia**

---

## 🔍 PRÓXIMOS PASOS DESPUÉS DEL POBLADO

### 1. Verificación Inmediata
- ✅ Verificar que todos los usuarios pueden iniciar sesión
- ✅ Comprobar que los negocios tienen inventario
- ✅ Revisar que las ventas se muestran correctamente
- ✅ Verificar suscripciones activas

### 2. Pruebas Funcionales
- 🔍 Iniciar sesión como PROVEEDOR y verificar dashboard
- 🔍 Iniciar sesión como ADMIN de un negocio
- 🔍 Realizar una venta de prueba
- 🔍 Ver reportes y estadísticas
- 🔍 Revisar movimientos de inventario

### 3. Ajustes Opcionales
- 🎨 Personalizar datos si es necesario
- 📊 Agregar más ventas históricas
- 👥 Crear más usuarios específicos
- 📦 Agregar más productos a inventarios específicos

### 4. Backup
- 💾 Crear backup de la base de datos poblada
- 📁 Guardar credenciales en lugar seguro
- 📄 Documentar cualquier modificación manual

---

## 📞 CONTACTO Y SOPORTE

Para ejecutar este plan:

1. **Revisar este documento** completo
2. **Aprobar el plan** antes de proceder
3. **Solicitar ejecución** paso a paso o completa
4. **Validar resultados** después de cada paso

---

## 🏁 CONCLUSIÓN

Este plan detalla **EXACTAMENTE** qué datos se poblarán basándose en el archivo `seed-complete.ts` existente. No se generarán datos nuevos, solo se ejecutará lo que ya está programado en el script.

**Ventajas:**
- ✅ Datos realistas de negocios chilenos
- ✅ Historial de 3 meses de operaciones
- ✅ Usuarios con roles claramente definidos
- ✅ Suscripciones activas y pagos históricos
- ✅ Inventarios y ventas coherentes
- ✅ Credenciales simples y documentadas

**Listo para ejecutar cuando apruebes.**

---

*Documento generado: 2025-11-12*
*Versión: 1.0*
*Análisis basado en: /home/ubuntu/CRTLPyme/prisma/seed-complete.ts*
