# ⚡ ACCIONES RÁPIDAS - Solución Seed CRTLPyme

## 🎯 SITUACIÓN ACTUAL

**Problema:** La landing page muestra "No hay planes disponibles en este momento"  
**Causa:** La base de datos necesita ser poblada con planes de suscripción y datos de demostración  
**Solución:** Ejecutar el script de población de datos (seed)

---

## 🚀 OPCIÓN 1: SOLUCIÓN RÁPIDA (Solo Planes) - 5 minutos

Si solo necesitas que aparezcan los planes en la landing page:

```bash
cd /home/ubuntu/CRTLPyme
npx ts-node prisma/seed-subscription-plans.ts
```

**Esto creará:**
- ✅ 3 planes de suscripción (Básico, Pro, Enterprise)
- ✅ Precios y características configurados
- ✅ Landing page funcional inmediatamente

**Ventajas:**
- Muy rápido (< 1 minuto)
- Sin riesgos
- No requiere archivos adicionales

---

## 🏗️ OPCIÓN 2: POBLACIÓN COMPLETA (Recomendado) - 30 minutos

Para tener un sistema completamente funcional con datos de demostración:

### Paso 1: Generar productos (2 minutos)
```bash
cd /home/ubuntu
npx ts-node generar_productos_chile.ts
```

### Paso 2: Verificar que el archivo se creó
```bash
ls -lh /home/ubuntu/productos_chile.json
```

### Paso 3: Ejecutar el seed completo (10-15 minutos)
```bash
cd /home/ubuntu/CRTLPyme
npx ts-node prisma/seed-complete.ts
```

**Esto creará:**
- ✅ 3 planes de suscripción
- ✅ 500 productos en el catálogo maestro
- ✅ 13 negocios PyME chilenos de prueba
- ✅ 27-40 usuarios de prueba
- ✅ 650-2,600 productos en inventarios
- ✅ 650-3,900 ventas históricas (3 meses)
- ✅ 13 suscripciones activas
- ✅ Movimientos de inventario

### Paso 4: Verificar resultados
```bash
# Acceder a Prisma Studio para ver los datos
cd /home/ubuntu/CRTLPyme
npx prisma studio
```

Abre tu navegador en: http://localhost:5555

---

## 🔐 CREDENCIALES QUE SE CREARÁN

### Administrador de Plataforma
```
Email: admin@crtlpyme.com
Contraseña: Admin2025!
Rol: Super Admin
```

### Usuarios de Negocios de Prueba
```
Email: admin@minimarketdonluis.cl
Contraseña: Demo2025!

Email: admin@gmail.com (Almacén El Rinconcito)
Contraseña: Demo2025!

... (y más negocios)
```

---

## ✅ VERIFICACIÓN POST-EJECUCIÓN

### 1. Verificar planes en la base de datos
```bash
cd /home/ubuntu/CRTLPyme
npx prisma studio
```
- Ir a tabla `subscription_plans`
- Deberías ver 3 registros

### 2. Verificar landing page
- Acceder a: https://crtlpyme-ean57to77a-uc.a.run.app
- Los planes deberían aparecer correctamente
- Verificar tabs "Mensual" y "Anual"

### 3. Probar login (si ejecutaste seed completo)
- Email: `admin@crtlpyme.com`
- Contraseña: `Admin2025!`

---

## ⚠️ ADVERTENCIAS IMPORTANTES

### ❌ NO HACER
- ❌ **NO ejecutar con flag `--clean`** (borra todos los datos)
- ❌ **NO ejecutar múltiples veces** sin verificar primero
- ❌ **NO usar en producción** sin revisión

### ✅ SEGURO PARA
- ✅ Entorno de desarrollo
- ✅ Entorno de staging
- ✅ Demostración a clientes
- ✅ Pruebas de funcionalidad

---

## 🔧 RESOLUCIÓN DE PROBLEMAS

### Error: "productos_chile.json no encontrado"
```bash
# Generar el archivo primero
cd /home/ubuntu
npx ts-node generar_productos_chile.ts
```

### Error: "Cannot find module bcryptjs"
```bash
cd /home/ubuntu/CRTLPyme
npm install bcryptjs
npm install @types/bcryptjs --save-dev
```

### Error: "Connection refused" (Base de datos)
```bash
# Verificar que Cloud SQL Proxy esté corriendo
ps aux | grep cloud-sql-proxy

# Si no está corriendo, iniciarlo
cd /home/ubuntu
./cloud-sql-proxy crtlpyme-477300:us-central1:crtlpyme-db \
  --credentials-file=/home/ubuntu/gcp-service-account.json &
```

### Los planes no aparecen después del seed
```bash
# 1. Verificar en la base de datos
cd /home/ubuntu/CRTLPyme
npx prisma studio
# Abrir tabla subscription_plans

# 2. Verificar logs del servidor Next.js
# Si el servidor está corriendo, revisar la consola

# 3. Hacer rebuild y redeploy
cd /home/ubuntu/CRTLPyme
npm run build
git add .
git commit -m "feat: add subscription plans seed data"
git push origin main
```

---

## 📞 PRÓXIMOS PASOS SUGERIDOS

1. **¿Qué opción prefieres?**
   - [ ] Opción 1: Solo planes (rápido, 5 min)
   - [ ] Opción 2: Población completa (completo, 30 min)

2. **¿Necesitas ayuda con la ejecución?**
   - Puedo ejecutar los comandos paso a paso
   - Puedo monitorear y resolver cualquier error
   - Puedo verificar los resultados

3. **¿Quieres hacer backup primero?**
   - Recomendado si hay datos existentes
   - Puedo crear un backup de la base de datos

---

## 📊 TIEMPO ESTIMADO

| Tarea | Tiempo |
|-------|--------|
| Opción 1: Solo planes | 5 minutos |
| Opción 2: Generar productos | 2 minutos |
| Opción 2: Ejecutar seed completo | 10-15 minutos |
| Opción 2: Verificación | 5 minutos |
| **Total Opción 1** | **5 minutos** |
| **Total Opción 2** | **22-27 minutos** |

---

## 💡 RECOMENDACIÓN

Para resolver rápidamente el problema de la landing page:
1. **Ejecutar Opción 1 primero** (solo planes) → 5 minutos
2. Verificar que la landing funcione
3. **Después ejecutar Opción 2** (datos completos) cuando tengas más tiempo

Esto te permite tener la landing funcional inmediatamente mientras preparas el resto del sistema.

---

**¿Deseas que proceda con alguna de estas opciones?** 🚀
