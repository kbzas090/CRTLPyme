# Documentación API - Fase 1 MVP SaaS
## CRTLPyme - Sistema de Gestión Multi-Tenant

Esta documentación describe todos los endpoints API implementados para la Fase 1 del MVP SaaS de CRTLPyme.

---

## Índice

1. [Planes de Suscripción](#1-planes-de-suscripción)
2. [Suscripciones de Tenants](#2-suscripciones-de-tenants)
3. [Procesamiento de Pagos](#3-procesamiento-de-pagos)
4. [Gestión de Tenants](#4-gestión-de-tenants)
5. [Métricas y Dashboard Admin](#5-métricas-y-dashboard-admin)

---

## 1. Planes de Suscripción

### 1.1 Listar Planes de Suscripción

**Endpoint:** `GET /api/subscription-plans`

**Descripción:** Obtiene la lista de planes de suscripción activos y visibles.

**Query Parameters:**
- `all` (opcional): `true` para ver todos los planes, incluso inactivos (solo PROVEEDOR)

**Respuesta exitosa (200):**
```json
{
  "plans": [
    {
      "id": "basic-monthly",
      "name": "Básico Mensual",
      "description": "Plan básico con las funcionalidades esenciales para pequeños negocios",
      "price": 9990,
      "billingCycle": "MONTHLY",
      "trialDays": 14,
      "features": {
        "items": [
          "2 cajas/terminales incluidas",
          "Hasta 5 usuarios",
          "Hasta 500 productos",
          "Ventas ilimitadas"
        ]
      },
      "maxUsers": 5,
      "maxProducts": 500,
      "maxSales": null,
      "isVisible": true,
      "isActive": true,
      "activeSubscriptions": 3
    }
  ],
  "total": 8
}
```

---

### 1.2 Crear Plan de Suscripción

**Endpoint:** `POST /api/subscription-plans`

**Permisos:** Solo PROVEEDOR

**Body:**
```json
{
  "name": "Plan Premium",
  "description": "Plan premium con todas las funcionalidades",
  "price": 29990,
  "billingCycle": "MONTHLY",
  "trialDays": 14,
  "features": {
    "items": ["Feature 1", "Feature 2"]
  },
  "maxUsers": 20,
  "maxProducts": 5000,
  "maxSales": null,
  "isVisible": true,
  "sortOrder": 10
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Plan de suscripción creado exitosamente",
  "plan": {
    "id": "clxxxxxxxx",
    "name": "Plan Premium",
    "price": 29990,
    ...
  }
}
```

---

### 1.3 Obtener Plan Específico

**Endpoint:** `GET /api/subscription-plans/{id}`

**Respuesta exitosa (200):**
```json
{
  "plan": {
    "id": "basic-monthly",
    "name": "Básico Mensual",
    "price": 9990,
    "activeSubscriptions": 3,
    "totalRevenue": 89910,
    ...
  }
}
```

---

### 1.4 Actualizar Plan

**Endpoint:** `PUT /api/subscription-plans/{id}`

**Permisos:** Solo PROVEEDOR

**Body:**
```json
{
  "name": "Básico Mensual - Actualizado",
  "price": 10990,
  "isActive": true
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Plan actualizado exitosamente",
  "plan": {...}
}
```

---

### 1.5 Desactivar Plan

**Endpoint:** `DELETE /api/subscription-plans/{id}`

**Permisos:** Solo PROVEEDOR

**Respuesta exitosa (200):**
```json
{
  "message": "Plan desactivado exitosamente",
  "plan": {...}
}
```

---

## 2. Suscripciones de Tenants

### 2.1 Listar Suscripciones

**Endpoint:** `GET /api/subscriptions`

**Query Parameters:**
- `status` (opcional): Filtrar por estado (ACTIVE, TRIAL, CANCELLED, EXPIRED, SUSPENDED)
- `tenantId` (opcional): Filtrar por tenant (solo PROVEEDOR)

**Permisos:**
- PROVEEDOR: Puede ver todas las suscripciones
- Otros roles: Solo pueden ver su propia suscripción

**Respuesta exitosa (200):**
```json
{
  "subscriptions": [
    {
      "id": "clxxxxxxxx",
      "tenantId": "clxxxxxxxx",
      "planId": "basic-monthly",
      "status": "ACTIVE",
      "startDate": "2024-01-01T00:00:00.000Z",
      "nextBillingDate": "2024-02-01T00:00:00.000Z",
      "billingCycle": "MONTHLY",
      "autoRenew": true,
      "plan": {
        "name": "Básico Mensual",
        "price": 9990
      },
      "tenant": {
        "businessName": "Mi Negocio",
        "email": "contacto@minegocio.cl"
      },
      "totalPaid": 29970,
      "lastPayment": {...}
    }
  ],
  "total": 10
}
```

---

### 2.2 Crear Suscripción

**Endpoint:** `POST /api/subscriptions`

**Permisos:** Solo PROVEEDOR

**Body:**
```json
{
  "tenantId": "clxxxxxxxx",
  "planId": "basic-monthly",
  "billingCycle": "MONTHLY",
  "trialDays": 14,
  "discountPercent": 10,
  "discountEndsAt": "2024-12-31T23:59:59.000Z",
  "autoRenew": true
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Suscripción creada exitosamente",
  "subscription": {
    "id": "clxxxxxxxx",
    "tenantId": "clxxxxxxxx",
    "planId": "basic-monthly",
    "status": "TRIAL",
    "startDate": "2024-11-06T00:00:00.000Z",
    "nextBillingDate": "2024-11-20T00:00:00.000Z",
    "trialEndsAt": "2024-11-20T00:00:00.000Z",
    ...
  }
}
```

---

### 2.3 Obtener Suscripción Específica

**Endpoint:** `GET /api/subscriptions/{id}`

**Respuesta exitosa (200):**
```json
{
  "subscription": {
    "id": "clxxxxxxxx",
    "tenantId": "clxxxxxxxx",
    "planId": "basic-monthly",
    "status": "ACTIVE",
    "plan": {...},
    "tenant": {...},
    "payments": [...],
    "stats": {
      "totalPaid": 89910,
      "successfulPayments": 9,
      "failedPayments": 0
    }
  }
}
```

---

### 2.4 Actualizar Suscripción

**Endpoint:** `PUT /api/subscriptions/{id}`

**Permisos:** Solo PROVEEDOR

**Body:**
```json
{
  "planId": "pro-monthly",
  "status": "ACTIVE",
  "billingCycle": "MONTHLY",
  "discountPercent": 15,
  "autoRenew": true
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Suscripción actualizada exitosamente",
  "subscription": {...}
}
```

---

### 2.5 Cancelar Suscripción

**Endpoint:** `DELETE /api/subscriptions/{id}?reason=Motivo`

**Permisos:** Solo PROVEEDOR

**Query Parameters:**
- `reason` (opcional): Motivo de la cancelación

**Respuesta exitosa (200):**
```json
{
  "message": "Suscripción cancelada exitosamente",
  "subscription": {
    "id": "clxxxxxxxx",
    "status": "CANCELLED",
    "cancelledAt": "2024-11-06T12:00:00.000Z",
    "cancellationReason": "Motivo de cancelación"
  }
}
```

---

## 3. Procesamiento de Pagos

### 3.1 Iniciar Pago

**Endpoint:** `POST /api/payments/initiate`

**Descripción:** Inicia un pago de suscripción con Transbank.

**Body:**
```json
{
  "subscriptionId": "clxxxxxxxx"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "paymentId": "clxxxxxxxx",
  "token": "e9d555262db0f989e49d724b4db0b0af367cc415cde41f500a776550fc5fddd4",
  "url": "https://webpay3gint.transbank.cl/webpayserver/initTransaction",
  "amount": 9990
}
```

**Uso:**
Redirigir al usuario a la URL retornada con el token como parámetro `token_ws`:
```
{url}?token_ws={token}
```

---

### 3.2 Confirmar Pago

**Endpoint:** `GET/POST /api/payments/confirm?token_ws={token}`

**Descripción:** Confirma un pago después de que el usuario regrese de Transbank. Este endpoint es llamado automáticamente por Transbank.

**Query Parameters:**
- `token_ws`: Token de la transacción retornado por Transbank

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "payment": {
    "id": "clxxxxxxxx",
    "amount": 9990,
    "status": "APPROVED",
    "transactionDate": "2024-11-06T12:00:00.000Z"
  },
  "redirectUrl": "/subscription/payment-success"
}
```

**Respuesta de fallo (200):**
```json
{
  "success": false,
  "error": "Transacción rechazada (código: 1)",
  "redirectUrl": "/subscription/payment-failed"
}
```

---

### 3.3 Historial de Pagos

**Endpoint:** `GET /api/payments/history`

**Query Parameters:**
- `tenantId` (opcional): Filtrar por tenant (solo PROVEEDOR)
- `status` (opcional): Filtrar por estado (PENDING, APPROVED, REJECTED, FAILED, REFUNDED)
- `limit` (opcional): Número de resultados (default: 50)
- `offset` (opcional): Offset para paginación (default: 0)

**Permisos:**
- PROVEEDOR: Puede ver todos los pagos
- Otros roles: Solo pueden ver sus propios pagos

**Respuesta exitosa (200):**
```json
{
  "payments": [
    {
      "id": "clxxxxxxxx",
      "subscriptionId": "clxxxxxxxx",
      "tenantId": "clxxxxxxxx",
      "amount": 9990,
      "currency": "CLP",
      "status": "APPROVED",
      "paymentDate": "2024-11-06T12:00:00.000Z",
      "cardLast4": "1234",
      "cardType": "Visa",
      "subscription": {
        "plan": {
          "name": "Básico Mensual"
        }
      },
      "tenant": {
        "businessName": "Mi Negocio"
      }
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0,
  "hasMore": true
}
```

---

## 4. Gestión de Tenants

### 4.1 Listar Tenants

**Endpoint:** `GET /api/admin-saas/tenants`

**Permisos:** Solo PROVEEDOR

**Respuesta exitosa (200):**
```json
{
  "tenants": [
    {
      "id": "clxxxxxxxx",
      "businessName": "Mi Negocio",
      "rut": "12345678-9",
      "email": "contacto@minegocio.cl",
      "planType": "BASIC",
      "isActive": true,
      "accountStatus": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "stats": {
        "totalUsers": 3,
        "totalProducts": 45,
        "totalSales": 150,
        "salesAmount": 1500000,
        "lowStockProducts": 5
      },
      "users": [...]
    }
  ],
  "total": 25
}
```

---

### 4.2 Crear Tenant

**Endpoint:** `POST /api/admin-saas/tenants`

**Permisos:** Solo PROVEEDOR

**Body:**
```json
{
  "businessName": "Nuevo Negocio",
  "rut": "98765432-1",
  "email": "nuevo@negocio.cl",
  "phone": "+56912345678",
  "address": "Calle Principal 123",
  "planType": "BASIC",
  "maxCashiers": 2
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Tenant creado exitosamente",
  "tenant": {
    "id": "clxxxxxxxx",
    "businessName": "Nuevo Negocio",
    ...
  }
}
```

---

### 4.3 Obtener Tenant Específico

**Endpoint:** `GET /api/admin-saas/tenants/{id}`

**Permisos:** Solo PROVEEDOR

**Respuesta exitosa (200):**
```json
{
  "tenant": {
    "id": "clxxxxxxxx",
    "businessName": "Mi Negocio",
    "rut": "12345678-9",
    "email": "contacto@minegocio.cl",
    "stats": {...},
    "users": [...],
    "products": [...],
    "subscription": {...}
  }
}
```

---

### 4.4 Activar Tenant

**Endpoint:** `POST /api/admin-saas/tenants/{id}/activate`

**Permisos:** Solo PROVEEDOR

**Descripción:** Activa un tenant que estaba suspendido o bloqueado.

**Respuesta exitosa (200):**
```json
{
  "message": "Tenant activado exitosamente",
  "tenant": {
    "id": "clxxxxxxxx",
    "isActive": true,
    "accountStatus": "ACTIVE",
    ...
  }
}
```

**Efectos:**
- Activa el tenant (isActive = true, accountStatus = ACTIVE)
- Reactiva sus suscripciones suspendidas
- Registra la acción en audit logs
- Envía email de reactivación al tenant

---

### 4.5 Suspender Tenant

**Endpoint:** `POST /api/admin-saas/tenants/{id}/suspend`

**Permisos:** Solo PROVEEDOR

**Body:**
```json
{
  "reason": "Pago pendiente desde hace 30 días"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Tenant suspendido exitosamente",
  "tenant": {
    "id": "clxxxxxxxx",
    "isActive": false,
    "accountStatus": "SUSPENDED",
    ...
  }
}
```

**Efectos:**
- Suspende el tenant (isActive = false, accountStatus = SUSPENDED)
- Suspende sus suscripciones activas
- Registra la acción en audit logs con el motivo
- Envía email de suspensión al tenant

---

### 4.6 Cambiar Plan de Tenant

**Endpoint:** `POST /api/admin-saas/tenants/{id}/change-plan`

**Permisos:** Solo PROVEEDOR

**Body:**
```json
{
  "newPlanId": "pro-monthly",
  "effectiveDate": "2024-12-01T00:00:00.000Z",
  "reason": "Upgrade solicitado por el cliente"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Plan cambiado exitosamente",
  "subscription": {...},
  "oldPlan": "Básico Mensual",
  "newPlan": "Profesional Mensual"
}
```

**Efectos:**
- Actualiza la suscripción del tenant con el nuevo plan
- Actualiza el planType del tenant
- Registra la acción en audit logs
- Envía email de cambio de plan al tenant

---

## 5. Métricas y Dashboard Admin

### 5.1 Obtener Métricas Completas

**Endpoint:** `GET /api/admin-saas/metrics`

**Permisos:** Solo PROVEEDOR

**Query Parameters:**
- `period` (opcional): Período para las métricas (day, week, month, year). Default: month

**Respuesta exitosa (200):**
```json
{
  "period": "month",
  "dateRange": {
    "from": "2024-11-01T00:00:00.000Z",
    "to": "2024-11-06T12:00:00.000Z"
  },
  "tenants": {
    "total": 25,
    "active": 22,
    "trial": 3,
    "suspended": 0,
    "newInPeriod": 2
  },
  "subscriptions": {
    "byStatus": {
      "ACTIVE": 18,
      "TRIAL": 3,
      "CANCELLED": 1,
      "EXPIRED": 0,
      "SUSPENDED": 0
    },
    "byPlan": [
      {
        "planName": "Básico Mensual",
        "count": 10
      },
      {
        "planName": "Profesional Mensual",
        "count": 8
      }
    ],
    "newInPeriod": 2,
    "cancelledInPeriod": 0,
    "upcomingRenewals": 5
  },
  "revenue": {
    "total": 1500000,
    "periodRevenue": 180000,
    "monthly": 180000,
    "quarterly": 540000,
    "annual": 2160000,
    "mrr": 180000,
    "arpu": 68181.82
  },
  "payments": {
    "successful": 150,
    "failed": 2,
    "pending": 0,
    "successRate": 98.68,
    "totalInPeriod": 18
  },
  "growth": {
    "churnRate": 0.00,
    "avgLifetimeValue": 85000
  },
  "billingCycles": [
    {
      "cycle": "MONTHLY",
      "count": 15
    },
    {
      "cycle": "QUARTERLY",
      "count": 4
    },
    {
      "cycle": "ANNUAL",
      "count": 3
    }
  ],
  "topCustomers": [
    {
      "id": "clxxxxxxxx",
      "businessName": "Negocio Top 1",
      "email": "top1@negocio.cl",
      "planType": "ENTERPRISE",
      "totalPaid": 250000
    }
  ]
}
```

---

### 5.2 Obtener Estadísticas Generales

**Endpoint:** `GET /api/admin-saas/stats`

**Permisos:** Solo PROVEEDOR

**Respuesta exitosa (200):**
```json
{
  "overview": {
    "tenantsActive": 22,
    "tenantsInactive": 3,
    "tenantsTotal": 25,
    "recentTenants": 2,
    "totalUsers": 75,
    "totalProducts": 1250,
    "totalSales": 5000,
    "totalSalesAmount": 50000000
  },
  "usersByRole": [
    {
      "role": "ADMIN",
      "count": 25
    },
    {
      "role": "CAJA",
      "count": 35
    },
    {
      "role": "INVENTARIO",
      "count": 15
    }
  ],
  "planDistribution": [
    {
      "plan": "BASIC",
      "count": 15
    },
    {
      "plan": "PRO",
      "count": 8
    },
    {
      "plan": "ENTERPRISE",
      "count": 2
    }
  ],
  "topTenants": [
    {
      "id": "clxxxxxxxx",
      "businessName": "Negocio Top 1",
      "rut": "12345678-9",
      "planType": "ENTERPRISE",
      "totalSales": 5000000,
      "salesCount": 500
    }
  ]
}
```

---

## Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos para acceder al recurso
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej: recurso duplicado)
- `500 Internal Server Error`: Error del servidor

---

## Autenticación

Todos los endpoints requieren autenticación mediante NextAuth. El usuario debe estar autenticado y tener el rol apropiado.

**Roles:**
- `PROVEEDOR`: Administrador SaaS, acceso completo
- `ADMIN`: Administrador de tenant, acceso a su propio tenant
- `CAJA`: Operador de punto de venta
- `INVENTARIO`: Encargado de inventario

---

## Notificaciones por Email

El sistema envía automáticamente emails en los siguientes eventos:

1. **Bienvenida**: Cuando se crea un nuevo tenant
2. **Pago exitoso**: Cuando se procesa un pago correctamente
3. **Pago fallido**: Cuando falla un pago
4. **Recordatorio de renovación**: 7 días antes de la renovación
5. **Cambio de plan**: Cuando se cambia el plan de suscripción
6. **Cuenta suspendida**: Cuando se suspende un tenant
7. **Cuenta reactivada**: Cuando se reactiva un tenant

Todos los emails son enviados mediante SendGrid.

---

## Integración con Transbank

El sistema utiliza Transbank Webpay Plus en modo sandbox para procesamiento de pagos.

**Credenciales de Integración:**
- Commerce Code: `597055555532`
- API Key: `579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C`

**Tarjetas de prueba:**
- Número: `4051 8856 0012 3993`
- CVV: `123`
- Fecha: Cualquier fecha futura

**Flujo de pago:**
1. Cliente inicia pago: `POST /api/payments/initiate`
2. Sistema crea transacción en Transbank y retorna URL
3. Cliente es redirigido a Transbank para pagar
4. Transbank redirige a: `GET /api/payments/confirm?token_ws={token}`
5. Sistema confirma y registra el pago
6. Cliente es redirigido a página de confirmación

---

## Notas Importantes

1. **Multi-tenancy**: Todos los datos están aislados por tenant. Las queries automáticamente filtran por tenantId.

2. **Audit Logs**: Todas las acciones importantes se registran en la tabla `audit_logs` para trazabilidad.

3. **Soft Delete**: Los recursos no se eliminan físicamente, se marcan como inactivos.

4. **Pruebas locales**: Para probar localmente, configurar el archivo `.env` con las credenciales apropiadas.

5. **Despliegue**: Para producción, configurar los secrets en GCP Secret Manager.

---

## Soporte

Para más información o soporte, contactar a: support@crtlpyme.cl
