# ArchManager v1 - Implementation Start

This repository now contains the first implementation slice from the PRD:

- Public landing page with clear account-acquisition call flow
- Real authentication with JWT session cookie, expiry, and logout
- Role guards via Next.js proxy and server-side access checks
- Tenant-aware database queries for role dashboards
- Prisma database schema + migration for companies/users/projects/stages/tasks/photo reports
- Admin CRUD for companies and users with audit logging

## Tech Stack

- Next.js (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- JOSE (JWT) + bcryptjs
- CSS (custom design system with CSS variables)

## Run

```bash
npm install
createdb architect
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open http://localhost:3000

## Implemented Routes

- `/` - Landing page
- `/login` - Login form with backend authentication
- `/api/auth/login` - JWT session start
- `/api/auth/logout` - Session end
- `/dashboard/admin` - Admin panel + companies/users CRUD
- `/dashboard/manager` - Manager dashboard (tenant-scoped metrics)
- `/dashboard/foreman` - Foreman dashboard (tenant/user-scoped metrics)
- `/dashboard/worker` - Worker dashboard (user-scoped metrics)
- `/projects` - Project list + manager project creation
- `/projects/:id` - Project details + project status update
- `/projects/:id/stages` - Stage creation and stage status updates

## Seed Credentials

- Admin: admin@archmanager.local / Admin123!
- Manager: manager@archmanager.local / Manager123!
- Foreman: foreman@archmanager.local / Foreman123!
- Worker: worker@archmanager.local / Worker123!

## Next Steps (Planned)

1. Add task lifecycle pages with mandatory photo-after completion checks.
2. Add before/after review workflow and rework history.
3. Expand audit logs and reporting views.
4. Add tests for auth matrix, tenant isolation, and critical workflows.
