# Evidencias de Sistema - CRTLPyme

## Estructura del Directorio

### Aplicación/
Contiene todo el código fuente de la aplicación:
- **app/**: Páginas y layouts de Next.js
- **components/**: Componentes React reutilizables
- **lib/**: Utilidades y configuraciones
- **hooks/**: Custom hooks de React
- Archivos de configuración (package.json, tsconfig.json, etc.)

### Base de datos/
Contiene la estructura y configuración de la base de datos:
- **Schema_Database.sql**: Definición completa del esquema
- **Setup_Database.md**: Instrucciones de instalación
- Scripts de migración y datos de prueba

## Tecnologías Utilizadas

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui Components

### Backend
- Node.js
- PostgreSQL
- Prisma ORM (planificado)

### Infraestructura
- Google Cloud Platform
- Docker (planificado)
- CI/CD con GitHub Actions (planificado)

## Instalación y Despliegue

### Desarrollo Local
1. Clonar repositorio
2. Instalar dependencias: `npm install`
3. Configurar base de datos
4. Ejecutar: `npm run dev`

### Producción
1. Build: `npm run build`
2. Deploy en GCP
3. Configurar variables de entorno
4. Ejecutar migraciones de BD

## Documentación Adicional
- Ver carpeta `Evidencias de documentación/` para documentación técnica completa
- Manual de usuario disponible para referencia de funcionalidades
