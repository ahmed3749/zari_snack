<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# AGENTS.md

## Project
Restaurant web app with public pages and protected admin panel.

## Stack
Next.js App Router
TypeScript
Tailwind CSS
PostgreSQL
Prisma

## Rules
Use server components by default.
Use client components only when needed.
Keep code simple and readable.
Validate forms on frontend and backend.
Do not expose inactive products on public pages.
Store orders in database before redirecting to WhatsApp.

## Important paths
app/
components/
lib/
prisma/

## Commands
npm run dev
npx prisma migrate dev
npx prisma studio
npm run lint