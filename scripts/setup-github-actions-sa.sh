#!/bin/bash

# Script para configurar Service Account para GitHub Actions y CI/CD
# Ejecutar desde Google Cloud Shell: https://console.cloud.google.com/?cloudshell=true&project=crtlpyme-477300

set -e  # Exit on error

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID="crtlpyme-477300"
SA_NAME="github-actions"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Configuración de Service Account para GitHub Actions ${NC}"
echo -e "${BLUE}   Proyecto: ${PROJECT_ID}${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

# Configurar proyecto
echo -e "${YELLOW}[1/5]${NC} Configurando proyecto GCP..."
gcloud config set project $PROJECT_ID
echo -e "${GREEN}✓ Proyecto configurado${NC}\n"

# Verificar si ya existe la service account
echo -e "${YELLOW}[2/5]${NC} Verificando Service Account..."
if gcloud iam service-accounts describe $SA_EMAIL --project=$PROJECT_ID &>/dev/null; then
    echo -e "${GREEN}✓ Service Account ya existe: ${SA_EMAIL}${NC}"
    echo -e "${YELLOW}  Actualizaremos los permisos...${NC}\n"
else
    echo -e "${YELLOW}  Creando Service Account...${NC}"
    gcloud iam service-accounts create $SA_NAME \
        --description="Service Account para despliegues automáticos desde GitHub Actions" \
        --display-name="GitHub Actions CI/CD" \
        --project=$PROJECT_ID
    
    echo -e "${GREEN}✓ Service Account creada: ${SA_EMAIL}${NC}\n"
fi

# Habilitar APIs necesarias
echo -e "${YELLOW}[3/5]${NC} Habilitando APIs necesarias..."
APIS=(
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "artifactregistry.googleapis.com"
    "secretmanager.googleapis.com"
    "storage-api.googleapis.com"
    "storage-component.googleapis.com"
)

for API in "${APIS[@]}"; do
    echo -e "  Habilitando ${API}..."
    gcloud services enable $API --project=$PROJECT_ID --quiet || true
done
echo -e "${GREEN}✓ APIs habilitadas${NC}\n"

# Asignar roles necesarios
echo -e "${YELLOW}[4/5]${NC} Asignando roles y permisos..."
ROLES=(
    "roles/run.admin"
    "roles/iam.serviceAccountUser"
    "roles/storage.admin"
    "roles/secretmanager.secretAccessor"
    "roles/artifactregistry.writer"
)

for ROLE in "${ROLES[@]}"; do
    echo -e "  Asignando ${ROLE}..."
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$ROLE" \
        --condition=None \
        --quiet 2>/dev/null || true
done
echo -e "${GREEN}✓ Roles asignados correctamente${NC}\n"

# Verificar permisos
echo -e "${YELLOW}Verificando permisos asignados:${NC}"
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:${SA_EMAIL}" \
    --format="table(bindings.role)"
echo ""

# Crear key
echo -e "${YELLOW}[5/5]${NC} Creando Service Account Key..."
KEY_FILE="$HOME/gcp-sa-key-github-actions.json"

# Eliminar key anterior si existe
if [ -f "$KEY_FILE" ]; then
    echo -e "${YELLOW}  Key anterior encontrada, será reemplazada...${NC}"
    rm -f "$KEY_FILE"
fi

gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SA_EMAIL \
    --project=$PROJECT_ID

echo -e "${GREEN}✓ Service Account Key creada exitosamente${NC}\n"

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ CONFIGURACIÓN COMPLETADA${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}📋 Información del Service Account:${NC}"
echo -e "   Email: ${GREEN}${SA_EMAIL}${NC}"
echo -e "   Key guardada en: ${GREEN}${KEY_FILE}${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   📝 SIGUIENTES PASOS - CONFIGURAR GITHUB SECRET${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Paso 1:${NC} Ver el contenido de la clave"
echo -e "   ${GREEN}cat ${KEY_FILE}${NC}"
echo ""

echo -e "${YELLOW}Paso 2:${NC} Copiar TODO el contenido JSON (desde { hasta })"
echo ""

echo -e "${YELLOW}Paso 3:${NC} Ir a GitHub Secrets"
echo -e "   ${BLUE}https://github.com/kbzas090/CRTLPyme/settings/secrets/actions${NC}"
echo ""

echo -e "${YELLOW}Paso 4:${NC} Configurar el secreto"
echo -e "   • Click en ${GREEN}'New repository secret'${NC}"
echo -e "   • Nombre: ${GREEN}GCP_SA_KEY${NC}"
echo -e "   • Valor: ${GREEN}Pegar el JSON completo${NC}"
echo -e "   • Click en ${GREEN}'Add secret'${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   🚀 PROBAR EL DEPLOYMENT${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

echo -e "Una vez configurado el secreto, el deployment se ejecutará automáticamente con:"
echo -e "   • Cada push a ${GREEN}main${NC}"
echo -e "   • Manualmente desde: ${BLUE}https://github.com/kbzas090/CRTLPyme/actions${NC}"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✨ Script completado exitosamente${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}\n"
