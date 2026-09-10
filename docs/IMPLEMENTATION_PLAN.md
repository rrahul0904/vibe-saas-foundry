# Implementation Plan

## Completed foundation
Five application surfaces, shared contracts/design tokens, auth/session baseline, reference task domain, Docker, CI, migrations and architecture docs.

## Completed Phase 1A — identity hardening
Password reset/resend verification, transactional email, operator auth, throttling, headers/validation, audit events, migration-first production startup, tests and CodeQL.

## Completed Phase 2A — tenancy and RBAC
- organizations and personal workspace lifecycle
- owner/admin/member membership policy
- invitation create/list/revoke/accept workflows
- email-bound hashed invitation credentials
- last-owner and admin privilege safeguards
- entitlement persistence with plan/member/feature limits
- migration of existing users/tasks into personal tenants
- task queries/mutations scoped to membership + organization ID
- workspace switcher and team/plan UI
- mobile tenant selection

## Phase 1B — advanced identity
OAuth/OIDC, MFA/recovery and session/device inventory. This can proceed independently of billing.

## Phase 2B — billing
Build a vendor adapter around internal entitlements: Stripe checkout + portal, webhook verification/idempotency, subscription state model and deterministic entitlement sync. Product code must remain independent of Stripe price IDs.

## Phase 3 — platform services
Queues/outbox/idempotency, notifications, storage, webhooks/API keys, feature flags, analytics, structured logging, metrics and traces.

## Phase 4 — agentic foundry
Product-spec schema, transformation planner, recipe execution, agent work packets, preview verification and architecture invariant checks.

## Definition of done
Every wave requires migration for persistence changes, shared contract updates, permission tests, green test/typecheck/build, security review, Docker compatibility and updated architecture/runbooks.
