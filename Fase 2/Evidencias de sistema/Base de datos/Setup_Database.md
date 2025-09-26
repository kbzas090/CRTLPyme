# Configuración de Base de Datos - CRTLPyme

## Requisitos
- PostgreSQL 13 o superior
- Acceso de administrador a la base de datos

## Instalación

### 1. Crear Base de Datos
```sql
CREATE DATABASE crtlpyme_db;
CREATE USER crtlpyme_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE crtlpyme_db TO crtlpyme_user;
```

### 2. Ejecutar Schema
```bash
psql -U crtlpyme_user -d crtlpyme_db -f Schema_Database.sql
```

### 3. Datos de Prueba (Opcional)
```bash
psql -U crtlpyme_user -d crtlpyme_db -f Sample_Data.sql
```

## Variables de Entorno
```
DATABASE_URL=postgresql://crtlpyme_user:secure_password@localhost:5432/crtlpyme_db
```

## Backup y Restauración
### Backup
```bash
pg_dump -U crtlpyme_user crtlpyme_db > backup.sql
```

### Restauración
```bash
psql -U crtlpyme_user -d crtlpyme_db < backup.sql
```
