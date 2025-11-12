# 📊 Análisis de Implementación de Planes de Suscripción - CRTLPyme

---

## 📄 1. ARCHIVO: `prisma/seed-subscription-plans.ts`

### **Propósito**
Script de inicialización (seeding) que puebla la base de datos con los planes de suscripción predefinidos del sistema CRTLPyme SaaS.

### **Funcionalidad Principal**
- **Crea o actualiza** 8 planes de suscripción (4 mensuales + 4 anuales)
- **Verifica existencia** antes de crear para evitar duplicados
- **Actualiza planes existentes** si ya están en la base de datos
- **Muestra estadísticas** de planes creados/actualizados al finalizar

---

## 💰 PLANES DE SUSCRIPCIÓN DEFINIDOS

### **PLANES MENSUALES**

#### **1️⃣ Plan Gratuito (FREE)**
- **Precio:** $0 CLP/mes
- **Período de prueba:** 0 días
- **Límites:**
  - ✅ 1 Usuario
  - ✅ 50 Productos máximo
  - ✅ 100 Ventas/mes
  - ✅ 1 Caja registradora
- **Características:**
  - Soporte por email
  - Reportes básicos
- **Estado:** Activo y visible

---

#### **2️⃣ Plan Básico - Mensual**
- **Precio:** $19,990 CLP/mes
- **Período de prueba:** 14 días
- **Límites:**
  - ✅ 3 Usuarios
  - ✅ 500 Productos máximo
  - ✅ Ventas ilimitadas
  - ✅ 2 Cajas registradoras
- **Características:**
  - Soporte prioritario
  - Reportes avanzados
  - Control de inventario
  - Gestión de clientes
- **Estado:** Activo y visible

---

#### **3️⃣ Plan Profesional - Mensual**
- **Precio:** $39,990 CLP/mes
- **Período de prueba:** 14 días
- **Límites:**
  - ✅ 10 Usuarios
  - ✅ 2,000 Productos máximo
  - ✅ Ventas ilimitadas
  - ✅ 5 Cajas registradoras
- **Características:**
  - Soporte 24/7
  - Reportes personalizados
  - Multi-sucursal
  - Integración con Transbank
  - Facturación electrónica
  - API de integración
  - Backup automático diario
- **Estado:** Activo y visible

---

#### **4️⃣ Plan Empresarial - Mensual**
- **Precio:** $79,990 CLP/mes
- **Período de prueba:** 30 días
- **Límites:**
  - ✅ Usuarios ilimitados (null)
  - ✅ Productos ilimitados (null)
  - ✅ Ventas ilimitadas (null)
  - ✅ Cajas registradoras ilimitadas
- **Características:**
  - Soporte dedicado 24/7
  - Reportes personalizados
  - Multi-sucursal avanzado
  - Integración con todos los medios de pago
  - Facturación electrónica SII
  - API completa
  - Backup en tiempo real
  - Personalización del sistema
  - Capacitación incluida
- **Estado:** Activo y visible

---

### **PLANES ANUALES (con 20% de descuento)**

#### **5️⃣ Plan Básico - Anual**
- **Precio:** $191,904 CLP/año
- **Ahorro:** 20% de descuento (equivalente a 2 meses gratis)
- **Precio mensual equivalente:** ~$15,992 CLP/mes
- **Período de prueba:** 30 días
- **Límites:** Iguales al Plan Básico Mensual
- **Características adicionales:**
  - ⭐ 20% de descuento
  - ⭐ 2 meses gratis
- **Estado:** Activo y visible

---

#### **6️⃣ Plan Profesional - Anual**
- **Precio:** $383,904 CLP/año
- **Ahorro:** 20% de descuento (equivalente a 2 meses gratis)
- **Precio mensual equivalente:** ~$31,992 CLP/mes
- **Período de prueba:** 30 días
- **Límites:** Iguales al Plan Profesional Mensual
- **Características adicionales:**
  - ⭐ 20% de descuento
  - ⭐ 2 meses gratis
- **Estado:** Activo y visible

---

#### **7️⃣ Plan Empresarial - Anual**
- **Precio:** $767,904 CLP/año
- **Ahorro:** 20% de descuento (equivalente a 2 meses gratis)
- **Precio mensual equivalente:** ~$63,992 CLP/mes
- **Período de prueba:** 30 días
- **Límites:** Iguales al Plan Empresarial Mensual
- **Características adicionales:**
  - ⭐ 20% de descuento
  - ⭐ 2 meses gratis
