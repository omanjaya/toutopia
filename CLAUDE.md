# Project: Toutopia — Online Exam Platform (Try Out UTBK/CPNS/BUMN)

## Project Overview
A premium paid online examination platform for Indonesian standardized tests.
Full planning document: `docs/PLANNING.md`

---

## Tech Stack (Do Not Change)
- **Runtime:** Node.js 20 LTS
- **Framework:** Next.js 15+ (App Router only, no Pages Router)
- **Language:** TypeScript (strict mode)
- **ORM:** Prisma 6.x
- **Database:** PostgreSQL 16
- **Cache:** Redis 7.x
- **Storage:** MinIO (S3-compatible)
- **Styling:** Tailwind CSS 4
- **UI Library:** shadcn/ui
- **Icons:** Lucide Icons only (no emoji in UI, no other icon libraries)
- **Forms:** React Hook Form + Zod
- **State:** Zustand (global), TanStack Query (server state)
- **Auth:** NextAuth.js v5
- **Payment:** Midtrans Snap API
- **Queue:** BullMQ (Redis-backed)
- **Deployment:** Docker + Docker Compose on VPS

---

## Architecture Rules

### Layered Architecture (Strictly Enforced)
```
src/app/          -> Presentation Layer (pages, API routes, layouts)
src/core/         -> Domain Layer (entities, use-cases, interfaces, value-objects)
src/infrastructure/ -> Infrastructure Layer (database repos, external services)
src/shared/       -> Shared Layer (components, hooks, lib, types)
src/config/       -> Configuration (site config, constants)
```

### Layer Dependencies (One-Way Only)
- `app/` depends on `core/` and `shared/`
- `core/` depends on NOTHING (pure business logic, no imports from other layers)
- `infrastructure/` implements interfaces defined in `core/`
- `shared/` depends on nothing except external libraries
- NEVER import from `infrastructure/` directly in `app/` — always go through `core/` use-cases

### File Naming Conventions
- Files: `kebab-case.ts` (e.g., `create-question.use-case.ts`)
- Components: `kebab-case.tsx` (e.g., `question-card.tsx`)
- Types: `kebab-case.types.ts`
- Prisma models: `PascalCase` (e.g., `ExamPackage`)
- Database tables: `snake_case` via `@@map()` (e.g., `exam_packages`)
- Environment variables: `SCREAMING_SNAKE_CASE`

---

## Code Rules

### TypeScript
- `strict: true` in tsconfig — no exceptions
- No `any` type — use `unknown` if type is truly unknown, then narrow
- No `@ts-ignore` or `@ts-expect-error` — fix the type instead
- No type assertions (`as Type`) unless absolutely necessary with a comment explaining why
- All function parameters and return types must be explicitly typed
- Use `interface` for object shapes, `type` for unions/intersections/primitives
- Use `const` by default, `let` only when reassignment is needed, never `var`

### React / Next.js
- Use Server Components by default, `"use client"` only when necessary
- No `useEffect` for data fetching — use Server Components or TanStack Query
- No prop drilling beyond 2 levels — use Zustand or Context
- All pages must have proper metadata (title, description, OG tags)
- Use `next/image` for all images
- Use `next/font` for fonts (Inter)
- Loading states: use `loading.tsx` and Suspense boundaries
- Error states: use `error.tsx` boundaries

### API Routes
- Every route handler must: validate input (Zod), check auth, check authorization
- Use the standardized response format:
  ```typescript
  // Success: { success: true, data: T, meta?: { page, total } }
  // Error: { success: false, error: { code: string, message: string } }
  ```
- All errors must use domain-specific error codes (e.g., `EXAM_NOT_FOUND`, `INSUFFICIENT_CREDITS`)
- Never expose internal error details to clients in production
- Always use try-catch in route handlers with the centralized error handler

### Database / Prisma
- Never write raw SQL — use Prisma Client
- All queries must select only needed fields (no `findMany()` without `select` or explicit purpose)
- Use transactions for multi-step mutations
- Always use `@@index` for frequently queried columns
- Soft-delete for user-facing content (use status field), hard-delete only for truly ephemeral data

### Validation
- Zod schemas are the single source of truth for validation
- Define schemas in `src/shared/lib/validators.ts` or co-located with use-cases
- Reuse schemas between client and server
- Never trust client-side validation — always validate server-side

---

## Component Rules

