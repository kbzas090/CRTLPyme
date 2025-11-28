#!/bin/bash

# Script de deployment para CRTLPyme
# Hace build local, commit y push para activar GitHub Actions

set -e

echo "🚀 Iniciando proceso de deployment de CRTLPyme..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    echo "Asegúrate de ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

# 1. Build local para verificar
echo -e "${YELLOW}📦 Ejecutando build local...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el build local${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build local exitoso${NC}"
echo ""

# 2. Verificar cambios
echo -e "${YELLOW}🔍 Verificando cambios...${NC}"
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${YELLOW}ℹ️  No hay cambios para commitear${NC}"
    
    # Preguntar si quiere forzar redeploy
    read -p "¿Deseas forzar un redeploy con commit vacío? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git commit --allow-empty -m "chore: force redeploy"
        echo -e "${GREEN}✅ Commit vacío creado${NC}"
    else
        echo -e "${YELLOW}⚠️  Deployment cancelado${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}✅ Hay cambios pendientes${NC}"
    
    # Mostrar cambios
    echo ""
    echo -e "${YELLOW}Cambios detectados:${NC}"
    git status --short
    echo ""
    
    # Preguntar mensaje de commit
    read -p "Mensaje del commit (presiona Enter para usar mensaje automático): " commit_msg
    
    if [ -z "$commit_msg" ]; then
        commit_msg="chore: deployment $(date +%Y-%m-%d_%H:%M:%S)"
    fi
    
    # Hacer commit
    git add .
    git commit -m "$commit_msg"
    echo -e "${GREEN}✅ Commit creado: $commit_msg${NC}"
fi

echo ""

# 3. Push a main
echo -e "${YELLOW}📤 Haciendo push a origin/main...${NC}"
git push origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al hacer push${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Push exitoso${NC}"
echo ""

# 4. Información de seguimiento
echo -e "${GREEN}🎉 Deployment iniciado exitosamente${NC}"
echo ""
echo "📊 Seguimiento del deployment:"
echo "   • GitHub Actions: https://github.com/kbzas090/CRTLPyme/actions"
echo "   • Cloud Run: https://console.cloud.google.com/run?project=crtlpyme-477300"
echo ""
echo "🌐 URLs de producción:"
echo "   • App: https://crtlpyme-ean57to77a-uc.a.run.app"
echo "   • Admin SaaS: https://crtlpyme-ean57to77a-uc.a.run.app/admin-saas"
echo ""
echo -e "${YELLOW}⏳ El deployment tomará aproximadamente 3-4 minutos${NC}"
echo ""
