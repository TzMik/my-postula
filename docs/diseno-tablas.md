# 🛠️ Diseño de Tablas (Supabase/PostgreSQL)

Necesitarás tres tablas principales, incluyendo una tabla de "Empresas" centralizada.

## 1. `companies`

| Campo | Tipo | Restricción | Propósito |
| :--- | :--- | :--- | :--- |
| `id` | INT8 | PK, Auto | Identificador único de la empresa. |
| `name` | VARCHAR | UNIQUE, NOT NULL | Nombre oficial de la empresa (Ej. Google, Meta). |
| `created_at` | TIMESTAMPZ | Fecha y hora de creación de la empresa. |

## 2. `currenices`
| Campo | Tipo | Restricción | Propósito |
| :--- | :--- | :--- | :--- |
| `id` | INT8 | PK, Auto | Identificador único de la divisa. |
| `name` | VARCHAR | UNIQUE, NOT NULL | Nombre oficial de la divisa. |
| `symbol` | VARCHAR | NOT NULL | Símbolo oficial de la divisa. |
| `iso_code` | VARCHAR | NOT NULL | Código ISO de la divisa. |
| `created_at` | TIMESTAMPZ | Fecha y hora de creación de la divisa. |

## 3. `job_applications`
| Campo | Tipo | Restricción | Propósito |
| :--- | :--- | :--- | :--- |
| `id` | INT8 | PK, Auto | ID de la postulación. |
| `user_id` | UUID | FK (auth.users), NOT NULL | Usuario al que pertenece la postulación. **Clave para RLS**. |
| `company_id` | INT8 | FK (`companies.id`), NOT NULL | Relación con la tabla `companies`. |
| `position` | VARCHAR | NOT NULL | Título específico del trabajo (Ej. DevOps Junior). |
| `expected_salary` | FLOAT8 | Opcional | Salario que el candidato espera. |
| `offer_url` | VARCHAR | Opcional | URL de la vacante de empleo. |
| `status` | VARCHAR | NOT NULL | Estado actual (Postulado, Entrevista, Rechazado). |
| `application_date` | TIMESTAMPZ | NOT NULL | Fecha en que se aplicó. |
| `salary_currency` | INT8 | FK (`currencies.id`) | Relación con la tabla `currencies`. |

## 4. `users`
| Campo | Tipo | Restricción | Propósito |
| :--- | :--- | :--- | :--- |
| `id` | INT8 | PK, FK (auth.users) | Conecta el perfil con el ID de autenticación de Supabase. |
| `auth_user_id` | UUID | FK (auth.users), NOT NULL | Usuario al que pertenece la postulación. **Clave para RLS**. |
| `name` | VARCHAR | Opcional | Nombre del usuario. |
| `last_name` | VARCHAR | Opcional | Apellido del usuario. |
| `display_name` | VARCHAR | Opcional | Nombre que el usuario quiere mostrar publicamente. |
| `img_url` | VARCHAR | Opcional | Path a la URL de la imagen del usuario. |
| `description` | TEXT | Opcional | Descripción del perfil del usuario. |
| `first_time` | BOOL | Opcional | (Por determinar). |
| `default_currency_id` | INT8 | FK (`currencies.id`) Opcional | ID de la divisa (relación a la tabla `currencies`) preferida del usuario. |
| `default_city` | VARCHAR | Opcional | Nombre de la ciudad del usuario para que se autorrellene en el formulario de postulaciones. |
| `default_country` | VARCHAR | Opcional | Nombre del país del usuario para que se autorrellene en el formulario de postulaciones. |
| `language` | VARCHAR | Opcional | Idioma preferido del usuario. |
| `theme_preference` | VARCHAR | Opcional | Tema preferido del usuario (dark, light, system). |
| `created_at` | TIMESTAMPZ | Opcional | Fecha creación del perfil del usuario. |