### shadcn/ui
- Install components via `npx shadcn@latest add <component>`
- Components go in `src/shared/components/ui/`
- Customize via Tailwind classes, do not modify shadcn source files directly
- If customization is heavy, create a wrapper component in the appropriate domain folder

### Custom Components
- One component per file
- Props interface defined in the same file, named `{ComponentName}Props`
- No inline styles — Tailwind only
- Use `cn()` utility for conditional classes
- Shared components in `src/shared/components/`
- Feature-specific components co-located with features (e.g., `src/shared/components/exam/`)

### Icons
- ONLY use Lucide Icons (`lucide-react`)
- No emoji anywhere in the UI
- No other icon libraries (no FontAwesome, no Heroicons, etc.)
- Import individually: `import { Plus } from "lucide-react"`
- Default size: 20px, stroke-width: 1.5

### Styling
- Tailwind CSS utility classes only — no custom CSS unless absolutely necessary
- Follow the color system defined in PLANNING.md (primary blue, etc.)
- Dark mode: not in scope for MVP (design for light mode only)
- Responsive: mobile-first approach (base -> sm -> md -> lg -> xl)
- Spacing: use Tailwind spacing scale consistently

---

## Security Rules (Non-Negotiable)

### Authentication & Authorization
- Every API route that modifies data MUST check authentication
- Every API route MUST check authorization (role-based)
- Use the `requireAuth()` and `requireRole()` middleware pattern
- Never expose user IDs in URLs that could be enumerated
- Use CUID for all IDs (not auto-increment integers)

### Input Handling
- ALL user input validated with Zod before processing
- HTML content sanitized with DOMPurify before storage
- File uploads: validate MIME type, enforce size limits
- Never interpolate user input into queries (Prisma handles this, but be aware)

### Secrets & Configuration
- All secrets in environment variables
- Never hardcode secrets, API keys, or passwords
- `.env` files must be in `.gitignore`
- Use `.env.example` with placeholder values for documentation

### Headers & Cookies
- Cookies: `httpOnly`, `secure`, `sameSite: strict`
- Security headers set via Nginx (see PLANNING.md)
- CORS: whitelist specific origins only

### Payment
- Verify Midtrans webhook signatures on every callback
- Validate transaction amounts server-side
- Idempotent payment processing (check status before updating)
- Log all payment events for audit trail

---

## Anti-Cheat Rules
- Timer is server-authoritative — client timer is display only
- Store `serverStartedAt` and `serverDeadline` in ExamAttempt
- Reject any answer submission after `serverDeadline`
- Question and option order randomized per attempt
- Correct answers NEVER sent to client during active exam
- Tab violation events logged with timestamps
- Violation thresholds configurable per ExamPackage

---

## Testing Rules
- Unit tests for all use-cases (`src/core/use-cases/`)
- Integration tests for API routes
- E2E tests for critical flows: auth, exam session, payment
- Test files co-located: `*.test.ts` next to source files
- Use Vitest for unit/integration, Playwright for E2E
- Minimum coverage target: 80% for core/ layer

---

## Git Rules
- Branch naming: `feat/`, `fix/`, `refactor/`, `chore/` prefixes
- Commit messages: conventional commits (feat:, fix:, refactor:, chore:, test:, docs:)
- Never commit `.env` files, only `.env.example`
- Never commit `node_modules/`, `.next/`, `dist/`
- PR required for main branch (even solo developer — good habit)

---

## Performance Rules
- No N+1 queries — use Prisma `include` or separate optimized queries
- Paginate all list endpoints (cursor-based preferred, offset acceptable)
- Cache frequently accessed data in Redis (categories, packages)
- Use React Server Components to minimize client-side JS
- Lazy load heavy components (charts, editor) with `next/dynamic`
- Images: always use `next/image` with explicit width/height

---

## What NOT to Do
- Do NOT use Pages Router (only App Router)
- Do NOT use CSS Modules or styled-components (Tailwind only)
- Do NOT use emoji in UI (Lucide Icons only)
- Do NOT use `any` type
- Do NOT skip input validation on API routes
- Do NOT send correct answers to client during exam
- Do NOT trust client-side timers for exam duration
- Do NOT store secrets in code
- Do NOT create documentation files unless explicitly asked
- Do NOT over-engineer — solve the current problem, not hypothetical future ones
- Do NOT add comments that restate what the code does — only add comments for "why"
- Do NOT create abstraction layers for things used only once
