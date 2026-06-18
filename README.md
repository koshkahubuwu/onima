# onima

Clon de AminoApps: comunidades temáticas con posts, likes, comentarios y chat en tiempo real. Construido como web app responsive (Next.js + PostgreSQL + Socket.IO).

## Stack

- **Next.js 16** (App Router, TypeScript) + Tailwind CSS
- **PostgreSQL** vía **Prisma 7** (driver adapter `@prisma/adapter-pg`)
- **NextAuth (Auth.js v5)** con credenciales (email/contraseña)
- **Socket.IO** en un proceso aparte para el chat en tiempo real, autenticado con un JWT corto emitido por `/api/socket-token`

## Requisitos

- Node.js 20+
- PostgreSQL corriendo localmente (o accesible vía `DATABASE_URL`)

## Configuración

1. Copia `.env` y ajusta `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SOCKET_URL` según tu entorno.
2. Instala dependencias:

   ```bash
   npm install
   ```

3. Aplica las migraciones:

   ```bash
   npx prisma migrate deploy
   ```

4. Levanta la app (Next.js + servidor de Socket.IO en paralelo):

   ```bash
   npm run dev
   ```

   Esto abre Next.js en `http://localhost:3000` y el servidor de chat en `http://localhost:4001`.

## Funcionalidades

- Registro / login de usuarios
- Crear y unirse a comunidades ("Aminos")
- Publicar posts dentro de una comunidad, con likes y comentarios
- Chat en tiempo real por comunidad (sala "General" creada automáticamente)
- Perfil de usuario con sus comunidades y publicaciones

## Próximos pasos posibles

- Empaquetar esta web app como app nativa (Capacitor) o reescribir el frontend en React Native, reutilizando la misma API/base de datos.
- Subida de imágenes (avatares, posts) a un almacenamiento externo.
- Roles de moderación (líderes/curadores) dentro de cada comunidad.
