# CRTLPyme - Sistema de Control para PYMEs Chilenas

## Descripción del Proyecto

CRTLPyme es un sistema integral de punto de venta (POS) desarrollado como Software as a Service (SaaS) específicamente diseñado para pequeñas y medianas empresas chilenas. Este proyecto constituye el trabajo de titulación para la carrera de Ingeniería Informática, enfocándose en proporcionar una solución tecnológica accesible y eficiente para la gestión comercial de PYMEs.

## Objetivos del Proyecto

### Objetivo General
Desarrollar un sistema POS-SaaS que permita a las PYMEs chilenas gestionar eficientemente sus operaciones de venta, inventario y administración, proporcionando herramientas tecnológicas modernas y accesibles.

### Objetivos Específicos
- Implementar un sistema de punto de venta completo con funcionalidades de facturación y control de inventario
- Desarrollar una arquitectura multi-tenant que permita el uso simultáneo por múltiples empresas
- Integrar sistemas de pago locales chilenos, específicamente Transbank
- Crear una base de datos de productos chilenos con códigos EAN-13
- Establecer un sistema de roles y permisos adaptado a las necesidades organizacionales de PYMEs

## Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: Next.js 14 con TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js
- **Servicios en la Nube**: Firebase para almacenamiento y notificaciones
- **Pagos**: Integración con Transbank (ambiente sandbox)
- **Despliegue**: Google Cloud Platform

### Arquitectura del Sistema
El sistema implementa una arquitectura multi-tenant con separación lógica de datos, permitiendo que múltiples empresas utilicen la misma instancia de la aplicación manteniendo la privacidad y seguridad de sus datos.

## Sistema de Roles

El sistema contempla cinco roles principales:

1. **Administrador SaaS**: Gestión global del sistema y tenants
2. **Administrador de Tenant**: Gestión completa de la empresa
3. **Cajero**: Operaciones de venta y facturación
4. **Encargado de Inventario**: Gestión de productos y stock
5. **Soporte**: Asistencia técnica y resolución de incidencias

## Funcionalidades Principales

### Gestión de Ventas
- Sistema de punto de venta con interfaz intuitiva
- Procesamiento de transacciones con múltiples métodos de pago
- Generación automática de boletas y facturas
- Integración con lectores de códigos de barras

### Gestión de Inventario
- Control de stock en tiempo real
- Alertas de productos con bajo inventario
- Gestión de proveedores y compras
- Reportes de movimientos de inventario

### Administración
- Dashboard con métricas de negocio
- Gestión de usuarios y permisos
- Configuración de empresa y sucursales
- Reportes financieros y operacionales

## Base de Datos de Productos

El sistema incluye una base de datos preconfigurada con productos comunes en el mercado chileno, cada uno identificado con su respectivo código EAN-13, facilitando la implementación inmediata del sistema en comercios locales.

## Integración de Pagos

La integración con Transbank permite procesar pagos con tarjetas de débito y crédito, adaptándose a los métodos de pago más utilizados en Chile. La implementación inicial utiliza el ambiente sandbox para pruebas y desarrollo.

## Metodología de Desarrollo

El proyecto sigue una metodología ágil con entregas incrementales organizadas en fases bien definidas, permitiendo validación continua y ajustes según los requerimientos identificados.

## Instalación y Configuración

### Prerrequisitos
- Node.js 18 o superior
- PostgreSQL 14 o superior
- Cuenta de Google Cloud Platform
- Cuenta de Firebase

### Configuración del Entorno
```bash
# Clonar el repositorio
git clone https://github.com/kbzas090/CRTLPyme.git
cd CRTLPyme

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con las configuraciones correspondientes

# Ejecutar migraciones de base de datos
npx prisma migrate dev

# Iniciar el servidor de desarrollo
npm run dev
```

## Estructura del Proyecto

```
CRTLPyme/
├── src/
│   ├── app/                 # Páginas y rutas de Next.js
│   ├── components/          # Componentes reutilizables
│   ├── lib/                 # Utilidades y configuraciones
│   └── types/               # Definiciones de tipos TypeScript
├── prisma/                  # Esquemas y migraciones de base de datos
├── public/                  # Archivos estáticos
└── docs/                    # Documentación del proyecto
```

