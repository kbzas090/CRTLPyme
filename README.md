
# CRTLPyme - Sistema POS SaaS para PYMEs Chilenas

![CRTLPyme Logo](https://img.shields.io/badge/CRTLPyme-POS%20SaaS-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-green)

## Descripción del Proyecto

CRTLPyme es una plataforma POS (Point of Sale) SaaS diseñada específicamente para pequeñas y medianas empresas (PYMEs) chilenas. Este proyecto corresponde a nuestro trabajo de titulación para el curso Capstone 707V, bajo la supervisión del profesor Fernando González, y busca proporcionar una solución integral de gestión comercial adaptada al mercado chileno.

**Estudiantes:**
- Hernán Cabezas - hernan.c249@gmail.com
- Gricel Sanchez - gricelsanz@gmail.com

## Objetivos del Proyecto

- **Objetivo Principal**: Desarrollar una plataforma POS SaaS completa para PYMEs chilenas
- **Objetivos Específicos**:
  - Implementar sistema de roles multi-usuario (5 roles)
  - Integrar productos chilenos con códigos de barras
  - Crear dashboards personalizados por rol
  - Desarrollar sistema de inventario y ventas
  - Registrar flujo de dinero y tipos de pago
  - Desplegar en Google Cloud Platform

## Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: Next.js 14 con TypeScript
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL 15
- **ORM**: Prisma 5
- **Autenticación**: NextAuth.js
- **UI/UX**: Tailwind CSS + shadcn/ui
- **Despliegue**: Google Cloud Platform

### Estructura del Proyecto
```
CRTLPyme/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── dashboard/         # Dashboards por rol
│   ├── api/               # API Routes
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuraciones
├── prisma/               # Esquemas de base de datos
├── hooks/                # Custom React hooks
├── docs/                 # Documentación del proyecto
└── scripts/              # Scripts de automatización
```

## Sistema de Roles

1. **Super Admin**: Gestión completa del sistema
2. **Admin Empresa**: Administración de empresa específica
3. **Gerente**: Supervisión operacional
4. **Vendedor**: Operaciones de venta
5. **Cajero**: Operaciones de caja

## Fases de Desarrollo

### Fase 1: Landing Page + Roles Básicos (2-3 semanas)
- Landing page profesional
- Sistema de autenticación
- Roles básicos y permisos
- Dashboard inicial por rol

### Fase 2: POS + Inventario Core (4-6 semanas)
- Sistema POS completo
- Gestión de inventario
- Productos chilenos integrados
- Reportes básicos

### Fase 3: Funcionalidades Avanzadas (6-8 semanas)
- Registro de flujo de dinero
- Reportes avanzados
- Integración con APIs chilenas
- Optimizaciones de rendimiento

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL 15+
- Yarn o npm
- Cuenta Google Cloud Platform

### Instalación Local
```bash
# Clonar el repositorio
git clone https://github.com/kbzas090/CRTLPyme.git
cd CRTLPyme

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Configurar base de datos
npx prisma generate
npx prisma db push

# Ejecutar en desarrollo
yarn dev
```

### Variables de Entorno Requeridas
```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/crtlpyme"

# NextAuth
NEXTAUTH_SECRET="tu-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google Cloud (opcional para desarrollo)
GOOGLE_CLOUD_PROJECT_ID="tu-project-id"
```

## Características Principales

### Implementado
- [x] Estructura base Next.js 14
- [x] Configuración Prisma + PostgreSQL
- [x] Sistema de roles básico
- [x] Productos chilenos con códigos de barras
- [x] Dashboards por rol
- [x] Componentes UI con shadcn/ui

### En Desarrollo
- [ ] Landing page profesional
- [ ] Sistema de autenticación completo
- [ ] POS funcional
- [ ] Gestión de inventario avanzada

### Planificado
- [ ] Registro de flujo de dinero
- [ ] Reportes avanzados
- [ ] Integración APIs chilenas
- [ ] Despliegue Google Cloud

## Funcionalidades del Sistema

### Sistema de Ventas
- **Registro de Ventas**: Mantiene registro completo del flujo de dinero
- **Tipos de Pago**: Identifica y registra efectivo, tarjeta de crédito, tarjeta de débito
- **Control de Transacciones**: Seguimiento detallado de todas las operaciones
- **Reportes de Flujo**: Análisis del movimiento de dinero del negocio

### Gestión de Inventario
- **Control de Stock**: Seguimiento de productos y cantidades
- **Productos Chilenos**: Base de datos con productos locales y códigos de barras
- **Alertas de Stock**: Notificaciones de productos con stock bajo
- **Categorización**: Organización eficiente de productos

### Sistema de Pagos
- **Transbank**: Integración para pago de suscripción de la plataforma
- **Métodos Locales**: Soporte para métodos de pago chilenos
- **Procesamiento Seguro**: Manejo seguro de transacciones

## Adaptación al Mercado Chileno

- **Productos Locales**: Base de datos con productos chilenos y códigos de barras
- **Moneda**: Pesos chilenos (CLP) con formateo local
- **Regulaciones**: Cumplimiento normativas comerciales chilenas
- **Flujo de Dinero**: Registro detallado adaptado a necesidades locales

## Documentación

- [Roadmap del Proyecto](./ROADMAP.md)
- [Plan Fase 1](./FASE-1-PLAN.md)
- [Plan Fase 2](./FASE-2-PLAN.md)
- [Configuración Google Cloud](./GOOGLE-CLOUD-SETUP.md)
- [Documentación API](./docs/api.md)

## Contribución

Este es un proyecto académico de tesis. Para contribuciones:

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## Autor

**Proyecto de Tesis - CRTLPyme**
- Plataforma POS SaaS para PYMEs Chilenas
- Universidad: [Nombre Universidad]
- Año: 2025

## Contacto

Para consultas sobre el proyecto:
- Email: hernan.c249@gmail.com
- LinkedIn: https://www.linkedin.com/in/hfcabezas/

---

**CRTLPyme** - Impulsando el crecimiento de las PYMEs chilenas a través de la tecnología
