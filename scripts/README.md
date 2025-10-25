# 🛠️ Scripts de Deployment y Verificación

Este directorio contiene scripts útiles para el deployment y verificación del sistema en producción.

---

## 📜 Scripts Disponibles

### 1. `apply-production-migration.sh`
**Propósito**: Aplicar migraciones en la base de datos de producción

**Uso**:
```bash
export DATABASE_URL="postgresql://postgres:CrtlPyme_2025@db.bxfetsflhxhigacuqtfe.supabase.co:5432/postgres"
./scripts/apply-production-migration.sh
```

**Requisitos**:
- DATABASE_URL configurada
- Prisma instalado
- Acceso a la base de datos de producción

---

### 2. `seed-master-products.ts`
**Propósito**: Poblar el catálogo compartido con 30 productos maestros

**Uso**:
```bash
npm run seed:master-products
```

**Productos incluidos**:
- 8 Bebidas (Coca Cola, Sprite, Fanta, etc.)
- 5 Lácteos (Leche, yogurt, mantequilla, etc.)
- 5 Panadería y Snacks
- 6 Abarrotes (Arroz, fideos, aceite, etc.)
- 5 Aseo (Papel higiénico, detergente, etc.)

**Requisitos**:
- DATABASE_URL configurada
- Migraciones aplicadas previamente

---

### 3. `verify-production.ts`
**Propósito**: Verificar el estado de la base de datos de producción

**Uso**:
```bash
npm run verify:prod
```

**Verifica**:
- ✅ Existencia de tablas
- ✅ Productos maestros
- ✅ Inventario por tenant
- ✅ Datos legacy
- ✅ Integridad de ventas
- ✅ Integridad de ajustes de stock
- ✅ Categorías disponibles

**Output esperado**:
```
✅ Productos maestros: 30
✅ Items en inventarios: X
✅ Ventas registradas: X
✅ Ajustes de stock: X
🎉 ¡Todo se ve bien!
```

---

### 4. `apply-migration-prod.ts` / `apply-migration-prod.js`
**Propósito**: Script alternativo de Node.js para aplicar migraciones

**Uso**:
```bash
node scripts/apply-migration-prod.js
```

**Nota**: Generado automáticamente desde el archivo TypeScript

---

## ⚙️ Configuración

Todos los scripts requieren la variable de entorno `DATABASE_URL`:

```bash
export DATABASE_URL="postgresql://postgres:CrtlPyme_2025@db.bxfetsflhxhigacuqtfe.supabase.co:5432/postgres"
```

---

## 🔄 Flujo de Uso Recomendado

```
1. Aplicar migraciones
   > ./scripts/apply-production-migration.sh

2. Poblar productos maestros
   > npm run seed:master-products

3. Verificar estado
   > npm run verify:prod
```

---

## 🐛 Troubleshooting

### "DATABASE_URL no está configurada"
→ Exporta la variable antes de ejecutar el script

### "Can't reach database server"
→ Verifica tu conexión a internet y que Supabase esté accesible

### "Prisma Client not found"
→ Ejecuta `npm install` primero

### "Table already exists"
→ Las migraciones ya fueron aplicadas

---

## 📚 Documentación Relacionada

- `../INSTRUCCIONES_DEPLOYMENT_PRODUCCION.md` - Guía completa de deployment
- `../GUIA_VERIFICACION_VERCEL.md` - Verificación de Vercel
- `../REPORTE_DEPLOYMENT_PRODUCCION.md` - Reporte final

---

**Última actualización**: 2025-10-25