- **Estado:** Activo y visible

---

#### **8️⃣ Plan Premium - Anual**
- **Precio:** $1,199,904 CLP/año
- **Ahorro:** 20% de descuento
- **Precio mensual equivalente:** ~$99,992 CLP/mes
- **Período de prueba:** 30 días
- **Límites:** Todo ilimitado
- **Características PREMIUM:**
  - ✨ Todo lo del Plan Empresarial
  - ✨ Módulo de Contabilidad integrado
  - ✨ Módulo de RRHH
  - ✨ Módulo de Compras y Proveedores
  - ✨ CRM avanzado
  - ✨ Business Intelligence
  - ✨ Integraciones personalizadas
  - ✨ Desarrollo de módulos a medida
  - ✨ Consultor dedicado
  - ✨ SLA garantizado 99.9%
  - ⭐ 20% de descuento
  - ⭐ 2 meses gratis
- **Estado:** Activo y visible

---

## 🗄️ ESQUEMA DE BASE DE DATOS

### **Modelo: `SubscriptionPlan`**

El script utiliza el modelo `SubscriptionPlan` de Prisma con los siguientes campos:

```typescript
{
  id: string,                    // ID único del plan
  name: string,                  // Nombre del plan
  description: string | null,    // Descripción del plan
  price: number,                 // Precio en CLP
  billingCycle: BillingCycle,    // 'MONTHLY' o 'YEARLY'
  trialDays: number,             // Días de período de prueba
  isVisible: boolean,            // Si se muestra en la UI
  sortOrder: number,             // Orden de visualización
  features: string,              // JSON stringify con array de features
  maxUsers: number | null,       // Límite de usuarios (null = ilimitado)
  maxProducts: number | null,    // Límite de productos (null = ilimitado)
  maxSales: number | null,       // Límite de ventas (null = ilimitado)
  isActive: boolean,             // Si el plan está activo
  createdAt: DateTime,           // Fecha de creación
  updatedAt: DateTime            // Fecha de actualización
}
```

### **Enum: `BillingCycle`**
```typescript
enum BillingCycle {
  MONTHLY  // Mensual
  YEARLY   // Anual
}
```

---

## 📄 2. ARCHIVO: `app/api/subscription-plans/route.ts`

### **Propósito**
API REST para gestionar planes de suscripción con endpoints públicos (lectura) y privados (escritura).

---

## 🔌 ENDPOINTS DE LA API

### **1️⃣ GET /api/subscription-plans**

#### **Funcionalidad:**
- Lista todos los planes de suscripción activos y visibles
- Incluye contador de suscripciones activas por plan
- Permite ver planes ocultos/inactivos con parámetro `?all=true` (solo admins)

#### **Permisos:**
- ✅ **Público** - Cualquier usuario puede listar planes visibles
- 🔒 **Admin (PROVEEDOR)** - Puede ver todos los planes con `?all=true`

#### **Parámetros de Query:**
- `all=true` (opcional) - Muestra todos los planes incluyendo inactivos/ocultos (requiere permisos de admin)

#### **Respuesta Exitosa (200):**
```json
{
  "plans": [
    {
      "id": "plan-id",
      "name": "Plan Básico - Mensual",
      "description": "Ideal para pequeños negocios...",
      "price": 19990,
      "billingCycle": "MONTHLY",
      "trialDays": 14,
      "features": "[\"3 Usuarios\",\"500 Productos\"...]",
      "maxUsers": 3,
      "maxProducts": 500,
      "maxSales": null,
      "isVisible": true,
      "isActive": true,
      "sortOrder": 2,
      "activeSubscriptions": 15,  // ⭐ Contador agregado
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
    // ... más planes
  ],
  "total": 8
}
```

#### **Respuesta de Error (500):**
```json
{
  "error": "Error al obtener planes de suscripción"
}
```

#### **Lógica Especial:**
- Cuenta suscripciones activas mediante:
  ```typescript
  prisma.subscription.count({
    where: { planId: plan.id, status: 'ACTIVE' }
  })
  ```
- Ordena planes por `sortOrder` ascendente

---

### **2️⃣ POST /api/subscription-plans**

