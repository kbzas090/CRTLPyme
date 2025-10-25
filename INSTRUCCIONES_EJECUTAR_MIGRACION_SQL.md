# 📋 Instrucciones para Ejecutar la Migración SQL en Supabase

## ⚠️ IMPORTANTE: Leer Antes de Comenzar

Esta migración es **crítica** y **no reversible** fácilmente. Por favor, sigue estos pasos en orden y verifica cada resultado.

### ✅ Pre-requisitos
- [x] Backup de productos creado: `/backups/backup_products_LATEST.json`
- [x] Acceso al Dashboard de Supabase: https://supabase.com/dashboard
- [x] Permisos de administrador en el proyecto de Supabase

---

## 📝 Pasos de Ejecución

### Paso 1: Acceder al SQL Editor de Supabase

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: **bxfetsflhxhigacuqtfe**
3. En el menú lateral, haz clic en **SQL Editor**
4. Haz clic en **New Query**

---

### Paso 2: Crear las Tablas Maestras (5-10 minutos)

#### ✅ Ejecutar Script 1: Crear Tablas

1. Abre el archivo: `scripts/SQL_CREAR_TABLAS_MAESTRAS.sql`
2. **Copia TODO el contenido** del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (o presiona Ctrl+Enter)

#### 🔍 Verificar Resultado

Deberías ver al final:

```
Query executed successfully (multiple queries)
```

Y en la última consulta de verificación, deberías ver:

| table_name | table_type |
|------------|------------|
| master_products | BASE TABLE |
| tenant_inventory | BASE TABLE |

#### ❌ Si hay errores:

- **"relation already exists"**: Las tablas ya existen, puedes continuar
- **Otros errores**: Copia el error completo y contacta soporte

---

### Paso 3: Migrar los Datos Existentes (5-10 minutos)

#### ✅ Ejecutar Script 2: Migrar Datos

1. **Crea una nueva query** en el SQL Editor (Click en + New Query)
2. Abre el archivo: `scripts/SQL_MIGRAR_DATOS.sql`
3. **Copia TODO el contenido** del archivo
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en **Run**

#### 🔍 Verificar Resultado

Al final del script, verás varias consultas de verificación:

1. **Conteo de productos migrados**:
   - Products originales: 72
   - Master Products: 72 (o similar, dependiendo de duplicados)
   - Tenant Inventory: 72

2. **Productos por tenant**:
   | Tenant | Productos en inventario |
   |--------|-------------------------|
   | [Nombre del tenant] | 72 |

3. **Comparación de stock**:
   | Tenant | Stock Original | Stock Migrado | Diferencia |
   |--------|----------------|---------------|------------|
   | [Nombre] | XXXX | XXXX | 0 |

#### ⚠️ Importante:
- La **Diferencia** debe ser **0** (cero)
- Si hay diferencias, **NO CONTINÚES** y reporta el problema

---

### Paso 4: Agregar Productos Chilenos (5 minutos)

#### ✅ Ejecutar Script 3: Productos Chilenos

1. **Crea una nueva query** en el SQL Editor
2. Abre el archivo: `scripts/SQL_PRODUCTOS_CHILENOS.sql`
3. **Copia TODO el contenido** del archivo
4. Pégalo en el SQL Editor
5. Haz clic en **Run**

#### 🔍 Verificar Resultado

Al final verás:

1. **Total productos chilenos agregados**: 30

2. **Listado de productos** con sus categorías y precios

3. **Inventarios creados por tenant**:
   | Tenant | Productos chilenos en inventario |
   |--------|----------------------------------|
   | [Nombre del tenant] | 30 |

4. **Resumen final**:
   - Master Products Total: ~102 (72 originales + 30 chilenos)
   - Productos Chilenos: 30
   - Inventarios de Productos Chilenos: 30 por cada tenant

---

## ✅ Verificación Final

### Consultas de Verificación Manual

Ejecuta estas consultas para asegurarte de que todo está correcto:

#### 1. Verificar catálogo maestro

```sql
SELECT COUNT(*) as total_master_products FROM master_products;
-- Debe ser ~102 (72 migrados + 30 nuevos)
```

#### 2. Verificar inventario del tenant

```sql
SELECT 
    t.name as tenant,
    COUNT(ti.id) as total_productos
FROM tenant_inventory ti
JOIN tenants t ON ti."tenantId" = t.id
GROUP BY t.id, t.name;
-- Debe mostrar ~102 productos por tenant
```

#### 3. Verificar stock total

```sql
SELECT 
    t.name as tenant,
    SUM(ti.stock) as stock_total
FROM tenant_inventory ti
JOIN tenants t ON ti."tenantId" = t.id
GROUP BY t.id, t.name;
-- Verifica que el stock total sea coherente
```

#### 4. Ver productos del catálogo maestro

```sql
SELECT 
    sku,
    name,
    category,
    "suggestedPrice"
FROM master_products
ORDER BY category, name
LIMIT 20;
```

---

## 🚨 Problemas Comunes y Soluciones

### Error: "permission denied"
- **Causa**: La clave API usada no tiene permisos suficientes
- **Solución**: Ejecutar desde el SQL Editor del Dashboard (ya estás haciendo esto)

### Error: "relation already exists"
- **Causa**: Las tablas ya fueron creadas anteriormente
- **Solución**: Puedes continuar con los siguientes pasos

### Error: "duplicate key value violates unique constraint"
- **Causa**: Los datos ya fueron migrados
- **Solución**: Verifica con las consultas de verificación si todo está bien

### Los productos no aparecen en tenant_inventory
- **Causa**: Problema en las foreign keys
- **Solución**: Ejecuta esta consulta para diagnosticar:

```sql
SELECT 
    p.id,
    p.name,
    p.sku,
    mp.id as master_product_id,
    ti.id as inventory_id
FROM products p
LEFT JOIN master_products mp ON p.sku = mp.sku
LEFT JOIN tenant_inventory ti ON (ti."masterProductId" = mp.id AND ti."tenantId" = p."tenantId")
WHERE ti.id IS NULL
LIMIT 10;
```

---

## 📊 Siguiente Paso

Una vez completada la ejecución SQL exitosamente:

1. ✅ Marca este documento como completado
2. ✅ Notifícame para continuar con:
   - Actualización de las APIs
   - Actualización de los componentes del frontend
   - Pruebas de integración

---

## 🆘 Soporte

Si encuentras problemas:

1. **NO ejecutes el script de eliminar** `products` todavía
2. Guarda los mensajes de error completos
3. Ejecuta las consultas de verificación
4. Reporta los resultados para recibir ayuda

---

## 📁 Archivos de la Migración

| Archivo | Descripción | Orden |
|---------|-------------|-------|
| `SQL_CREAR_TABLAS_MAESTRAS.sql` | Crea las tablas master_products y tenant_inventory | 1️⃣ |
| `SQL_MIGRAR_DATOS.sql` | Migra los 72 productos existentes | 2️⃣ |
| `SQL_PRODUCTOS_CHILENOS.sql` | Agrega 30 productos chilenos típicos | 3️⃣ |

---

## ⏱️ Tiempo Estimado Total

- Paso 1: 5-10 minutos
- Paso 2: 5-10 minutos
- Paso 3: 5 minutos
- Verificación: 5 minutos

**Total: 20-30 minutos**

---

**¡Éxito con la migración! 🚀**
