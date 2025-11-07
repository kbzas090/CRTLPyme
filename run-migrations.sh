#!/bin/bash

# Script para ejecutar migraciones de Prisma en Cloud SQL
# Este script se conecta a la base de datos de producción y ejecuta las migraciones

set -e  # Salir si hay algún error

echo "🗄️  Ejecutando migraciones de Prisma en Cloud SQL..."
echo ""

# Configurar la URL de la base de datos
# IMPORTANTE: Asegúrate de que DATABASE_URL esté configurada correctamente
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: La variable DATABASE_URL no está configurada"
    echo "Por favor, configúrala con:"
    echo 'export DATABASE_URL="postgresql://postgres:PASSWORD@136.116.45.158:5432/crtlpyme?schema=public"'
    exit 1
fi

echo "✅ DATABASE_URL configurada"
echo "📍 Base de datos: Cloud SQL PostgreSQL"
echo ""

# Generar Prisma Client
echo "🔨 Generando Prisma Client..."
npx prisma generate
echo ""

# Ejecutar migraciones
echo "🚀 Ejecutando migraciones..."
npx prisma migrate deploy
echo ""

echo "✅ Migraciones ejecutadas exitosamente!"
echo ""
echo "📊 Estado de la base de datos:"
npx prisma migrate status
echo ""

echo "✨ ¡Listo! Ahora puedes ejecutar el seeder con: npm run seed:plans"
