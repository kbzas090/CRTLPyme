# Configuración de Secrets en GCP Secret Manager

## Secrets que deben crearse en GCP

**Proyecto GCP:** CRTLPyme (crtlpyme-477300)
**Región:** us-central1

### 1. SENDGRID_FROM_EMAIL
```
Nombre: SENDGRID_FROM_EMAIL
Valor: kbzas090@gmail.com
```

### 2. NEXTAUTH_SECRET
```
Nombre: NEXTAUTH_SECRET
Valor: fe1ed7667875163c5fec73728bfa468aa33e24452ceac33891427172ca11c2b3
```

### 3. TRANSBANK_COMMERCE_CODE
```
Nombre: TRANSBANK_COMMERCE_CODE
Valor: 597055555532
```

### 4. TRANSBANK_ENVIRONMENT
```
Nombre: TRANSBANK_ENVIRONMENT
Valor: integration
```

## Comando para crear secrets manualmente (usar en Cloud Shell):

```bash
# Navegar a Secret Manager en GCP Console:
# https://console.cloud.google.com/security/secret-manager?project=crtlpyme-477300

# O usar Cloud Shell con estos comandos:

echo -n "kbzas090@gmail.com" | gcloud secrets create SENDGRID_FROM_EMAIL --data-file=- --project=crtlpyme-477300

echo -n "fe1ed7667875163c5fec73728bfa468aa33e24452ceac33891427172ca11c2b3" | gcloud secrets create NEXTAUTH_SECRET --data-file=- --project=crtlpyme-477300

echo -n "597055555532" | gcloud secrets create TRANSBANK_COMMERCE_CODE --data-file=- --project=crtlpyme-477300

echo -n "integration" | gcloud secrets create TRANSBANK_ENVIRONMENT --data-file=- --project=crtlpyme-477300
```

## Secrets ya configurados:
- ✅ DATABASE_URL
- ✅ SENDGRID_API_KEY
- ✅ TRANSBANK_API_KEY (como "transbank")
