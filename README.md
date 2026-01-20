# MyPostula
Sistema de gestión de postulaciones de empleo Open Source.

## Descripción
Este proyecto nació para ayudar a las personas a organizar su búsqueda laboral de forma centralizada, privada y eficiente. Desarrollado con __Next.js__, __Supabase__ y __Vercel__.

## Características
* Gestión de estados (__Abierta__, __Aceptada__ y __Rechazada__).
* Seguimiento de fechas y recordatorios.
* Panel de estadísticas personal.
* 100 Software Libre.

## Tech Stack
* Framework: Next.js (App Router)
* Base de Datos & Auth: Supabase
* Estilos: Tailwind CSS
* Despliegue: Vercel

## Instalación local
1. Clona el repo: `git clone https://github.com/TzMik/my-postula.git`

2. Instala dependencias: `npm install`

3. Configura el `.env` (usa el `.env.example`).

4. Ejecuta: `npm run dev`

### Instrucciones para Colaboradores
Configuración de la Base de Datos:

1. Crea un proyecto en [Supabase](https://supabase.com/).

2. Ve a la sección SQL Editor.

3. Copia el contenido del archivo `seed.sql` del repositorio y ejecútalo.

4. En la configuración de tu proyecto de Supabase, copia la `SUPABASE_URL` y la `SUPABASE_ANON_KEY`.

5. Pégalas en tu archivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
```

## Contribuir
¡Toda ayuda es bienvenida!. Antes de contribuir revisa las [reglas de contribución](/CONTRIBUTING.md). 

## Documentacion
- [Base de datos](/docs/diseno-tablas.md)
- [Ideas para siguientes versiones](/docs/ideas-futuras.md)
