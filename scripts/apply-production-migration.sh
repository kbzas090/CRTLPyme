#!/bin/bash

# Script para aplicar la migración en producción
# Este script debe ejecutarse desde tu máquina local con acceso a internet

set -e

echo "🚀 Script de Aplicación de Migración en Producción"
echo "=================================================="
echo ""

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no está configurada"
    echo "Por favor, exporta la variable de entorno:"
    echo "export DATABASE_URL='postgresql://postgres:CrtlPyme_2025@db.bxfetsflhxhigacuqtfe.supabase.co:5432/postgres'"
    exit 1
fi

echo "✅ DATABASE_URL configurada"
echo ""

# Opción 1: Usar Prisma Migrate Deploy
echo "📋 Opción 1: Usando Prisma Migrate Deploy"
echo "=========================================="
echo ""
echo "Ejecutando: npx prisma migrate deploy"
npx prisma migrate deploy

echo ""
echo "✅ Migración aplicada exitosamente con Prisma!"
echo ""

# Verificar el estado
echo "🔍 Verificando estado de las migraciones..."
npx prisma migrate status

echo ""
echo "✨ Proceso completado!"
echo ""
echo "📝 Próximo paso: Ejecutar el seed de productos maestros"
echo "   npm run seed:master-products"
