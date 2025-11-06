# 🌱 Documentación del Script de Población de Datos - CRTLPyme

## 📋 Descripción General

El script `seed-complete.ts` es un **script completo de población de datos** diseñado para crear un entorno de desarrollo y pruebas completo para CRTLPyme. Este script genera datos realistas y coherentes que simulan un ambiente de producción con múltiples negocios, usuarios, productos y transacciones.

## 🎯 ¿Qué Genera Este Script?

El script crea los siguientes datos:

### 1. **Planes de Suscripción** (3 planes)
- Plan Básico: $9,990 CLP/mes
- Plan Pro: $19,990 CLP/mes
- Plan Enterprise: $49,990 CLP/mes

### 2. **Productos** (500 productos)
- Importados desde `/home/ubuntu/productos_chile.json`
- Incluyen productos reales del mercado chileno
- Con códigos de barras EAN-13, marcas, categorías y precios

### 3. **Usuario Administrador de Plataforma**
- **Email:** `admin@crtlpyme.com`
- **Contraseña:** `Admin2025!`
- **Rol:** PROVEEDOR (Super Admin)
- Acceso completo a la plataforma

### 4. **Negocios PyME** (13 negocios chilenos)
Negocios realistas con:
- Nombres de negocios chilenos típicos (Minimarket, Almacén, Supermercado, etc.)
- RUT chileno válido
- Dirección en Santiago
- Email y teléfono de contacto
- Plan de suscripción asignado (Basic/Pro/Enterprise)
- Estado de cuenta activo

**Ejemplos de negocios:**
- Minimarket Don Luis (Plan Pro)
- Almacén El Rinconcito (Plan Básico)
- Supermercado Los Andes (Plan Enterprise)

### 5. **Usuarios por Negocio** (2-3 usuarios por negocio)
- **1 Administrador** del negocio (rol: ADMIN)
- **1-2 Empleados** (cajeros o encargados de inventario)
- **Contraseña para todos:** `Demo2025!`
- Emails basados en el dominio del negocio

### 6. **Inventario** (50-200 productos por negocio)
Para cada negocio:
- Productos seleccionados aleatoriamente del catálogo maestro
- Precios de costo y venta realistas
- Stock inicial entre 5-100 unidades
- Umbral de reposición configurado

### 7. **Suscripciones Activas**
- Una suscripción por negocio
- Inicio hace 1-6 meses
- Pagos históricos registrados
- Próxima fecha de facturación calculada

### 8. **Ventas Históricas** (50-300 ventas por negocio en 3 meses)
- Distribuidas en los últimos 90 días
- Métodos de pago variados: Efectivo (50%), Débito (30%), Crédito (15%), Transferencia (5%)
- 1-8 productos por venta
- Cálculo de IVA (19%)
- Actualización automática de stock

### 9. **Movimientos de Inventario** (5-15 movimientos por negocio)
- Compras a proveedores
- Mermas y pérdidas
- Correcciones de inventario
- Devoluciones de clientes

## 🚀 Cómo Usar el Script

### Prerequisitos

1. **Base de datos PostgreSQL configurada**
   ```bash
   # Verifica tu archivo .env
   cat .env | grep DATABASE_URL
   ```

2. **Dependencias instaladas**
   ```bash
   npm install
   ```

3. **Migraciones ejecutadas**
   ```bash
   npx prisma migrate dev
   ```

### Ejecución del Script

#### Opción 1: Agregar Datos (Sin eliminar datos existentes)
```bash
npm run seed:complete
```

Este comando:
- ✅ Mantiene los datos existentes
- ✅ Agrega nuevos datos
- ✅ Usa `upsert` para evitar duplicados
- ✅ Seguro para ambientes con datos

#### Opción 2: Limpiar y Poblar (⚠️ ELIMINA TODOS LOS DATOS)
```bash
npm run seed:complete:clean
```

Este comando:
- ⚠️ **ELIMINA TODOS LOS DATOS** de la base de datos
- ✅ Crea un entorno limpio desde cero
- ⚠️ **NO usar en producción**
- ✅ Ideal para desarrollo y testing

### Tiempo de Ejecución

El script tarda aproximadamente **3-5 minutos** en completarse, dependiendo de:
- Velocidad de la base de datos
- Número de ventas generadas
- Recursos del sistema

## 📊 Datos de Salida del Script

Al finalizar, el script muestra un resumen completo:

```
✨ POBLACIÓN DE DATOS COMPLETADA EXITOSAMENTE ✨

📊 RESUMEN:

   ✓ Planes de suscripción: 3
   ✓ Productos en catálogo maestro: 500
   ✓ Negocios PyME: 13
   ✓ Usuarios totales: 35
   ✓ Productos en inventario: 1,500
   ✓ Suscripciones activas: 13
   ✓ Ventas históricas: 2,000+
   ✓ Movimientos de inventario: 150+

🔐 CREDENCIALES DE ACCESO:

   👨‍💼 Administrador de Plataforma:
      Email: admin@crtlpyme.com
      Contraseña: Admin2025!
      Rol: PROVEEDOR (Super Admin)

   👥 Usuarios de Negocios:
      Contraseña para todos: Demo2025!
      Email: admin@[dominio-del-negocio]
```

