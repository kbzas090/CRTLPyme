#!/bin/bash

# Script para configurar secrets en GCP Secret Manager
# Ejecutar este script en Cloud Shell de GCP

PROJECT_ID="crtlpyme-442414"
REGION="us-central1"

echo "🔐 Configurando secrets en GCP Secret Manager para proyecto: $PROJECT_ID"
echo ""

# Configurar proyecto
gcloud config set project $PROJECT_ID

# Función para crear o actualizar un secret
create_or_update_secret() {
    SECRET_NAME=$1
    SECRET_VALUE=$2
    
    # Verificar si el secret ya existe
    if gcloud secrets describe $SECRET_NAME --project=$PROJECT_ID &>/dev/null; then
        echo "✏️  Secret '$SECRET_NAME' ya existe, actualizando..."
        echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=- --project=$PROJECT_ID
        echo "✅ Secret '$SECRET_NAME' actualizado"
    else
        echo "➕ Creando secret '$SECRET_NAME'..."
        echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME --data-file=- --replication-policy="automatic" --project=$PROJECT_ID
        echo "✅ Secret '$SECRET_NAME' creado"
    fi
    echo ""
}

# Crear/actualizar los secrets
create_or_update_secret "SENDGRID_FROM_EMAIL" "kbzas090@gmail.com"
create_or_update_secret "NEXTAUTH_SECRET" "fe1ed7667875163c5fec73728bfa468aa33e24452ceac33891427172ca11c2b3"
create_or_update_secret "TRANSBANK_COMMERCE_CODE" "597055555532"
create_or_update_secret "TRANSBANK_ENVIRONMENT" "integration"

echo ""
echo "🎉 Todos los secrets han sido configurados correctamente!"
echo ""
echo "📋 Secrets configurados:"
gcloud secrets list --project=$PROJECT_ID

echo ""
echo "✅ Configuración completada. Ahora puedes desplegar la aplicación a Cloud Run."
