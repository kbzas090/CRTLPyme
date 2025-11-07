#!/bin/bash

# Script maestro para desplegar CRTLPyme Fase 1 MVP a Cloud Run
# Este script ejecuta todos los pasos necesarios para el despliegue

set -e  # Salir si hay algún error

PROJECT_ID="crtlpyme-477300"
REGION="us-central1"
SERVICE_NAME="crtlpyme"
DB_PASSWORD="CRTLPyme2025!"  # Cambiar si es diferente

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🚀 Despliegue de CRTLPyme Fase 1 MVP a GCP            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ ERROR: gcloud CLI no está instalado"
    echo "Por favor, instala Google Cloud SDK:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gcloud CLI disponible"
echo ""

# Configurar proyecto
echo "📌 Configurando proyecto GCP..."
gcloud config set project $PROJECT_ID
echo ""

# Paso 1: Configurar Secrets
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 PASO 1: Configurar Secrets en GCP Secret Manager"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "¿Deseas ejecutar el script de configuración de secrets? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./setup-gcp-secrets.sh
else
    echo "⚠️  Saltando configuración de secrets. Asegúrate de que estén configurados manualmente."
fi
echo ""

# Paso 2: Ejecutar migraciones
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 PASO 2: Ejecutar Migraciones de Base de Datos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "¿Deseas ejecutar las migraciones de Prisma? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    export DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@136.116.45.158:5432/crtlpyme?schema=public"
    ./run-migrations.sh
else
    echo "⚠️  Saltando migraciones. Asegúrate de ejecutarlas antes del primer uso."
fi
echo ""

# Paso 3: Ejecutar seeder
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 PASO 3: Crear Planes de Suscripción (Seeder)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "¿Deseas ejecutar el seeder de planes? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    export DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@136.116.45.158:5432/crtlpyme?schema=public"
    ./run-seeder.sh
else
    echo "⚠️  Saltando seeder. Los planes deben crearse antes de usar la aplicación."
fi
echo ""

# Paso 4: Construir y desplegar
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 PASO 4: Construir y Desplegar a Cloud Run"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "¿Deseas construir y desplegar la aplicación? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🏗️  Iniciando construcción y despliegue con Cloud Build..."
    echo ""
    
    # Commit y push de cambios si hay alguno
    if [[ -n $(git status -s) ]]; then
        echo "📤 Commiteando cambios locales..."
        git add .
        git commit -m "chore: Update configuration for Cloud Run deployment" || true
        git push origin main
    fi
    
    # Ejecutar Cloud Build
    echo ""
    echo "🔨 Ejecutando Cloud Build..."
    gcloud builds submit --config cloudbuild.yaml --project=$PROJECT_ID
    
    echo ""
    echo "✅ Construcción y despliegue completados!"
else
    echo "⚠️  Saltando despliegue. Puedes ejecutarlo manualmente con:"
    echo "   gcloud builds submit --config cloudbuild.yaml --project=$PROJECT_ID"
fi
echo ""

# Paso 5: Verificar despliegue
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 PASO 5: Verificar Despliegue"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)' 2>/dev/null || echo "No disponible")

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ DESPLIEGUE COMPLETADO                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 RESUMEN DEL DESPLIEGUE:"
echo "   • Proyecto GCP: $PROJECT_ID"
echo "   • Región: $REGION"
echo "   • Servicio: $SERVICE_NAME"
echo "   • URL de la aplicación: $SERVICE_URL"
echo ""
echo "🔍 PRÓXIMOS PASOS:"
echo "   1. Verifica que la aplicación esté funcionando: $SERVICE_URL"
echo "   2. Accede al dashboard admin: $SERVICE_URL/admin"
echo "   3. Revisa los logs en GCP Console si hay algún problema"
echo ""
echo "📚 DOCUMENTACIÓN:"
echo "   • GCP Console: https://console.cloud.google.com/run?project=$PROJECT_ID"
echo "   • Logs: https://console.cloud.google.com/logs?project=$PROJECT_ID"
echo "   • Secrets: https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
echo ""
