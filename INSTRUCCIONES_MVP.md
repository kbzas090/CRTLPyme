
# 🚀 Instrucciones MVP - CRTLPyme

## 📋 Descripción
Sistema de Control para PYMEs Chilenas - MVP Funcional con login, registro e inventario.

## 🛠️ Requisitos Previos
- Node.js 18+ instalado
- PostgreSQL instalado y corriendo
- Git instalado

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/kbzas090/CRTLPyme.git
cd CRTLPyme
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/crtlpyme"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-key-super-segura-aqui"
```

**Nota:** Genera un secret seguro con:
```bash
openssl rand -base64 32
```

### 4. Configurar la base de datos
```bash
# Crear las tablas
npx prisma db push

# Generar el cliente de Prisma
npx prisma generate
```

### 5. Ejecutar el seed (importar datos de prueba)
```bash
npm run seed
```

Esto creará:
- ✅ 1 Tenant demo: "Demo Chile SpA"
- ✅ 1 Usuario admin: admin@demo.cl
- ✅ 42 Productos chilenos reales

### 6. Iniciar el servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

## 🔐 Credenciales de Prueba

### Usuario Demo
- **Email:** admin@demo.cl
- **Contraseña:** Demo123!
- **Rol:** Administrador
- **Empresa:** Demo Chile SpA

## ✅ Funcionalidades Implementadas

### 1. Sistema de Autenticación
- ✅ Página de login (`/auth/login`)
- ✅ Página de registro (`/auth/register`)
- ✅ Protección de rutas con middleware
- ✅ Sesiones con NextAuth.js
- ✅ Hash de contraseñas con bcrypt

### 2. Gestión de Inventario
- ✅ Listado de productos con búsqueda
- ✅ Crear nuevos productos
- ✅ Editar productos existentes
- ✅ Eliminar productos
- ✅ Alertas de stock bajo
- ✅ Filtrado por nombre, SKU y código de barras

### 3. Multi-tenant
- ✅ Cada empresa tiene sus propios datos
- ✅ Usuarios asociados a un tenant
- ✅ Productos aislados por tenant

## 🧪 Cómo Probar el Sistema

### Flujo de Prueba Completo

#### 1. Registro de Nueva Empresa
1. Ir a http://localhost:3000/auth/register
2. Completar el formulario:
   - Nombre de empresa: "Mi Negocio Test"
   - RUT: "12345678-9"
   - Nombre: "Juan"
   - Apellido: "Pérez"
   - Email: "juan@test.cl"
   - Contraseña: "Test123!"
3. Click en "Crear Cuenta"
4. Serás redirigido al login

#### 2. Login con Usuario Demo
1. Ir a http://localhost:3000/auth/login
2. Ingresar credenciales:
   - Email: admin@demo.cl
   - Contraseña: Demo123!
3. Click en "Iniciar Sesión"
4. Serás redirigido al dashboard

#### 3. Gestión de Inventario
1. En el menú, click en "Inventario"
2. Verás los 42 productos chilenos importados
3. **Buscar productos:**
   - Escribe "Coca" en el buscador
   - Verás productos de Coca-Cola filtrados
4. **Crear producto:**
   - Click en "Nuevo Producto"
   - Completar formulario
   - Click en "Crear"
5. **Editar producto:**
   - Click en el ícono de lápiz
   - Modificar datos
   - Click en "Actualizar"
6. **Eliminar producto:**
   - Click en el ícono de basura
   - Confirmar eliminación

#### 4. Verificar Stock Bajo
- Los productos con stock menor al mínimo aparecen con badge rojo "Stock Bajo"
- Útil para reabastecimiento

#### 5. Cerrar Sesión
- Click en el avatar en la esquina superior derecha
- Click en "Cerrar sesión"

## 📁 Estructura del Proyecto

```
CRTLPyme/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # Configuración NextAuth
│   │   │   └── register/route.ts       # API de registro
│   │   └── products/
│   │       ├── route.ts                # CRUD productos
│   │       └── [id]/route.ts           # Operaciones por ID
│   ├── auth/
│   │   ├── login/page.tsx              # Página de login
│   │   └── register/page.tsx           # Página de registro
│   └── admin/
│       ├── dashboard/page.tsx          # Dashboard admin
│       └── inventory/page.tsx          # Gestión de inventario
├── components/
│   ├── layout/
│   │   └── dashboard-layout.tsx        # Layout principal
│   └── ui/                             # Componentes shadcn/ui
├── lib/
│   ├── auth.ts                         # Configuración NextAuth
│   └── db.ts                           # Cliente Prisma
├── prisma/
│   ├── schema.prisma                   # Schema de base de datos
│   └── seed.ts                         # Script de seed
├── data/
│   └── productos_chilenos.json         # 42 productos chilenos
├── middleware.ts                       # Protección de rutas
└── package.json
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Compilar para producción
npm start            # Iniciar servidor de producción

# Base de datos
npx prisma db push   # Sincronizar schema con DB
npx prisma generate  # Generar cliente Prisma
npm run seed         # Ejecutar seed (importar datos)
npx prisma studio    # Abrir Prisma Studio (GUI para DB)

# Linting
npm run lint         # Ejecutar ESLint
```

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `.env`
- Verificar que la base de datos exista

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error en seed
```bash
# Limpiar base de datos y volver a crear
npx prisma db push --force-reset
npm run seed
```

### Error: "NEXTAUTH_SECRET is not set"
- Asegurarse de tener `NEXTAUTH_SECRET` en `.env`
- Generar uno nuevo con: `openssl rand -base64 32`

## 📊 Datos de Prueba

### Productos Incluidos
El seed importa 42 productos chilenos reales:
- Bebidas (Coca-Cola, Sprite, Fanta, etc.)
- Snacks (Ramitas, Super 8, etc.)
- Lácteos (Colún, Soprole, etc.)
- Abarrotes (Arroz, Fideos, etc.)

Cada producto incluye:
- SKU único (SKU-001, SKU-002, etc.)
- Código de barras EAN-13
- Precio de costo y venta
- Stock inicial (10-100 unidades)
- Stock mínimo (5 unidades)
- Categoría y marca

## 🚀 Próximos Pasos

Para la presentación de mañana, el sistema está listo con:
- ✅ Login funcional
- ✅ Registro de nuevas empresas
- ✅ Inventario completo con CRUD
- ✅ 42 productos reales
- ✅ Usuario demo para testing
- ✅ Protección de rutas

### Mejoras Futuras (Post-MVP)
- [ ] Dashboard con métricas
- [ ] Punto de venta (POS)
- [ ] Gestión de ventas
- [ ] Reportes y estadísticas
- [ ] Gestión de usuarios
- [ ] Configuración de empresa

## 📞 Soporte

Para problemas o preguntas:
- Revisar esta documentación
- Verificar logs en la consola
- Revisar el código en GitHub

## 📄 Licencia

Este proyecto es parte de un proyecto de titulación.

---

**¡Éxito en tu presentación! 🎉**