#### **Funcionalidad:**
- Crea un nuevo plan de suscripción
- Solo accesible por administradores con rol PROVEEDOR

#### **Permisos:**
- 🔒 **PROVEEDOR solamente** - Verificado mediante `verifyAdminSaaSAccess()`

#### **Body Request:**
```json
{
  "name": "string",              // ✅ REQUERIDO
  "description": "string",       // Opcional
  "price": "number",             // ✅ REQUERIDO (en CLP)
  "billingCycle": "MONTHLY|YEARLY", // ✅ REQUERIDO
  "trialDays": "number",         // Opcional (default: 0)
  "features": "string (JSON)",   // Opcional
  "maxUsers": "number|null",     // Opcional (null = ilimitado)
  "maxProducts": "number|null",  // Opcional (null = ilimitado)
  "maxSales": "number|null",     // Opcional (null = ilimitado)
  "isVisible": "boolean",        // Opcional (default: true)
  "sortOrder": "number"          // Opcional (default: 0)
}
```

#### **Validaciones:**
- ✅ `name` debe estar presente
- ✅ `price` debe estar presente
- ✅ `billingCycle` debe estar presente
- Si faltan campos, retorna error 400

#### **Respuesta Exitosa (201):**
```json
{
  "message": "Plan de suscripción creado exitosamente",
  "plan": {
    "id": "new-plan-id",
    "name": "Mi Nuevo Plan",
    "price": 29990,
    // ... resto de campos
  }
}
```

#### **Respuesta de Error (400):**
```json
{
  "error": "Faltan campos requeridos: name, price, billingCycle"
}
```

#### **Respuesta de Error (401/403):**
```json
{
  "error": "No autorizado" // Si no es PROVEEDOR
}
```

#### **Respuesta de Error (500):**
```json
{
  "error": "Error al crear plan de suscripción"
}
```

---

## 🔐 SEGURIDAD Y AUTENTICACIÓN

### **Función de Autorización: `verifyAdminSaaSAccess()`**

Esta función (importada de `@/lib/admin-auth`) verifica:
- ✅ Usuario autenticado
- ✅ Rol de usuario es **PROVEEDOR** (admin del sistema SaaS)
- ❌ Retorna error si no cumple requisitos

### **Niveles de Acceso:**
- **GET** - Público (planes visibles) o Admin (todos los planes con `?all=true`)
- **POST** - Solo PROVEEDOR
- **PUT/PATCH** - No implementado aún
- **DELETE** - No implementado aún

---

## 🔄 FLUJO DE EJECUCIÓN DEL SEED

```
1. Iniciar script
2. Para cada plan en el array subscriptionPlans:
   a. Buscar si existe plan con mismo name + billingCycle
   b. Si existe:
      - Actualizar plan con nuevos datos
      - Incrementar contador updatedCount
   c. Si no existe:
      - Crear nuevo plan
      - Incrementar contador createdCount
   d. Manejar errores individuales
3. Mostrar resumen:
   - Planes creados
   - Planes actualizados
   - Total de planes
4. Listar todos los planes ordenados por sortOrder
5. Desconectar Prisma
```

---

## 📊 CARACTERÍSTICAS TÉCNICAS

### **Gestión de Features**
- Las características se almacenan como **JSON stringify** en la base de datos
- Formato: `JSON.stringify(['Feature 1', 'Feature 2', ...])`
- Al leer, se debe hacer `JSON.parse(plan.features)` para obtener el array

### **Límites Ilimitados**
- Se representan como `null` en la base de datos
- `maxUsers: null` = usuarios ilimitados
- `maxProducts: null` = productos ilimitados
- `maxSales: null` = ventas ilimitadas

### **Cálculo de Descuentos Anuales**
```javascript
// Precio anual = precio mensual * 12 * 0.8 (20% descuento)
// Ejemplo: Plan Básico
19990 * 12 * 0.8 = 191,904 CLP/año
// Ahorro: 47,976 CLP (equivalente a 2.4 meses gratis)
```

### **Orden de Visualización**
Los planes se ordenan usando el campo `sortOrder`:
1. Plan Gratuito (1)
2. Plan Básico - Mensual (2)
3. Plan Profesional - Mensual (3)
4. Plan Empresarial - Mensual (4)
5. Plan Básico - Anual (5)
6. Plan Profesional - Anual (6)
7. Plan Empresarial - Anual (7)
8. Plan Premium - Anual (8)

