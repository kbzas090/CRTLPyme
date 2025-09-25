
# Changelog - CRTLPyme

Registro de cambios y evolución del proyecto CRTLPyme.

## [Unreleased] - En Desarrollo

### Fase 2: POS + Inventario Core (Septiembre 2025)
- Sistema POS completo con códigos de barras
- Gestión avanzada de inventario
- Cálculo de punto de equilibrio
- Reportes básicos por rol

## [1.0.0] - 2025-09-12 - MVP CRTLPyme

### Fase 1: MVP Completo

#### Agregado
- **Arquitectura Multi-tenant** con PostgreSQL y Prisma ORM
- **Sistema de Autenticación** con NextAuth.js
- **5 Roles de Usuario** diferenciados (Admin SaaS, Admin Cliente, Cajero, Inventario, Soporte)
- **Landing Page** profesional con información del SaaS
- **Dashboards Básicos** para cada rol de usuario
- **Base de Datos Chilena** con productos reales y códigos EAN-13
- **Localización Chilena** completa (RUT, CLP, productos locales)
- **Estructura de Auditoría** con logs completos
- **Preparación Google Cloud** para despliegue futuro

#### Arquitectura Implementada
- Next.js 14.2 con TypeScript
- PostgreSQL con multi-tenancy (tenant scoping)
- Prisma ORM con migraciones
- Tailwind CSS + Shadcn/ui
- Radix UI components
- Chart.js y Recharts para visualizaciones

#### Adaptaciones Chile
- Validación RUT chileno
- Productos con códigos EAN-13 del mercado local
- Precios en pesos chilenos (CLP)
- Categorías típicas de tiendas de abarrotes
- Marcas y productos reconocidos localmente

#### Roles y Permisos
- **Admin SaaS**: Control total de la plataforma, métricas globales
- **Admin Cliente**: Gestión completa de su negocio, dashboard ejecutivo
- **Cajero**: Operación de punto de venta, arqueo de caja
- **Inventario**: Gestión de productos y stock
- **Soporte**: Asistencia técnica a clientes

#### Dashboards Implementados
- **Admin SaaS**: Tenants activos, ingresos simulados, métricas de uso
- **Admin Cliente**: Ventas, margen, punto de equilibrio, stock valorizado
- **Cajero**: KPIs diarios, estado de caja, flujo operativo
- **Inventario**: Salud del stock, rotación, alertas de reposición
- **Soporte**: Vista básica de tenants y usuarios

#### Funcionalidades de Registro de Flujo
- **Control de Transacciones**: Registro detallado de cada venta
- **Tipos de Pago**: Efectivo, tarjeta de crédito, tarjeta de débito
- **Sin Integración SII**: El sistema NO emite boletas electrónicas
- **Transbank**: API de prueba únicamente para pago de suscripción de la plataforma (no para ventas del negocio)
- **Reportes de Flujo**: Análisis del movimiento de dinero

## [Próximas Versiones]

### v1.1.0 - Fase 2: POS Core (Octubre 2025)
- [ ] Sistema POS con escáner de códigos de barras
- [ ] Gestión completa de ventas
- [ ] Control de inventario avanzado
- [ ] Cálculo automático punto de equilibrio
- [ ] Reportes PDF/CSV por rol

### v1.2.0 - Fase 3: Analytics (Noviembre 2025)
- [ ] Dashboards en tiempo real
- [ ] Pronósticos de ventas
- [ ] Análisis de cesta de compras
- [ ] Optimizaciones de rendimiento
- [ ] PWA para móvil

### v1.3.0 - Fase 4: Integraciones (Diciembre 2025)
- [ ] Integración API de prueba Transbank para suscripciones únicamente
- [ ] Registro avanzado de flujo de dinero
- [ ] Consola del proveedor
- [ ] Gestión de suscripciones completa
- [ ] Testing integral

## Notas de Desarrollo

### Tecnologías Base
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: API Routes, Prisma ORM
- **Database**: PostgreSQL con multi-tenancy
- **Auth**: NextAuth.js con roles
- **UI**: Radix UI + Shadcn/ui
- **Charts**: Recharts, Chart.js

### Preparación Cloud
- Estructura preparada para Google Cloud
- Docker configuration ready
- Secret management preparado
- CI/CD workflows configurados

### Información de Contacto
- **Email**: hernan.c249@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/hfcabezas/

---

> **Proyecto Académico**: Tesis Ingeniería en Informática  
> **Objetivo**: Sistema POS-SaaS para PYMEs chilenas  
> **Estado**: MVP Completado
