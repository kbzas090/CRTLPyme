# CRTLPyme - Reporte Detallado de Módulos y Funcionalidades

## 📋 ÍNDICE
1. [Módulos de Administración (Tenant)](#módulos-de-administración-tenant)
2. [Módulos de Administración SaaS (Plataforma)](#módulos-de-administración-saas-plataforma)
3. [Estructura de APIs por Categoría](#estructura-de-apis-por-categoría)
4. [Relaciones de Base de Datos](#relaciones-de-base-de-datos)
5. [Funcionalidades Principales](#funcionalidades-principales)

---

## 🏢 MÓDULOS DE ADMINISTRACIÓN (Tenant)

Estos son los módulos disponibles para cada empresa/tenant:

### Sesión de Caja
- **Ruta:** `/admin/cash-session`
- **Nombre técnico:** `cash-session`

### 
          Bienvenido, {session.user.firstName} {session.user.lastName}
        
- **Ruta:** `/admin/dashboard`
- **Nombre técnico:** `dashboard`

### Historial de Ventas
- **Ruta:** `/admin/sales`
- **Nombre técnico:** `sales`

### Punto de Venta
- **Ruta:** `/admin/pos`
- **Nombre técnico:** `pos`

### Inventario
- **Ruta:** `/admin/inventory`
- **Nombre técnico:** `inventory`

### Configuración
- **Ruta:** `/admin/settings`
- **Nombre técnico:** `settings`

### Centro de Reportería
- **Ruta:** `/admin/reports`
- **Nombre técnico:** `reports`


---

## 🌐 MÓDULOS DE ADMINISTRACIÓN SAAS (Plataforma)

Módulos para administración de la plataforma SaaS:

- **Subscriptions**: `/admin-saas/subscriptions`
- **Revenue**: `/admin-saas/revenue`
- **Plans**: `/admin-saas/plans`
- **Master Products**: `/admin-saas/master-products`
- **Tenants**: `/admin-saas/tenants`
- **Stats**: `/admin-saas/stats`

---

## 🔌 ESTRUCTURA DE APIs POR CATEGORÍA

### ADMIN-SAAS

- `/api/admin-saas/master-products` - **Métodos:** GET, POST
- `/api/admin-saas/master-products/[id]` - **Métodos:** GET, PUT, DELETE
- `/api/admin-saas/tenants` - **Métodos:** GET, POST
- `/api/admin-saas/tenants/[id]` - **Métodos:** GET, PUT, DELETE
- `/api/admin-saas/tenants/[id]/products` - **Métodos:** GET
- `/api/admin-saas/tenants/[id]/users` - **Métodos:** GET
- `/api/admin-saas/tenants/[id]/suspend` - **Métodos:** POST
- `/api/admin-saas/tenants/[id]/change-plan` - **Métodos:** POST
- `/api/admin-saas/tenants/[id]/activate` - **Métodos:** POST
- `/api/admin-saas/metrics` - **Métodos:** GET
- `/api/admin-saas/stats` - **Métodos:** GET

### AUTH

- `/api/auth/register` - **Métodos:** POST
- `/api/auth/[...nextauth]` - **Métodos:** N/A

### CASH-SESSIONS

- `/api/cash-sessions` - **Métodos:** GET, POST
- `/api/cash-sessions/active` - **Métodos:** GET
- `/api/cash-sessions/[id]/close` - **Métodos:** POST

### CRON

- `/api/cron/subscription-tasks` - **Métodos:** GET, POST

### DEMO

- `/api/demo` - **Métodos:** POST

### INIT-DB

- `/api/init-db` - **Métodos:** POST

### INVENTORY

- `/api/inventory` - **Métodos:** GET, POST
- `/api/inventory/available-products` - **Métodos:** GET
- `/api/inventory/movements` - **Métodos:** GET, POST
- `/api/inventory/[id]` - **Métodos:** GET, PUT, DELETE

### ONBOARDING

- `/api/onboarding` - **Métodos:** POST

### PAYMENTS

- `/api/payments/history` - **Métodos:** GET
- `/api/payments/confirm` - **Métodos:** GET, POST
- `/api/payments/initiate` - **Métodos:** POST

### PRODUCTS

- `/api/products` - **Métodos:** GET, POST
- `/api/products/[id]` - **Métodos:** GET, PUT, DELETE

### PUBLIC

- `/api/public/plans` - **Métodos:** GET

### REPORTS

- `/api/reports/sales` - **Métodos:** GET
- `/api/reports/products` - **Métodos:** GET
- `/api/reports/export` - **Métodos:** GET
- `/api/reports/customers` - **Métodos:** GET

### SAAS

- `/api/saas/subscriptions` - **Métodos:** GET
- `/api/saas/subscriptions/recent` - **Métodos:** GET
- `/api/saas/subscriptions/renewals` - **Métodos:** GET
- `/api/saas/revenue` - **Métodos:** GET
- `/api/saas/plans` - **Métodos:** GET, POST
- `/api/saas/plans/[id]` - **Métodos:** PUT, DELETE
- `/api/saas/metrics` - **Métodos:** GET

### SALES

- `/api/sales` - **Métodos:** GET, POST
- `/api/sales/[id]` - **Métodos:** GET
- `/api/sales/stats` - **Métodos:** GET

### SETTINGS

- `/api/settings/pos` - **Métodos:** GET, PUT
- `/api/settings/users` - **Métodos:** GET, POST, PUT, DELETE
- `/api/settings/notifications` - **Métodos:** GET, PUT
- `/api/settings/subscription` - **Métodos:** GET
- `/api/settings/subscription/upgrade` - **Métodos:** POST
- `/api/settings/subscription/cancel` - **Métodos:** POST
- `/api/settings/company` - **Métodos:** GET, PUT

### SUBSCRIPTION-PLANS

- `/api/subscription-plans` - **Métodos:** GET, POST
- `/api/subscription-plans/[id]` - **Métodos:** GET, PUT, DELETE

### SUBSCRIPTIONS

- `/api/subscriptions` - **Métodos:** GET, POST
- `/api/subscriptions/status` - **Métodos:** GET
- `/api/subscriptions/plans` - **Métodos:** GET
- `/api/subscriptions/payment/init` - **Métodos:** POST
- `/api/subscriptions/payment/callback` - **Métodos:** GET, POST
- `/api/subscriptions/[id]` - **Métodos:** GET, PUT, DELETE
- `/api/subscriptions/[id]/reactivate` - **Métodos:** POST
- `/api/subscriptions/[id]/cancel` - **Métodos:** POST
- `/api/subscriptions/[id]/change-plan` - **Métodos:** POST
- `/api/subscriptions/[id]/renew` - **Métodos:** POST

---

## 🔗 RELACIONES DE BASE DE DATOS

Principales relaciones entre modelos:

### AuditLog
- tenant → Tenant (many-to-one)

### CashSession
- user → User (many-to-one)
- tenant → Tenant (many-to-one)

### EmailLog
- emailQueue → EmailQueue (many-to-one)

### EmailQueue
- template → EmailTemplate (many-to-one)

### FixedExpense
- tenant → Tenant (many-to-one)

### InventoryMovement
- tenantInventory → TenantInventory (many-to-one)
- user → User (many-to-one)
- tenant → Tenant (many-to-one)

### NotificationHistory
- tenant → Tenant (many-to-one)

### NotificationPreference
- tenant → Tenant (many-to-one)

### PlatformAdminSession
- admin → PlatformAdmin (many-to-one)

### Product
- tenant → Tenant (many-to-one)

### Refund
- payment → SubscriptionPayment (many-to-one)
- tenant → Tenant (many-to-one)

### Sale
- user → User (many-to-one)
- tenant → Tenant (many-to-one)

### SaleItem
- sale → Sale (many-to-one)
- tenantInventory → TenantInventory (many-to-one)

### StockAdjustment
- tenantInventory → TenantInventory (many-to-one)
- user → User (many-to-one)
- tenant → Tenant (many-to-one)

### Subscription
- tenant → Tenant (many-to-one)
- plan → SubscriptionPlan (many-to-one)


---

## ⚙️ FUNCIONALIDADES PRINCIPALES

### 1. Sistema Multi-Tenant
- Cada empresa (tenant) tiene su propio espacio aislado
- Gestión de usuarios por tenant
- Configuración personalizada por empresa

### 2. Punto de Venta (POS)
- Registro de ventas en tiempo real
- Gestión de sesiones de caja
- Múltiples métodos de pago
- Cálculo automático de cambio

### 3. Gestión de Inventario
- Catálogo maestro de productos (MasterProduct)
- Inventario específico por tenant (TenantInventory)
- Movimientos de inventario con trazabilidad
- Ajustes de stock con motivos
- Alertas de stock bajo

### 4. Sistema de Reportes
- Reportes de ventas
- Reportes de productos
- Reportes de clientes
- Exportación de datos

### 5. Sistema de Suscripciones
- Múltiples planes (Free, Basic, Premium, Enterprise)
- Facturación automática
- Renovación automática
- Gestión de upgrades/downgrades
- Período de prueba

### 6. Integración de Pagos
- Flow (pasarela chilena)
- Transbank (en implementación)
- Webhooks para confirmación de pagos
- Historial de transacciones
- Sistema de reembolsos

### 7. Sistema de Notificaciones
- Emails transaccionales con SendGrid
- Plantillas de email personalizables
- Cola de emails con prioridades
- Logs de eventos de email
- Preferencias de notificación por tenant

### 8. Auditoría y Seguridad
- Logs de auditoría (AuditLog)
- Registro de acciones de administradores
- Seguimiento de cambios en datos críticos
- Autenticación multi-método (Google OAuth + Credenciales)

### 9. Dashboard y Métricas
- Métricas de plataforma (PlatformMetrics)
- Métricas de suscripciones (SubscriptionMetrics)
- Reportes de ingresos (RevenueReport)
- Snapshots de dashboard para rendimiento

### 10. Gestión de Tenants (Admin SaaS)
- Activación/Suspensión de cuentas
- Cambio de planes
- Gestión de usuarios por tenant
- Visualización de productos por tenant
- Métricas y estadísticas globales

### 11. Onboarding
- Proceso de registro guiado
- Configuración inicial de empresa
- Asignación automática de plan inicial

### 12. Configuración
- Configuración de empresa
- Configuración de POS
- Gestión de usuarios
- Preferencias de notificaciones
- Gestión de suscripción

---

## 📊 ESTADÍSTICAS DEL PROYECTO

- **30 Modelos de Base de Datos** con relaciones complejas
- **38 Páginas** implementadas
- **63 Endpoints API** RESTful
- **64 Componentes UI** reutilizables
- **4 Layouts** principales
- **Arquitectura Multi-Tenant** completa
- **Sistema de Pagos** integrado
- **Sistema de Notificaciones** robusto

---

## 🚀 TECNOLOGÍAS UTILIZADAS

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI (componentes)
- React Hook Form
- Zod (validación)

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth.js

### Integraciones
- SendGrid (emails)
- Flow (pagos)
- Transbank (en implementación)
- Google OAuth

### DevOps
- Docker
- Google Cloud Run
- GitHub Actions (CI/CD)

---

*Reporte detallado generado para presentación*
