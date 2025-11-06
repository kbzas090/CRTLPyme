#!/bin/bash

# Script para ejecutar el seeder de planes de suscripción en Cloud SQL

set -e  # Salir si hay algún error

echo "🌱 Ejecutando seeder de planes de suscripción..."
echo ""

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: La variable DATABASE_URL no está configurada"
    echo "Por favor, configúrala con:"
    echo 'export DATABASE_URL="postgresql://postgres:PASSWORD@136.116.45.158:5432/crtlpyme-db?schema=public"'
    exit 1
fi

echo "✅ DATABASE_URL configurada"
echo "📍 Base de datos: Cloud SQL PostgreSQL"
echo ""

# Generar Prisma Client (por si acaso)
echo "🔨 Generando Prisma Client..."
npx prisma generate
echo ""

# Ejecutar seeder de planes
echo "🚀 Creando planes de suscripción..."
npm run seed:plans
echo ""

echo "✅ Seeder ejecutado exitosamente!"
echo "📋 Los 8 planes de suscripción han sido creados en la base de datos."
