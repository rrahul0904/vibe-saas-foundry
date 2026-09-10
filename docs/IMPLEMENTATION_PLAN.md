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

## Foundation — complete
Monorepo, five application surfaces, auth/session baseline, task reference domain, Docker, CI, migration, shared contracts/design tokens and architecture documentation.

## Identity hardening — Phase 1A complete in this wave
- password-reset request and one-time reset completion
- verification resend
- Resend transactional email adapter with development fallback
- operator/member persisted role model
- authenticated operator console replacing the shared `ADMIN_API_KEY`
- global + sensitive-route throttling
- Helmet and strict request validation
- audit event persistence and operator audit view
- migration-first production startup with schema sync disabled
- security helper unit tests and CI test execution

## Advanced identity — Phase 1B
- OAuth/OIDC providers and safe account linking
- TOTP/WebAuthn MFA and recovery codes
- per-device session inventory and remote session revoke
- mandatory MFA/stronger session policy for operators

## SaaS wave — Phase 2
Introduce organizations, memberships, invitations, roles/permissions, Stripe billing, plans, entitlements and usage metering without coupling them to the reference Task domain.

## Platform wave — Phase 3
Add structured logs/traces/metrics, background queues, transactional outbox, notifications, object storage, webhooks, API keys, feature flags and idempotency primitives.

## Agentic wave — Phase 4
Add a product-spec schema, transformation planner, recipe engine and architecture validation so Codex/Claude-style coding agents can change the product while preserving platform invariants.

## Definition of done for every wave
- documented architecture change
- migration for persistent schema changes
- shared contract update before client duplication
- typecheck/build/test green
- targeted automated tests
- security review for auth/billing/data-boundary changes
- Docker/local developer path remains functional
