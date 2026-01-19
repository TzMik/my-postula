# 🎯 Plan de Desarrollo: MyPostula

Este documento describe el plan inicial para el desarrollo de un sistema que ayuda a los candidatos a gestionar y hacer seguimiento de sus postulaciones de empleo de manera centralizada.

## 🌟 1. Objetivo del Proyecto (Visión)

Crear una herramienta sencilla, intuitiva y robusta que empodere a los buscadores de empleo, permitiéndoles registrar, rastrear y analizar sus aplicaciones a diferentes empresas, puestos y salarios esperados, cubriendo el vacío de herramientas orientadas al **candidato**.

## 🚀 2. Fase 1: Planificación y Alcance (MVP)

El enfoque inicial se centra en desarrollar el **Producto Mínimo Viable (MVP)** que cubra la funcionalidad esencial.

### 2.1. Funcionalidades Clave del MVP
| Característica | Descripción | Prioridad |
| :--- | :--- | :--- |
| **Autenticación Básica** | Registro e Inicio de sesión de usuarios. | **Alta** |
| **Registro de Postulación** | Formulario para ingresar detalles de una nueva aplicación (Empresa, Puesto, Sueldo, Fecha). | **Alta** |
| **Tablero de Postulaciones** | Vista principal (lista o kanban) para visualizar todas las entradas. | **Alta** |
| **Gestión de Estado** | Capacidad para asignar y cambiar el estado de cada postulación (e.g., Postulado, Entrevista, Rechazado). | Media |
| **CRUD Básico** | Posibilidad de **Crear**, **Leer**, **Actualizar** y **Eliminar** (CRUD) registros. | Alta |

### 2.2. Usuarios
* **Usuario Principal:** El candidato/buscador de empleo.

## 🛠️ 3. Fase 2: Diseño y Tecnología

### 3.1. Arquitectura Sugerida
* **Arquitectura:** **JAMstack/Serverless**. El Frontend (Next.js) es la capa central que maneja la lógica de presentación y se comunica directamente con los servicios Backend gestionados (Supabase).
* **Principio:** Se elimina la necesidad de desarrollar y mantener una API Backend personalizada (como Flask) para el MVP, usando los servicios automáticos de Supabase.

### 3.2. Pila Tecnológica (Tech Stack Propuesto)
| Componente | Tecnología Seleccionada | Razón Clave |
| :--- | :--- | :--- |
| **Frontend & Desarrollo** | **Next.js (React)** | Permite Renderizado del Lado del Servidor (SSR) y Static Generation (SSG) para un mejor rendimiento y SEO (aunque menos relevante en esta app privada, es buena práctica). |
| **Backend & Autenticación** | **Supabase (como Backend as a Service - BaaS)** | Proporciona **Autenticación** y genera una **API RESTful** de forma automática a partir de la DB (PostgreSQL). Elimina el desarrollo de Flask. |
| **Base de Datos** | **PostgreSQL (gestionada por Supabase)** | Base de datos relacional robusta y escalable. Gestionada, minimizando la administración. |
| **Alojamiento (Frontend)** | **Vercel** o Netlify | Optimizado para el despliegue de aplicaciones Next.js, con CDN y soporte para SSR. |
| **Control de Versiones** | **Git / GitHub** | Estándar para el control de versiones del código fuente. |

### 3.3. Modelo de Datos Básico
Se requiere dos tablas principales para el MVP.

* `Postulacion`:

| Campo | Tipo de Dato | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID/INT | Sí | Identificador único. |
| `id_usuario` | Foreign Key | Sí | Relación con el usuario que postula. |
| `id_empresa` | Foreign Key | Sí | Relación con la empresa a la que postula. |
| `puesto` | VARCHAR | Sí | Título del trabajo (Ej. Desarrollador Frontend). |
| `sueldo_esperado` | DECIMAL/INT | No | Rango salarial o cifra esperada. |
| `fecha_postulacion` | DATE/TIMESTAMP | Sí | Día en que se envió el CV. |
| `estado` | ENUM/VARCHAR | Sí | Estado actual (Postulado, Entrevista, Rechazado, etc.). |
| `url_oferta` | VARCHAR | No | Enlace a la publicación original. |

* `Empresa`:

| Campo | Tipo de Dato | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID/INT | Sí | Identificador único. |
| `Nombre` | VARCHAR | Sí | Nombre de la empresa. |

## Plan de desarrollo
* [Diseño de tablas](/docs/diseno-tablas.md)
* [Diseño de endpoints](/docs/diseno-endpoints.md)

## Configuración de entorno local
* Clonar el repositorio: `git clone https://github.com/KalenaTeam/my-postula.git`
* Instalar las dependencias: `npm install`
* Crear variables de entorno local:
    * Crear el archivo `.env.local` (copiar `.env.example` para tener la plantilla con todas las variables de entorno necesarias para hacer funcionar el proyecto)
    * Añadir las siguientes variables de entorno:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=[SUPABASE_PROJECT_PUBLIC_URL]
    NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUPABASE_ANON_KEY]
    ```
* Ejecutar el entorno de pruebas: `npm run dev`
* Entrar en `http://localhost:3000`


Idea para siguientes versiones

1. Perfil profesional
2. Obtener datos de empleos de otras plataformas
3. Creacion de CV
4. Creacion de postulaciones directamente desde mypostula
