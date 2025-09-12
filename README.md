
# 🏪 CRTLPyme - Control para PYMEs Chilenas

> **Sistema POS-SaaS especializado para pequeños negocios y tiendas de abarrotes chilenas**

[![Estado](https://media.licdn.com/dms/image/v2/C4E12AQENIaS1OixCcQ/article-inline_image-shrink_400_744/article-inline_image-shrink_400_744/0/1611340056350?e=1762387200&v=beta&t=BK_HfTIPGTI8o6ZhbJ95xVeIjDNbu-KMXG1nSfiWMcs)
[![Licencia](https://upload.wikimedia.org/wikipedia/commons/2/2e/MIT_Logo_New.svg)
[![Tesis](https://i.ytimg.com/vi/4cgpu9L2AE8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCzedb-c7IZSg8ZCib1APCJvLdWqw)
[![Next.js](https://i.ytimg.com/vi/f53RvUpUA8w/sddefault.jpg)
[![PostgreSQL](https://i.ytimg.com/vi/4cgpu9L2AE8/mqdefault.jpg)

## 📖 Descripción

**CRTLPyme** es una plataforma SaaS desarrollada específicamente para ayudar a las pequeñas y medianas empresas chilenas a gestionar sus operaciones diarias de manera eficiente y profesional.

### 🎯 Funcionalidades Principales

- **🛒 Sistema POS Completo** con lectura de códigos de barras EAN-13
- **📦 Control de Inventario** en tiempo real con alertas inteligentes
- **📊 Cálculo Automático** del punto de equilibrio
- **👥 Dashboards Especializados** para cada rol de usuario
- **🏪 Base de Datos** con productos chilenos reales y precios actualizados
- **💳 Integración Transbank** para pagos electrónicos (sandbox)

### 🇨🇱 Adaptado 100% para Chile

- ✅ Productos con códigos EAN-13 del mercado chileno
- ✅ Validación de RUT chileno integrada
- ✅ Integración nativa con Transbank (ambiente sandbox)
- ✅ Cumplimiento con normativas chilenas
- ✅ Moneda en pesos chilenos (CLP)
- ✅ Precios reales del mercado local

## 🏗️ Arquitectura

### Stack Tecnológico

- **Frontend:** Next.js 14.2 + TypeScript + Tailwind CSS
- **Backend:** API Routes + Prisma ORM
- **Base de Datos:** PostgreSQL 14+ con multi-tenancy
- **Autenticación:** NextAuth.js con roles diferenciados
- **UI Components:** Radix UI + Shadcn/ui
- **Charts:** Recharts + Chart.js

### Roles de Usuario

1. **👔 Administrador SaaS** - Control total de la plataforma
2. **🏪 Admin Cliente** - Dueño de PyME (acceso completo a su negocio)
3. **💰 Cajero** - Operador de punto de venta
4. **📦 Inventario** - Encargado de stock y productos
5. **🛠️ Soporte** - Asistencia técnica a clientes

## 🚀 Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- Yarn o npm

### Configuración Local

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/CRTLPyme.git
cd CRTLPyme

# Instalar dependencias
yarn install

# Configurar base de datos
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Ejecutar migraciones
yarn prisma migrate dev

# Poblar base de datos con productos chilenos
yarn prisma db seed

# Iniciar desarrollo
yarn dev
```

## 📱 Capturas de Pantalla

### Landing Page
> Página principal del SaaS con información del producto

### Dashboard Administrador
> Panel de control con métricas del negocio y punto de equilibrio

### Sistema POS
> Interfaz de punto de venta con escáner de códigos

### Gestión de Inventario
> Control de stock con alertas y sugerencias de reposición

## 🎯 Funcionalidades por Módulo

### 💰 Módulo POS/Caja
- Crear ventas con escáner de códigos de barras
- Múltiples medios de pago (efectivo/débito/crédito)
- Apertura y cierre de turno con arqueo
- Control de anulaciones y devoluciones
- Registro de egresos operacionales

### 📦 Módulo Inventario
- CRUD completo de productos
- Control de stock con umbrales de reposición
- Importación masiva via CSV/JSON
- Ajustes de stock por mermas
- Análisis de rotación de productos

### 📊 Módulo Analytics
- Cálculo automático del punto de equilibrio
- Dashboards en tiempo real
- Análisis de top productos más/menos vendidos
- Pronósticos de ventas básicos
- Métricas de rentabilidad por categoría

### 💳 Módulo Suscripciones
- Planes mensual/trimestral/anual
- Gestión de cajas adicionales
- Integración con Transbank (sandbox)
- Historial de facturación

## 🏢 Casos de Uso

### Para Tiendas de Abarrotes
- Control de perecibles con fechas de vencimiento
- Gestión de proveedores locales
- Análisis de productos de alta rotación

### Para Comercio General
- Multi-categoría de productos
- Control de márgenes por familia
- Alertas de stock crítico

### Para Kioscos y Minimercados
- Operación rápida en punto de venta
- Control simple de caja chica
- Reportes diarios automatizados

## 📈 Roadmap de Desarrollo

### ✅ Fase 1: MVP Completo (ACTUAL)
- Landing page profesional
- Sistema de roles y autenticación
- Dashboards básicos diferenciados
- Base de datos con productos chilenos

### 🔄 Fase 2: POS + Inventario Core (EN DESARROLLO)
- Sistema POS completo con códigos de barras
- Gestión avanzada de inventario
- Cálculo de punto de equilibrio
- Reportes básicos por rol

### ⏳ Fase 3: Analytics Avanzada
- Dashboards en tiempo real
- Pronósticos de ventas
- Análisis de cesta de compras
- Optimizaciones de rendimiento

### ⏳ Fase 4: Integración Transbank
- Pagos electrónicos reales
- Facturación automática
- Consola del proveedor SaaS
- Testing integral

## 🎓 Contexto Académico

Este proyecto forma parte de mi **Tesis de Titulación para Ingeniería en Informática**, enfocado en:

- **Problema:** Falta de herramientas tecnológicas accesibles para PYMEs chilenas
- **Solución:** Plataforma SaaS especializada y localizada
- **Metodología:** Desarrollo ágil con validación continua
- **Objetivo:** Democratizar el acceso a tecnología POS profesional

## 🤝 Contribuciones

Este es un proyecto académico en desarrollo. Las contribuciones, sugerencias y feedback son bienvenidos:

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

- **Autor:** [Tu Nombre]
- **Email:** tu.email@gmail.com
- **LinkedIn:** [tu-linkedin]
- **Proyecto:** [CRTLPyme](https://github.com/tu-usuario/CRTLPyme)

---

**CRTLPyme** - Transformando la gestión de pequeños negocios chilenos 🇨🇱