## 🔐 Credenciales Predefinidas

### Administrador de Plataforma
```
Email: admin@crtlpyme.com
Contraseña: Admin2025!
Rol: PROVEEDOR (acceso total)
```

### Usuarios de Negocios
Todos los usuarios de negocios comparten la misma contraseña:
```
Contraseña: Demo2025!
```

**Ejemplos de emails:**
- `admin@minimarketdonluis.cl` (Administrador del Minimarket Don Luis)
- `admin@elrinconcito@gmail.com` (Administrador del Almacén El Rinconcito)
- `admin@superfamiliar.cl` (Administrador del Supermercado Familiar)

## 🎓 Casos de Uso

### 1. **Desarrollo Local**
```bash
# Primera vez
npm run seed:complete:clean

# Agregar más datos
npm run seed:complete
```

### 2. **Ambiente de Testing**
```bash
# Limpiar y poblar antes de cada suite de tests
npm run seed:complete:clean
```

### 3. **Demo para Cliente**
```bash
# Crear datos de demostración realistas
npm run seed:complete:clean
```

### 4. **Validación de Funcionalidades**
El script genera datos perfectos para validar:
- ✅ Sistema de autenticación multi-tenant
- ✅ Gestión de inventario
- ✅ Punto de venta (POS)
- ✅ Reportes de ventas
- ✅ Dashboard de métricas
- ✅ Sistema de suscripciones

## 🛠️ Personalización del Script

### Modificar Número de Productos Importados
```typescript
// En seed-complete.ts, línea ~418
const productos = await importarProductos(500) // Cambiar a 100, 200, 1000, etc.
```

### Modificar Número de Negocios
```typescript
// Editar el array negociosChilenos en seed-complete.ts
// Agregar o quitar negocios según necesidad
```

### Modificar Rango de Fechas de Ventas
```typescript
// En seed-complete.ts, línea ~632
const diasHistoricos = 90 // Cambiar a 30, 60, 180, etc.
```

### Modificar Número de Ventas por Negocio
```typescript
// En seed-complete.ts, línea ~651
const numVentas = Math.floor(Math.random() * 250) + 50 // Ajustar rango
```

## ⚠️ Advertencias y Consideraciones

### ⚠️ Modo --clean
- **NUNCA usar en producción**
- Elimina TODOS los datos de la base de datos
- No hay forma de recuperar los datos eliminados
- Usar solo en desarrollo local

### 🔒 Seguridad
- Las contraseñas están hasheadas con bcrypt
- En producción, cambiar todas las contraseñas predeterminadas
- Revisar credenciales antes de desplegar

### 💾 Espacio en Base de Datos
- El script genera ~2,000-3,000 registros
- Asegúrate de tener espacio suficiente en PostgreSQL
- En Cloud SQL, verifica los límites de tu plan

### 🔄 Idempotencia
- El script usa `upsert` para planes y productos
- Ejecutar múltiples veces SIN --clean agregará datos duplicados
- Los negocios y ventas se crearán nuevamente

## 🐛 Troubleshooting

### Error: "Cannot find module productos_chile.json"
```bash
# Verificar que el archivo existe
ls -la /home/ubuntu/productos_chile.json

# Copiar el archivo si es necesario
cp /ruta/origen/productos_chile.json /home/ubuntu/
```

### Error: "Unique constraint failed"
```bash
# Limpiar la base de datos y volver a ejecutar
npm run seed:complete:clean
```

### Error: "Database connection failed"
```bash
# Verificar DATABASE_URL en .env
cat .env | grep DATABASE_URL

# Probar conexión directa
npx prisma studio
```

### Script muy lento
```bash
# Reducir número de productos o ventas en el script
# O mejorar recursos de la base de datos
```

## 📝 Mantenimiento del Script

### Actualizar Productos
```bash
# Reemplazar el archivo productos_chile.json
# Y ejecutar de nuevo
npm run seed:complete
```

### Agregar Nuevos Negocios
1. Editar `negociosChilenos` en `seed-complete.ts`
2. Agregar el nuevo negocio con todos sus campos
3. Ejecutar: `npm run seed:complete`

### Modificar Planes de Suscripción
1. Editar función `crearPlanesSuscripcion()` en `seed-complete.ts`
2. Ajustar precios, features, límites
3. Ejecutar: `npm run seed:complete`

## 📚 Referencias

- **Prisma Documentation:** https://www.prisma.io/docs
- **Schema del Proyecto:** `prisma/schema.prisma`
- **Archivo de Productos:** `/home/ubuntu/productos_chile.json`

## 💬 Soporte

Si encuentras problemas o necesitas ayuda:
1. Revisar los logs del script
2. Verificar el estado de la base de datos con `npx prisma studio`
3. Consultar la documentación del proyecto en `/docs`

---

**Última actualización:** Noviembre 6, 2025
**Versión del script:** 1.0.0
**Autor:** Equipo CRTLPyme