---

## 🚀 COMANDOS PARA EJECUTAR

### **Ejecutar el Seed:**
```bash
# Desde la raíz del proyecto
npx ts-node prisma/seed-subscription-plans.ts

# O si está configurado en package.json
npm run seed:plans
```

### **Probar la API:**
```bash
# Listar planes públicos
curl http://localhost:3000/api/subscription-plans

# Listar todos los planes (requiere autenticación admin)
curl http://localhost:3000/api/subscription-plans?all=true \
  -H "Cookie: next-auth.session-token=..."

# Crear nuevo plan (requiere autenticación admin)
curl -X POST http://localhost:3000/api/subscription-plans \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "name": "Plan Test",
    "price": 9990,
    "billingCycle": "MONTHLY",
    "trialDays": 7
  }'
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### **1. No hay Endpoints para Actualizar/Eliminar**
- ❌ **PUT/PATCH** no implementado
- ❌ **DELETE** no implementado
- ✅ Se puede actualizar ejecutando el seed nuevamente
- ⚠️ Para producción, considerar implementar estos endpoints

### **2. Validación de Datos**
- ✅ API valida campos requeridos
- ❌ No valida rangos (ej: price > 0)
- ❌ No valida formato de features JSON
- ⚠️ Considerar agregar validaciones con Zod o similar

### **3. Migraciones de Precios**
- Si se cambian precios en el seed, afectará a:
  - ✅ Nuevas suscripciones
  - ❌ Suscripciones existentes (mantienen precio original)
- ⚠️ Considerar estrategia de "grandfathering" para clientes existentes

### **4. Periodo de Prueba**
- Los planes anuales tienen 30 días de prueba vs 14 días en mensuales
- El plan gratuito no tiene período de prueba (0 días)
- ⚠️ Verificar lógica de implementación del trial en el módulo de suscripciones

### **5. Contador de Suscripciones Activas**
- La API hace queries adicionales para contar suscripciones
- Con muchos planes, podría afectar rendimiento
- ✅ Considerar cachear este contador o usar vista materializada

---

## 🎯 RESUMEN EJECUTIVO

### **Estado Actual de la Implementación:**

✅ **Implementado:**
- 8 planes de suscripción bien definidos
- Script de seed funcional con lógica de actualización
- API GET pública para listar planes
- API POST protegida para crear planes
- Contador de suscripciones activas por plan
- Soporte para planes mensuales y anuales
- Sistema de descuentos (20% en planes anuales)

⚠️ **Falta Implementar:**
- Endpoints PUT/PATCH para actualizar planes
- Endpoint DELETE para eliminar/desactivar planes
- Validación robusta de datos de entrada
- Paginación para lista de planes (si crece mucho)
- Cache para mejorar rendimiento
- Webhooks para notificar cambios de planes

💰 **Estructura de Precios:**
- **Gratuito:** $0 (limitado)
- **Básico:** $19,990/mes o $191,904/año
- **Profesional:** $39,990/mes o $383,904/año
- **Empresarial:** $79,990/mes o $767,904/año
- **Premium:** $1,199,904/año (solo anual)

🎯 **Segmentos de Mercado:**
- **Emprendedores/Prueba:** Plan Gratuito
- **Pequeños Negocios:** Plan Básico
- **Negocios Establecidos:** Plan Profesional
- **Cadenas/Multi-sucursal:** Plan Empresarial
- **Grandes Empresas:** Plan Premium

---

## 📝 NOTAS FINALES

Esta implementación está bien estructurada y cubre los casos de uso básicos de un sistema SaaS multi-tenant. Los planes están claramente diferenciados por límites y características, y la API proporciona las operaciones esenciales de lectura y creación.

**Recomendaciones para Producción:**
1. ✅ Implementar endpoints faltantes (UPDATE, DELETE)
2. ✅ Agregar validación robusta con Zod
3. ✅ Implementar cache para mejorar rendimiento
4. ✅ Agregar logs de auditoría para cambios de planes
5. ✅ Considerar versionado de planes para migrar clientes existentes
6. ✅ Implementar lógica de "downgrade" y "upgrade" de planes
7. ✅ Agregar webhooks para integraciones externas (Transbank, etc.)

---

*Análisis generado el: 11 de noviembre de 2025*
