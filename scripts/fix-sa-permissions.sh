#!/bin/bash

# Script para verificar y corregir permisos del Service Account existente
# Ejecutar desde Google Cloud Shell: https://console.cloud.google.com/?cloudshell=true&project=crtlpyme-477300

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ID="crtlpyme-477300"
SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Verificación y Corrección de Permisos${NC}"
echo -e "${BLUE}   Service Account: ${SA_EMAIL}${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

# Configurar proyecto
echo -e "${YELLOW}[1/4]${NC} Configurando proyecto..."
gcloud config set project $PROJECT_ID
echo -e "${GREEN}✓ Proyecto configurado${NC}\n"

# Verificar que el SA existe
echo -e "${YELLOW}[2/4]${NC} Verificando Service Account..."
if ! gcloud iam service-accounts describe $SA_EMAIL --project=$PROJECT_ID &>/dev/null; then
    echo -e "${RED}✗ Service Account no encontrada: ${SA_EMAIL}${NC}"
    echo -e "${YELLOW}   Ejecuta el script setup-github-actions-sa.sh primero${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Service Account encontrada${NC}\n"

# Habilitar APIs
echo -e "${YELLOW}[3/4]${NC} Habilitando APIs necesarias..."
APIS=(
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "artifactregistry.googleapis.com"
    "secretmanager.googleapis.com"
    "storage-api.googleapis.com"
    "storage-component.googleapis.com"
)

for API in "${APIS[@]}"; do
    echo -e "  • ${API}"
    gcloud services enable $API --project=$PROJECT_ID --quiet 2>/dev/null || true
done
echo -e "${GREEN}✓ APIs habilitadas${NC}\n"

# Asignar/Verificar roles
echo -e "${YELLOW}[4/4]${NC} Asignando permisos necesarios..."
ROLES=(
    "roles/run.admin"
    "roles/iam.serviceAccountUser"
    "roles/storage.admin"
    "roles/secretmanager.secretAccessor"
    "roles/artifactregistry.writer"
)

for ROLE in "${ROLES[@]}"; do
    echo -e "  • Asignando ${ROLE}..."
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$ROLE" \
        --condition=None \
        --quiet 2>/dev/null || true
done
echo -e "${GREEN}✓ Permisos actualizados${NC}\n"

# Mostrar permisos actuales
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   Permisos actuales del Service Account:${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:${SA_EMAIL}" \
    --format="table(bindings.role)" | grep -E "ROLE|roles/"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ Permisos verificados y actualizados${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Próximo paso:${NC}"
echo -e "  Si aún no has configurado el secreto GCP_SA_KEY en GitHub,"
echo -e "  ejecuta: ${GREEN}./setup-github-actions-sa.sh${NC}"
echo ""
