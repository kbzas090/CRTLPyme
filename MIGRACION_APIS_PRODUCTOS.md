# 📦 Migración de APIs de Productos al Modelo de Catálogo Maestro

## 🎯 Objetivo

Migrar las APIs de productos del modelo antiguo (`products`) al nuevo modelo de catálogo maestro compartido (`master_products` + `tenant_inventory`).

---

## 📊 Modelo Antiguo vs Nuevo

### ❌ Modelo Antiguo
```
products (tabla única)
├── Cada tenant tiene sus propios productos
├── Duplicación de productos entre tenants
└── No hay catálogo compartido
```

### ✅ Modelo Nuevo
```
master_products (catálogo compartido)
└── tenant_inventory (inventario por tenant)
    ├── Referencia a master_products
    ├── Precios y stock específicos del tenant
    └── Configuración personalizada
```

---

## 🔄 Cambios en las APIs

### 1. API de Productos (`/api/products`)

#### Antes (route.ts)
- `GET /api/products` → Lista productos de la tabla `products`
- `POST /api/products` → Crea producto en la tabla `products`

#### Después (route_NEW.ts)
- `GET /api/products` → Lista productos del `tenant_inventory` con datos de `master_products`
- `POST /api/products` → 
  1. Busca/crea producto en `master_products`
  2. Agrega al `tenant_inventory` del tenant

### 2. API de Productos por ID (`/api/products/[id]`)

#### Antes (route.ts)
- `GET /api/products/[id]` → Obtiene producto de `products`
- `PUT /api/products/[id]` → Actualiza producto en `products`
- `DELETE /api/products/[id]` → Soft delete en `products`

#### Después (route_NEW.ts)
- `GET /api/products/[id]` → Obtiene de `tenant_inventory` con `master_product`
- `PUT /api/products/[id]` → Actualiza solo campos del `tenant_inventory`
- `DELETE /api/products/[id]` → Soft delete en `tenant_inventory`

---

## 📁 APIs Nuevas Ya Implementadas

### ✅ 1. `/api/admin-saas/master-products`
**Gestión del catálogo maestro (solo PROVEEDOR)**

```typescript
GET /api/admin-saas/master-products
  - Lista todos los productos del catálogo maestro
  - Filtros: category, search, activeOnly

POST /api/admin-saas/master-products
  - Crea nuevo producto en el catálogo maestro
  - Solo usuarios con rol PROVEEDOR
```

### ✅ 2. `/api/inventory`
**Gestión del inventario del tenant**

```typescript
GET /api/inventory
  - Lista el inventario del tenant con datos del master_product
  - Filtros: category, search, lowStockOnly
  - Incluye estadísticas de stock

POST /api/inventory
  - Agrega producto del catálogo maestro al inventario del tenant
  - Requiere masterProductId
```

### ✅ 3. `/api/inventory/available-products`
**Productos disponibles para agregar al inventario**

```typescript
GET /api/inventory/available-products
  - Lista productos del catálogo maestro que el tenant NO tiene aún
  - Facilita agregar nuevos productos al inventario
```

### ✅ 4. `/api/inventory/[id]`
**Operaciones específicas sobre items del inventario**

```typescript
GET /api/inventory/[id]
  - Obtiene un item del inventario con sus datos del master_product

PUT /api/inventory/[id]
  - Actualiza campos del inventario (precios, stock, etc.)

DELETE /api/inventory/[id]
  - Elimina el producto del inventario del tenant
```

---

## 🚀 Plan de Activación

### Opción A: Activación Inmediata (Recomendado)
```bash
# 1. Respaldar APIs actuales
mv app/api/products/route.ts app/api/products/route_OLD.ts
mv app/api/products/[id]/route.ts app/api/products/[id]/route_OLD.ts

# 2. Activar nuevas APIs
mv app/api/products/route_NEW.ts app/api/products/route.ts
mv app/api/products/[id]/route_NEW.ts app/api/products/[id]/route.ts
```

### Opción B: Activación Gradual
1. Mantener ambas APIs funcionando
2. Actualizar frontend para usar las nuevas rutas
3. Deprecar las antiguas
4. Eliminar las antiguas después de verificar

---

## 🔍 Cambios en el Frontend

### Componentes que Necesitan Actualización

#### 1. **Módulo de Inventario**
```typescript
// Antes
const products = await fetch('/api/products')

// Después (opción A: mismo endpoint)
const products = await fetch('/api/products') // funciona igual

// Después (opción B: usar inventario directamente)
const inventory = await fetch('/api/inventory')
```

