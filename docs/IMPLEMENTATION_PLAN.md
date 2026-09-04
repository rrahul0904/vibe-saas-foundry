# Implementation Plan

## Repository topology
- `apps/api`: NestJS/TypeORM HTTP API and PostgreSQL persistence.
- `apps/web`: React/Vite customer SaaS.
- `apps/admin`: isolated React/Vite operator console.
- `apps/marketing`: Next.js App Router marketing site with static export.
- `apps/mobile`: Flutter API client reference.
- `packages/contracts`: public cross-client TypeScript contracts.
- `packages/design-tokens`: shared web design primitives.
- `recipes`: domain-transformation mappings for coding agents.
- `infra`: portable runtime configuration.

## Initial implementation wave
1. Establish pnpm/Turborepo workspace and strict TypeScript base configuration.
2. Implement users, email verification tokens, revocable sessions and tasks in PostgreSQL.
3. Add NestJS controllers/services/guards and a health endpoint.
4. Build the React customer application with URL-backed filters and optimistic mutation rollback.
5. Build an isolated operator console with metrics and user inventory.
6. Build a static Next.js marketing surface.
7. Provide a Flutter reference client against the same API contract.
8. Add Dockerfiles, Compose, nginx SPA serving and environment templates.
9. Add GitHub Actions build/typecheck CI.
10. Document architecture, API, security, deployment, roadmap and agent working rules.

## Hardening wave
- Replace development schema synchronization with migration-only production startup.
- Add password reset, email provider integration, OAuth, MFA and abuse protection.
- Replace the starter admin API key with operator authentication and RBAC.
- Add tests around auth/session lifecycle, ownership rules and optimistic state behavior.
- Add structured logging, OpenTelemetry traces, metrics and audit events.
- Add queues, idempotency and transactional outbox patterns for asynchronous work.

## SaaS wave
Introduce organizations, memberships, invitations, roles/permissions, Stripe billing, plans, entitlements and usage metering without coupling them to the reference Task domain.

## Agentic wave
Add a product-spec schema, transformation planner, recipe engine and architecture validation so Codex/Claude-style coding agents can change the product while preserving platform invariants.

## Definition of done for every wave
- documented architecture change
- migration for persistent schema changes
- shared contract update before client duplication
- typecheck/build green
- targeted automated tests
- security review for auth/billing/data-boundary changes
- Docker/local developer path remains functional
