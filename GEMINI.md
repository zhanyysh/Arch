# Build Control - Project Context

## Project Overview
**Build Control** is a centralized web platform designed for architectural and construction companies to manage projects, track progress in real-time, and coordinate teams. The platform emphasizes accountability through a "Before/After" photo reporting system for tasks.

### Core Technologies
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** JWT-based sessions (using `jose` and HTTP-only cookies)
- **Styling:** Vanilla CSS (Custom properties, responsive via Media Queries)
- **File Storage:** Cloudinary (for task-related photos)
- **Validation:** Zod

## User Roles & Permissions
The system operates on a strictly managed access model where all accounts are created by the Administrator.

| Role | Responsibility | Key Access |
| :--- | :--- | :--- |
| **Administrator** | Platform Owner | Full system access, company/user management, system configuration. |
| **Manager** | Project Leader | Create/manage projects and stages, assign foremen, view reports. |
| **Foreman** | Site Supervisor | Manage stages and tasks, assign workers, approve/reject work quality. |
| **Worker** | Field Executor | Execute assigned tasks, upload mandatory "After" photos for completion. |

## Data Model (High-Level)
- **Company:** The top-level tenant. Data isolation is enforced at the company level.
- **Project:** Belong to a company, contain multiple stages.
- **Stage:** Chronological phases of a project.
- **Task:** Atomic work units within a stage. Requires a "Before" photo (optional, from Foreman) and an "After" photo (mandatory, from Worker).
- **Material:** Tracking of construction materials used in projects.
- **PhotoReport:** Stores links to Cloudinary for "Before" and "After" evidence.
- **AuditLog:** Tracks administrative and critical system actions.

## Getting Started

### Environment Setup
Required environment variables (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Secret for signing session tokens.
- `CLOUDINARY_URL`: Configuration for Cloudinary uploads.

### Key Commands
- **Install Dependencies:** `npm install`
- **Database Migration:** `npx prisma migrate dev`
- **Seed Data:** `npm run db:seed`
- **Create Initial Admin:** `npx tsx scripts/create-admin.ts`
- **Run Development Server:** `npm run dev`
- **Build for Production:** `npm run build`
- **Linting:** `npm run lint`

## Development Conventions

### Backend & API
- **Service Layer:** Business logic is encapsulated in `lib/` (e.g., `admin-service.ts`).
- **Authentication:** Use `requireSession()` or `requireRole()` from `lib/auth.ts` in Server Components/Actions.
- **Data Isolation:** Always use `enforceTenantGuard(companyId)` to ensure users only access their own company's data.
- **API Routes:** Located in `app/api/`. Prefer Server Actions for form submissions.

### Frontend
- **Styling:** Use CSS variables defined in `app/globals.css`. Do not use utility-first frameworks unless specifically requested.
- **Components:** Shared components reside in `app/components/`.
- **Layouts:** Role-specific layouts are used to provide the appropriate sidebar and navigation context.

### Testing & Validation
- **Zod:** Used for both API request validation and form data parsing.
- **Prisma:** Always run `npx prisma generate` after schema changes to update TypeScript types.

## File Structure Highlights
- `app/`: Next.js App Router (UI & API).
- `lib/`: Core logic, auth, database client, and domain types.
- `prisma/`: Database schema and migration history.
- `public/`: Static assets and local upload fallbacks.
- `scripts/`: Utility scripts for maintenance and initial setup.
