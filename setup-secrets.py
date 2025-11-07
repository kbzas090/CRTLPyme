#!/usr/bin/env python3
"""
Script para configurar secrets en GCP Secret Manager
Requiere: pip install google-cloud-secret-manager
"""

from google.cloud import secretmanager
import sys

def create_or_update_secret(project_id: str, secret_id: str, secret_value: str):
    """Crea o actualiza un secret en GCP Secret Manager"""
    
    client = secretmanager.SecretManagerServiceClient()
    parent = f"projects/{project_id}"
    secret_path = f"{parent}/secrets/{secret_id}"
    
    try:
        # Intentar obtener el secret existente
        client.get_secret(name=secret_path)
        print(f"✏️  Secret '{secret_id}' ya existe, agregando nueva versión...")
        
        # Agregar una nueva versión
        parent_version = secret_path
        payload = secret_value.encode("UTF-8")
        response = client.add_secret_version(
            request={"parent": parent_version, "payload": {"data": payload}}
        )
        print(f"✅ Secret '{secret_id}' actualizado: {response.name}")
        
    except Exception as e:
        if "NOT_FOUND" in str(e):
            print(f"➕ Creando secret '{secret_id}'...")
            
            # Crear el secret
            secret = client.create_secret(
                request={
                    "parent": parent,
                    "secret_id": secret_id,
                    "secret": {"replication": {"automatic": {}}},
                }
            )
            
            # Agregar la primera versión
            payload = secret_value.encode("UTF-8")
            version = client.add_secret_version(
                request={"parent": secret.name, "payload": {"data": payload}}
            )
            print(f"✅ Secret '{secret_id}' creado: {version.name}")
        else:
            print(f"❌ Error al procesar secret '{secret_id}': {e}")
            raise

def main():
    project_id = "crtlpyme-477300"
    
    print(f"🔐 Configurando secrets en GCP Secret Manager para proyecto: {project_id}\n")
    
    secrets = {
        "SENDGRID_FROM_EMAIL": "kbzas090@gmail.com",
        "NEXTAUTH_SECRET": "fe1ed7667875163c5fec73728bfa468aa33e24452ceac33891427172ca11c2b3",
        "TRANSBANK_COMMERCE_CODE": "597055555532",
        "TRANSBANK_ENVIRONMENT": "integration",
    }
    
    success_count = 0
    error_count = 0
    
    for secret_id, secret_value in secrets.items():
        try:
            create_or_update_secret(project_id, secret_id, secret_value)
            success_count += 1
            print()
        except Exception as e:
            print(f"❌ Error: {e}\n")
            error_count += 1
    
    print("\n" + "="*60)
    print(f"✅ Configuración completada!")
    print(f"   - Secrets exitosos: {success_count}")
    print(f"   - Errores: {error_count}")
    print("="*60)
    
    if error_count > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
