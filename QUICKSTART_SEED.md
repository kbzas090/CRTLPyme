# 🚀 Guía Rápida: Script de Población de Datos

## ⚡ Uso Rápido

### 1. Verificar Conexión a Base de Datos
```bash
# Verificar que DATABASE_URL esté configurado
cat .env | grep DATABASE_URL

# Probar conexión con Prisma Studio
npx prisma studio
```

### 2. Ejecutar Migraciones (Primera vez)
```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy
# O en desarrollo:
npx prisma migrate dev
```

### 3. Ejecutar Script de Seed

#### ✅ Opción Segura (Mantiene datos existentes)
```bash
npm run seed:complete
```

#### ⚠️ Opción Limpiar Todo (Elimina todos los datos)
```bash
npm run seed:complete:clean
```

## 📋 Checklist Pre-Ejecución

- [ ] Base de datos PostgreSQL accesible
- [ ] Archivo `.env` con `DATABASE_URL` correcto
- [ ] Migraciones de Prisma ejecutadas
- [ ] Archivo `/home/ubuntu/productos_chile.json` existe
- [ ] Dependencias instaladas (`npm install`)

## 🔧 Troubleshooting Rápido

### Error: "Authentication failed"
```bash
# Verificar credenciales de base de datos
echo $DATABASE_URL

# Para GCP Cloud SQL, asegúrate de:
# 1. IP pública habilitada
# 2. IP local agregada a redes autorizadas
# 3. Usuario y contraseña correctos
```

### Error: "Cannot find productos_chile.json"
```bash
# Verificar que el archivo existe
ls -la /home/ubuntu/productos_chile.json

# Si no existe, copiar desde la ubicación correcta
```

### Error: "Unique constraint failed"
```bash
# Opción 1: Limpiar y volver a poblar
npm run seed:complete:clean

# Opción 2: Eliminar manualmente los datos conflictivos
npx prisma studio
```

## 📊 Resultado Esperado

```
✨ POBLACIÓN DE DATOS COMPLETADA EXITOSAMENTE ✨

📊 RESUMEN:
   ✓ Planes de suscripción: 3
   ✓ Productos en catálogo maestro: 500
   ✓ Negocios PyME: 13
   ✓ Usuarios totales: 35+
   ✓ Productos en inventario: 1,500+
   ✓ Suscripciones activas: 13
   ✓ Ventas históricas: 2,000+
   ✓ Movimientos de inventario: 150+

🔐 CREDENCIALES:
   Email: admin@crtlpyme.com
   Contraseña: Admin2025!
```

## 🎯 Próximos Pasos

1. **Iniciar aplicación:** `npm run dev`
2. **Abrir navegador:** http://localhost:3000
3. **Iniciar sesión** con credenciales del admin
4. **Explorar datos** creados

## 💡 Tips

- El script tarda 3-5 minutos en completarse
- Genera datos aleatorios pero realistas
- Todos los usuarios tienen contraseña: `Demo2025!`
- Ventas distribuidas en últimos 3 meses
- Stock actualizado automáticamente

---

Para documentación completa, ver: `SEED_DOCUMENTATION.md`
