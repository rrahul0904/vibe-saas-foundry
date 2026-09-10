# Vibe SaaS Foundry

A clean-room, production-oriented reference SaaS for AI-assisted software development. It applies the strongest idea behind full-stack vibe-coding toolkits: give coding agents a **working product to transform**, not an empty boilerplate to invent from scratch.

## Applications

| App | Stack | Purpose |
|---|---|---|
| `apps/api` | NestJS + TypeORM + PostgreSQL | Identity, sessions, tasks, audit and operator APIs |
| `apps/web` | React + Vite | Customer SaaS with optimistic task UX |
| `apps/admin` | React + Vite | Authenticated operator console |
| `apps/marketing` | Next.js App Router | Static marketing surface |
| `apps/mobile` | Flutter | Mobile reference client |

Shared contracts and design tokens live under `packages/`.

## Implemented foundation
- registration and transactional email verification
- resend verification
- password login with bcrypt hashing
- password reset with one-time expiring tokens
- revocable opaque sessions and logout everywhere
- password reset revokes all previous sessions
- member/operator persisted roles
- operator bootstrap allowlist via `OPERATOR_EMAILS`
- operator-only admin metrics, users and security audit history
- global and auth-specific request throttling
- Helmet security headers and strict DTO allowlisting
- task create/read/update/delete with ownership enforcement
- URL-persisted customer list state
- optimistic task updates with rollback
- Docker Compose + migration-first production startup
- CI typecheck/build/test pipeline
- agent-readable architecture and transformation recipes

## Local start

```bash
cp .env.example .env
corepack enable
pnpm install
docker compose up -d postgres
pnpm db:migrate
pnpm dev
```

Default development URLs:
- API: http://localhost:4000
- Web: http://localhost:5173
- Admin: http://localhost:5174
- Marketing: http://localhost:3000

Set your email in `OPERATOR_EMAILS`, register and verify that account, then sign into the admin application with the same email/password. During non-production auth flows, verification/reset tokens are also returned in responses for local testing. Production never returns those secrets and expects `RESEND_API_KEY` to be configured.

## Docker

```bash
docker compose up --build
```

Docker production mode runs TypeORM migrations before the API starts; schema synchronization is disabled.

## Clean-room scope
This repository is an original implementation derived from publicly observable product concepts and standard SaaS patterns. It does not contain or claim access to the commercial toolkit's private source code.

See `docs/PROJECT_PLAN.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, and `docs/ROADMAP.md`.
