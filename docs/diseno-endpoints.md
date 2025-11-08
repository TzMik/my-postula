# 💻 Operaciones Necesarias (Next.js $\to$ Supabase SDK)

Las siguientes son las **operaciones CRUD** que el Frontend ejecutará. Cada una requiere que el usuario esté autenticado para pasar el filtro de **Row Level Security (RLS)**.

## 1. 🔑 Gestión de Autenticación (Auth)

Esta gestión es manejada directamente por el módulo `auth` de Supabase, no requiere un diseño de *endpoint* específico.

| Operación | Método SDK | Función |
| :--- | :--- | :--- |
| **Registrar** | `supabase.auth.signUp()` | Crea un nuevo usuario y su registro en `auth.users` y `Perfiles`. |
| **Iniciar Sesión** | `supabase.auth.signInWithPassword()` | Autentica al usuario. |
| **Cerrar Sesión** | `supabase.auth.signOut()` | Cierra la sesión activa. |

## 2. 🏢 Gestión de Empresas (`Empresas`)

Esta operación es necesaria antes de registrar una postulación.

| Operación | Método SDK | Lógica |
| :--- | :--- | :--- |
| **Buscar/Crear Empresa** | `supabase.from('Empresas').select()` + `insert()` | El Frontend primero **busca** si la empresa ya existe por nombre. Si no existe, la **crea** y devuelve su `id`. |

## 3. 📄 Gestión de Postulaciones (`Postulaciones`)

Esta es la funcionalidad central de la aplicación.

| Operación | Método SDK | Petición Equivalente | Descripción y Filtros |
| :--- | :--- | :--- | :--- |
| **Registrar Postulación** | `supabase.from('Postulaciones').insert()` | `POST /postulaciones` | Crea un nuevo registro. Requiere `user_id` y el `empresa_id` previamente obtenido. |
| **Obtener Todas** | `supabase.from('Postulaciones').select().eq('user_id', ...)` | `GET /postulaciones` | **Recupera todas las postulaciones del usuario**. Incluye la información de la `Empresa` con *join* (`.select('*, Empresas(nombre, ...)')`). |
| **Obtener Detalle** | `supabase.from('Postulaciones').select().eq('id', ...)` | `GET /postulaciones/{id}` | Recupera una postulación específica (asegura que `user_id` coincida). |
| **Actualizar Estado** | `supabase.from('Postulaciones').update().eq('id', ...)` | `PATCH /postulaciones/{id}` | Actualiza campos (ej. `estado`, `sueldo_esperado`). |
| **Eliminar** | `supabase.from('Postulaciones').delete().eq('id', ...)` | `DELETE /postulaciones/{id}` | Elimina un registro del usuario. |

