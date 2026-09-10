# Vibe SaaS Foundry

A clean-room, production-oriented reference SaaS for AI-assisted software development. Give coding agents a **working product to transform**, not an empty boilerplate to invent from scratch.

## Applications

| App | Stack | Purpose |
|---|---|---|
| `apps/api` | NestJS + TypeORM + PostgreSQL | Identity, tenants, RBAC, entitlements, tasks, audit and operator APIs |
| `apps/web` | React + Vite | Multi-tenant customer SaaS with optimistic task UX |
| `apps/admin` | React + Vite | Authenticated operator console |
| `apps/marketing` | Next.js App Router | Static marketing surface |
| `apps/mobile` | Flutter | Multi-tenant mobile reference client |

## Implemented
- email/password identity with verification, reset and revocable sessions
- transactional email adapter, request throttling, Helmet and security audit events
- customer/operator persisted roles and authenticated operator console
- organizations/workspaces with owner/admin/member RBAC
- invitation creation, email delivery, acceptance and revocation
- membership role changes/removal with owner safeguards
- entitlement records with plan code, member limits and feature flags
- personal-workspace creation plus migration/backfill for existing users
- tenant-isolated task CRUD via `x-organization-id`
- workspace switcher and Team & Plan customer UI
- mobile workspace selection
- URL-persisted filters and optimistic task updates with rollback
- migration-first Docker startup, CI build/typecheck/test and CodeQL

## Local start

```bash
cp .env.example .env
corepack enable
pnpm install
docker compose up -d postgres
pnpm db:migrate
pnpm dev
```

Default URLs: API `:4000`, Web `:5173`, Admin `:5174`, Marketing `:3000`.

Set your email in `OPERATOR_EMAILS` before registering to bootstrap an operator. Development responses expose verification/reset/invitation tokens for local testing; production does not and requires transactional email configuration.

## Docker

```bash
docker compose up --build
```

Production Docker runs migrations before API startup and disables schema synchronization.

## Clean-room scope
Original implementation based on public product concepts and standard SaaS patterns; no commercial private source is included or claimed.

Start with `docs/PROJECT_PLAN.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/TENANCY.md`, `docs/SECURITY.md`, and `docs/ROADMAP.md`.
