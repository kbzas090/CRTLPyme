#!/bin/bash

# Script para configurar Service Account para GitHub Actions
# Ejecutar desde Google Cloud Shell

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_ID="crtlpyme-477300"
SA_NAME="github-actions-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo -e "${YELLOW}=== Configuración de Service Account para GitHub Actions ===${NC}\n"

# Configurar proyecto
echo "Configurando proyecto..."
gcloud config set project $PROJECT_ID

# Verificar si ya existe la service account
echo "Verificando si la Service Account ya existe..."
if gcloud iam service-accounts describe $SA_EMAIL --project=$PROJECT_ID &>/dev/null; then
    echo -e "${GREEN}✓ Service Account ya existe: $SA_EMAIL${NC}"
else
    echo "Creando Service Account..."
    gcloud iam service-accounts create $SA_NAME \
        --description="Service Account para despliegues desde GitHub Actions" \
        --display-name="GitHub Actions Deployer" \
        --project=$PROJECT_ID
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Service Account creada exitosamente${NC}"
    else
        echo -e "${RED}✗ Error al crear Service Account${NC}"
        exit 1
    fi
fi

# Asignar roles necesarios
echo -e "\nAsignando roles necesarios..."
ROLES=(
    "roles/run.admin"
    "roles/iam.serviceAccountUser"
    "roles/storage.admin"
    "roles/secretmanager.secretAccessor"
)

for ROLE in "${ROLES[@]}"; do
    echo "Asignando rol: $ROLE"
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$ROLE" \
        --quiet
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Rol asignado: $ROLE${NC}"
    fi
done

# Crear key
echo -e "\nCreando Service Account Key..."
KEY_FILE="$HOME/gcp-sa-key.json"

gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SA_EMAIL \
    --project=$PROJECT_ID

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Service Account Key creada exitosamente${NC}"
    echo -e "\n${YELLOW}=== IMPORTANTE ===${NC}"
    echo "La clave se guardó en: $KEY_FILE"
    echo ""
    echo -e "${YELLOW}=== SIGUIENTE PASO ===${NC}"
    echo "1. Muestra el contenido del archivo con:"
    echo "   cat $KEY_FILE"
    echo ""
    echo "2. Copia TODO el contenido del JSON (incluyendo las llaves {})"
    echo ""
    echo "3. Ve a GitHub:"
    echo "   https://github.com/kbzas090/CRTLPyme/settings/secrets/actions"
    echo ""
    echo "4. Click en 'New repository secret'"
    echo ""
    echo "5. Nombre del secreto: GCP_SA_KEY"
    echo ""
    echo "6. Pega el contenido completo del JSON"
    echo ""
    echo "7. Click en 'Add secret'"
    echo ""
    echo -e "${GREEN}=== Listo! El CI/CD estará configurado ===${NC}"
else
    echo -e "${RED}✗ Error al crear Service Account Key${NC}"
    exit 1
fi