## Fases de Desarrollo

### Fase 1: Fundamentos y Landing Page
- Configuración de infraestructura técnica
- Desarrollo de landing page profesional
- Implementación de sistema de autenticación básico
- Establecimiento de arquitectura multi-tenant

### Fase 2: Sistema POS y Gestión de Inventario
- Desarrollo de interfaz de punto de venta
- Implementación de gestión integral de inventario
- Integración con códigos de barras EAN-13
- Sistema de reportes operacionales

### Fase 3: Integraciones y Funcionalidades Avanzadas
- Integración con Transbank para pagos
- Sistema de facturación electrónica básica
- Dashboard avanzado con analytics
- Optimizaciones de rendimiento

### Fase 4: Testing, Documentación y Despliegue
- Testing exhaustivo del sistema
- Documentación técnica completa
- Despliegue en producción
- Validación con usuarios reales

## Consideraciones para el Mercado Chileno

### Adaptaciones Locales
- Interfaz completamente en español chileno
- Formatos de moneda y fecha locales (CLP, dd/mm/yyyy)
- Cálculo automático de IVA (19%)
- Compatibilidad con normativas tributarias chilenas

### Integración con Servicios Locales
- Validación de RUT chileno
- Preparación para integración con SII
- Soporte para métodos de pago locales
- Base de datos de productos del mercado chileno

## Tecnologías y Herramientas

### Desarrollo
- **Lenguajes**: TypeScript, JavaScript
- **Framework**: Next.js 14 con App Router
- **Estilos**: Tailwind CSS
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js

### Infraestructura
- **Cloud Provider**: Google Cloud Platform
- **Contenedores**: Docker
- **CI/CD**: GitHub Actions
- **Monitoreo**: Google Cloud Monitoring
- **Storage**: Google Cloud Storage

### Testing
- **Unit Testing**: Jest
- **Integration Testing**: Cypress
- **E2E Testing**: Playwright
- **Performance Testing**: Lighthouse

## Métricas de Calidad

### Objetivos Técnicos
- Tiempo de respuesta de API menor a 500ms
- Cobertura de tests superior al 85%
- Disponibilidad del sistema mayor al 99%
- Soporte para 1000+ productos por tenant

### Objetivos de Usabilidad
- Tiempo de aprendizaje menor a 30 minutos
- Interfaz responsive para todos los dispositivos
- Cumplimiento de estándares de accesibilidad WCAG 2.1
- Soporte para navegadores modernos

## Contribución al Proyecto

Este proyecto es desarrollado como trabajo de titulación académico. La documentación detallada del proceso de desarrollo, decisiones técnicas y lecciones aprendidas forma parte integral del proyecto educativo.

### Documentación Académica
- Memoria de titulación detallada
- Análisis de requerimientos y casos de uso
- Documentación de arquitectura y diseño
- Evaluación de resultados y conclusiones

## Estado del Proyecto

**Año de Desarrollo**: 2025  
**Estado Actual**: En desarrollo activo  
**Fase Actual**: Planificación y configuración inicial  

### Próximos Hitos
1. Completar configuración de infraestructura base
2. Desarrollar landing page y sistema de autenticación
3. Implementar funcionalidades core del sistema POS
4. Realizar testing y validación con usuarios reales

## Licencia y Uso Académico

Este proyecto está desarrollado con fines académicos como parte del proceso de titulación en Ingeniería Informática. El código y la documentación están disponibles para fines educativos y de investigación.

## Contacto Académico

**Desarrollador**: [Nombre del Estudiante]  
**Institución**: [Nombre de la Institución Educativa]  
**Carrera**: Ingeniería Informática  
**Año**: 2025  
**Profesor Guía**: [Nombre del Profesor Guía]  

## Agradecimientos

Agradecimientos especiales a la institución educativa, profesores guías y empresarios locales que han proporcionado insights valiosos sobre las necesidades reales de las PYMEs chilenas, contribuyendo al desarrollo de una solución práctica y aplicable.

---

**Nota**: Este proyecto representa un esfuerzo académico serio orientado a generar impacto real en el sector comercial chileno, combinando rigor técnico con aplicabilidad práctica para beneficio de las pequeñas y medianas empresas del país.