#### 2. **Formulario de Crear Producto**
```typescript
// Antes: Solo requería datos del producto

// Después: Puede referenciar productos del catálogo
{
  masterProductId?: string,  // Si selecciona del catálogo
  // ... o crear nuevo producto
  sku: string,
  name: string,
  category: string,
  // ...
}
```

---

## 📋 Checklist de Migración

### Backend
- [x] Crear tablas `master_products` y `tenant_inventory` (SQL listo)
- [x] Migrar datos existentes (SQL listo)
- [x] Agregar productos chilenos (SQL listo)
- [x] Crear APIs nuevas para `/api/products` (compatible)
- [x] Crear APIs para `/api/admin-saas/master-products`
- [x] Crear APIs para `/api/inventory`

### Frontend
- [ ] Actualizar componente de lista de productos
- [ ] Actualizar formulario de crear/editar producto
- [ ] Agregar selector de catálogo maestro
- [ ] Actualizar módulo de inventario

### Testing
- [ ] Probar CRUD de productos
- [ ] Probar aislamiento entre tenants
- [ ] Probar búsqueda y filtros
- [ ] Verificar cálculos de stock
- [ ] Validar auditoría

---

## 🔐 Consideraciones de Seguridad

### Row Level Security (RLS)
Los scripts SQL incluyen políticas de RLS:

1. **master_products**: Todos pueden leer, solo PROVEEDOR modifica
2. **tenant_inventory**: Cada tenant solo ve su propio inventario

### Validaciones
- ✅ Verificación de `tenantId` en todas las consultas
- ✅ Validación de permisos por rol
- ✅ Auditoría de todos los cambios

---

## 🆘 Rollback Plan

Si algo sale mal:

1. **Revertir APIs**:
   ```bash
   mv app/api/products/route.ts app/api/products/route_NEW.ts
   mv app/api/products/route_OLD.ts app/api/products/route.ts
   mv app/api/products/[id]/route.ts app/api/products/[id]/route_NEW.ts
   mv app/api/products/[id]/route_OLD.ts app/api/products/[id]/route.ts
   ```

2. **La tabla `products` NO se elimina** hasta verificar que todo funciona

3. **Backup disponible** en `/backups/backup_products_LATEST.json`

---

## 📈 Beneficios del Nuevo Modelo

### Para los Tenants
- ✅ Acceso a un catálogo pre-cargado de productos
- ✅ Más rápida la carga inicial de productos
- ✅ Precios y stock independientes por negocio
- ✅ Menos errores de digitación en nombres/categorías

### Para el Proveedor SaaS
- ✅ Gestión centralizada del catálogo maestro
- ✅ Análisis agregado de productos más vendidos
- ✅ Actualizaciones de productos en todos los tenants
- ✅ Mejor experiencia de onboarding

### Técnico
- ✅ Menos duplicación de datos
- ✅ Búsquedas más eficientes
- ✅ Escalabilidad mejorada
- ✅ Mantenimiento simplificado

---

## 🔗 Archivos Relacionados

| Archivo | Descripción |
|---------|-------------|
| `scripts/SQL_CREAR_TABLAS_MAESTRAS.sql` | Crear tablas nuevas |
| `scripts/SQL_MIGRAR_DATOS.sql` | Migrar productos existentes |
| `scripts/SQL_PRODUCTOS_CHILENOS.sql` | Agregar productos típicos |
| `app/api/products/route_NEW.ts` | API de productos (nueva versión) |
| `app/api/products/[id]/route_NEW.ts` | API por ID (nueva versión) |
| `app/api/inventory/route.ts` | API de inventario (ya implementada) |
| `app/api/admin-saas/master-products/route.ts` | API del catálogo maestro |
| `INSTRUCCIONES_EJECUTAR_MIGRACION_SQL.md` | Guía para ejecutar SQL |

---

## ✅ Próximos Pasos

1. ✅ Usuario ejecuta los scripts SQL en Supabase Dashboard
2. ✅ Verificar que las tablas fueron creadas correctamente
3. ✅ Activar las nuevas APIs (renombrar archivos)
4. 🔄 Actualizar componentes del frontend
5. 🔄 Probar funcionalidad end-to-end
6. 🔄 Eliminar tabla `products` antigua (después de validación)

---

**Autor**: DeepAgent AI
**Fecha**: 2025-10-25
**Versión**: 1.0
