# 🚀 Transbank - Inicio Rápido

## ⚡ Quick Start (5 minutos)

### 1. Verificar Variables de Entorno

```bash
# Las credenciales ya están en .env
cat .env | grep TRANSBANK
```

Deberías ver:
```
TRANSBANK_API_KEY="579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C"
TRANSBANK_COMMERCE_CODE="597055555532"
TRANSBANK_ENVIRONMENT="integration"
```

### 2. Ejecutar Seed de Planes

```bash
npm run seed:plans
```

Esto creará 8 planes de suscripción en la base de datos.

### 3. Iniciar el Servidor

```bash
npm run dev
```

### 4. Probar el Flujo de Pago

1. **Ir a la página de planes:**
   ```
   http://localhost:3000/subscriptions/plans
   ```

2. **Seleccionar un plan** (ej: Plan Básico - Mensual)

3. **Usar tarjeta de prueba aprobada:**
   - Número: `4051885600446623`
   - CVV: `123`
   - Fecha: Cualquier fecha futura
   - RUT: `11.111.111-1`

4. **Completar el pago** en Transbank

5. **Verificar redirección** a página de éxito

### 5. Verificar en Base de Datos

```sql
-- Ver suscripciones activas
SELECT * FROM subscriptions WHERE status = 'ACTIVE';

-- Ver pagos completados
SELECT * FROM subscription_payments WHERE status = 'COMPLETED';
```

---

## 📁 Archivos Implementados

### Backend
- ✅ `/lib/transbank.ts` - Helper de Transbank
- ✅ `/app/api/subscriptions/plans/route.ts` - GET planes
- ✅ `/app/api/subscriptions/payment/init/route.ts` - POST iniciar pago
- ✅ `/app/api/subscriptions/payment/callback/route.ts` - GET/POST callback

### Frontend
- ✅ `/components/subscriptions/SubscriptionPlans.tsx` - Componente de planes
- ✅ `/app/subscriptions/plans/page.tsx` - Página de planes
- ✅ `/app/subscriptions/payment/success/page.tsx` - Página de éxito
- ✅ `/app/subscriptions/payment/error/page.tsx` - Página de error

### Datos
- ✅ `/prisma/seed-subscription-plans.ts` - Seed de planes

---

## 🎯 API Endpoints

### GET /api/subscriptions/plans
Obtiene todos los planes disponibles.

```bash
curl http://localhost:3000/api/subscriptions/plans
```

### POST /api/subscriptions/payment/init
Inicia una transacción de pago.

```bash
curl -X POST http://localhost:3000/api/subscriptions/payment/init \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "clxxx...",
    "tenantId": "clxxx..."
  }'
```

### GET /api/subscriptions/payment/callback?token_ws=xxx
Procesa el callback de Transbank (automático).

---

## 💳 Tarjetas de Prueba

### Aprobada ✅
- **Número:** 4051885600446623
- **CVV:** 123
- **Resultado:** Transacción aprobada

### Rechazada ❌
- **Número:** 5186059559590568
- **CVV:** 123
- **Resultado:** Transacción rechazada

---

## 🐛 Troubleshooting Rápido

### Error al iniciar pago
```bash
# Verificar que el usuario esté autenticado
# Verificar que el tenantId exista
```

### Error en callback
```bash
# Verificar logs del servidor
npm run dev
# Buscar líneas con 🔍 o ❌
```

### Base de datos
```bash
# Verificar conexión
npx prisma db push

# Ejecutar seed nuevamente
npm run seed:plans
```

---

## 📖 Documentación Completa

Ver: `TRANSBANK_IMPLEMENTATION_GUIDE.md`

---

## ✅ Checklist de Testing

- [ ] Seed de planes ejecutado
- [ ] Servidor iniciado en puerto 3000
- [ ] Página de planes carga correctamente
- [ ] Pago con tarjeta aprobada funciona
- [ ] Redirección a página de éxito
- [ ] Suscripción creada en BD con status ACTIVE
- [ ] Pago registrado en BD con status COMPLETED

---

**🎉 ¡Listo para el MVP!**
