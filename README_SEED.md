# 🌱 Script de Población de Datos - CRTLPyme

## ✨ ¡Script Listo para Usar!

El script completo de población de datos está listo y disponible en `prisma/seed-complete.ts`.

## 🚀 Ejecución Rápida

### Paso 1: Verificar Base de Datos
```bash
# Verificar conexión
cat .env | grep DATABASE_URL

# Probar con Prisma Studio
npx prisma studio
```

### Paso 2: Ejecutar Script
```bash
# Opción 1: Mantener datos existentes (RECOMENDADO)
npm run seed:complete

# Opción 2: Limpiar todo y poblar desde cero (⚠️ ELIMINA TODO)
npm run seed:complete:clean
```

## 📦 Qué Genera el Script

| Elemento | Cantidad | Detalles |
|----------|----------|----------|
| **Productos** | 500 | Del archivo productos_chile.json |
| **Negocios PyME** | 13 | Negocios chilenos realistas |
| **Usuarios** | 35+ | Admin + empleados por negocio |
| **Inventario** | 1,500+ | 50-200 productos por negocio |
| **Ventas** | 2,000+ | Últimos 3 meses |
| **Movimientos** | 150+ | Compras, mermas, correcciones |
| **Suscripciones** | 13 | Activas con historial |

## 🔐 Credenciales Generadas

### Admin de Plataforma
```
Email: admin@crtlpyme.com
Contraseña: Admin2025!
Rol: PROVEEDOR (Super Admin)
```

### Usuarios de Negocios
```
Contraseña: Demo2025! (para todos)
Email: admin@[dominio-del-negocio]

Ejemplos:
- admin@minimarketdonluis.cl
- admin@elrinconcito@gmail.com
- admin@superfamiliar.cl
```

## 📚 Documentación

- **Guía Completa:** [`SEED_DOCUMENTATION.md`](./SEED_DOCUMENTATION.md)
- **Guía Rápida:** [`QUICKSTART_SEED.md`](./QUICKSTART_SEED.md)

## ⏱️ Tiempo de Ejecución

- **Duración:** 3-5 minutos
- **Progreso:** Se muestra en consola en tiempo real

## 🎯 Casos de Uso

✅ **Desarrollo Local**
```bash
npm run seed:complete:clean
npm run dev
```

✅ **Testing Automatizado**
```bash
# Antes de cada suite de tests
npm run seed:complete:clean
```

✅ **Demo para Cliente**
```bash
npm run seed:complete:clean
# Datos realistas y coherentes listos
```

## ⚠️ Notas Importantes

1. **Nunca usar `--clean` en producción**
2. El script usa datos del archivo `/home/ubuntu/productos_chile.json`
3. Todas las contraseñas están hasheadas con bcrypt
4. Los datos son aleatorios pero realistas

## 🐛 Troubleshooting

### Error de Autenticación
```bash
# Verificar credenciales en .env
echo $DATABASE_URL

# Para GCP Cloud SQL:
# 1. IP pública habilitada
# 2. Tu IP en redes autorizadas
# 3. Usuario/contraseña correctos
```

### Error: archivo productos_chile.json no encontrado
```bash
ls -la /home/ubuntu/productos_chile.json
# Si no existe, copiar desde la ubicación correcta
```

### Error: Unique constraint
```bash
# Limpiar y repoblar
npm run seed:complete:clean
```

## 💡 Personalización

Editar `prisma/seed-complete.ts` para:
- Cambiar número de productos (línea ~418)
- Agregar/quitar negocios (array `negociosChilenos`)
- Modificar rango de fechas de ventas (línea ~632)
- Ajustar cantidad de ventas (línea ~651)

## 📝 Archivos del Proyecto

```
CRTLPyme/
├── prisma/
│   └── seed-complete.ts          ← Script principal
├── package.json                  ← Comandos npm agregados
├── SEED_DOCUMENTATION.md         ← Documentación completa
├── QUICKSTART_SEED.md           ← Guía rápida
└── README_SEED.md               ← Este archivo
```

## 🎉 ¡Todo Listo!

El script está **100% funcional** y listo para:
- ✅ Poblar tu base de datos de desarrollo
- ✅ Crear entornos de testing
- ✅ Generar demos para clientes
- ✅ Validar todas las funcionalidades del MVP

---

**Fecha de creación:** 6 de noviembre, 2025  
**Deadline MVP:** 7 de noviembre, 2025  
**Estado:** ✅ LISTO PARA USAR
