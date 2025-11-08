# 🛠️ Diseño de Tablas (Supabase/PostgreSQL)

Necesitarás tres tablas principales, incluyendo una tabla de "Empresas" centralizada.

## 1. `Empresas` (Tabla de Referencia)

| Campo | Tipo | Restricción | Propósito |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Auto | Identificador único de la empresa. |
| `nombre` | VARCHAR | UNIQUE, NOT NULL | Nombre oficial de la empresa (Ej. Google, Meta). |
| `url_web` | VARCHAR | Opcional | URL de la página web principal de la empresa. |
| `industria` | VARCHAR | Opcional | Sector al que pertenece (Ej. Finanzas, Tecnología). |

## 2. `Postulaciones` (Tabla Principal)

| Campo | Tipo | Restricción | Propósito |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Auto | ID de la postulación. |
| `user_id` | UUID | FK (auth.users), NOT NULL | Usuario al que pertenece la postulación. **Clave para RLS**. |
| `empresa_id` | UUID | FK (`Empresas.id`), NOT NULL | Relación con la tabla `Empresas`. |
| `puesto` | VARCHAR | NOT NULL | Título específico del trabajo (Ej. DevOps Junior). |
| `sueldo_esperado` | NUMERIC | Opcional | Salario que el candidato espera. |
| `fecha_postulacion` | DATE | NOT NULL | Fecha en que se aplicó. |
| `estado` | VARCHAR | NOT NULL | Estado actual (Postulado, Entrevista, Rechazado). |
| `url_oferta` | VARCHAR | Opcional | Enlace directo a la oferta de trabajo. |

## 3. `Perfiles` (Tabla de Usuario)

| Campo | Tipo | Restricción | Propósito |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, FK (auth.users) | Conecta el perfil con el ID de autenticación de Supabase. |
| `nombre_completo` | VARCHAR | Opcional | Nombre del usuario. |
