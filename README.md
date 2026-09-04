# Vibe SaaS Foundry

A clean-room, production-oriented reference SaaS for AI-assisted software development. It applies the strongest idea behind full-stack vibe-coding toolkits: give coding agents a **working product to transform**, not an empty boilerplate to invent from scratch.

## Applications

| App | Stack | Purpose |
|---|---|---|
| `apps/api` | NestJS + TypeORM + PostgreSQL | Auth, sessions, users, tasks, admin APIs |
| `apps/web` | React + Vite | Customer SaaS with optimistic task UX |
| `apps/admin` | React + Vite | Internal operator console |
| `apps/marketing` | Next.js App Router | Static marketing and legal surface |
| `apps/mobile` | Flutter | Mobile reference client |

Shared contracts and design tokens live under `packages/`.

## Core behaviors implemented
- registration and email-verification token flow
- password login
- revocable bearer sessions and logout everywhere
- account deletion
- task create/read/update/delete
- task status, priority, due date, search, filters, sorting
- URL-persisted customer list state
- optimistic task updates with rollback
- admin metrics and recent-user view protected by an admin API key
- Docker Compose with PostgreSQL
- CI build/typecheck pipeline
- agent-readable architecture and transformation recipes

## Local start

```bash
cp .env.example .env
corepack enable
pnpm install
docker compose up -d postgres
pnpm dev
```

Default development URLs:
- API: http://localhost:4000
- Web: http://localhost:5173
- Admin: http://localhost:5174
- Marketing: http://localhost:3000

During non-production registration the API returns a `verificationToken` in the response so the complete auth loop can be tested without an email vendor. Production intentionally does not expose the token; wire an email provider before launch.

## Docker

```bash
docker compose up --build
```

## Clean-room scope
This repository is an original implementation derived from publicly observable product concepts and standard SaaS patterns. It does not contain or claim access to the commercial toolkit's private source code.

See `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, and `docs/ROADMAP.md`.
