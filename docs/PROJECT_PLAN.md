# Project Plan

## Product objective
Build Vibe SaaS Foundry as a clean-room, production-oriented reference SaaS and agentic software foundry. The repository should be useful both as a runnable starter and as an executable specification that coding agents can safely transform into new vertical products.

## Product principles
1. Start from a working cross-platform product, not an empty boilerplate.
2. Keep customer, operator, marketing, mobile and API concerns isolated.
3. Make architecture and domain contracts explicit for AI agents.
4. Prefer infrastructure-agnostic primitives: HTTP, PostgreSQL, containers and portable environment variables.
5. Treat security, observability, testing and deployment as first-class product features.
6. Keep the reference domain deliberately simple so it can be transformed into CRM, ATS, invoicing, booking and other SaaS verticals.

## Delivery phases
### Phase 0 — foundation
Monorepo, API, web, admin, marketing, mobile reference client, shared contracts, design tokens, Docker, CI and architecture docs.

### Phase 1 — production identity
Password reset, transactional email, OAuth, MFA, operator identity, rate limits, audit trail and secure secret handling.

### Phase 2 — commercial SaaS platform
Organizations, teams, invitations, RBAC, Stripe subscriptions, entitlements, metering and customer billing portal.

### Phase 3 — platform services
Jobs/queues, notifications, object storage, webhooks, API keys, feature flags, analytics, logs, traces and backups.

### Phase 4 — agentic foundry
Structured product specifications, domain recipes, work packets for coding agents, automated preview environments, architecture drift checks and QA/evaluation agents.

### Phase 5 — repository generator
A web configurator that composes modules and generates a production-ready repository from user-selected product, identity, billing, infrastructure and AI capabilities.

## Near-term success criteria
- One-command local Docker startup.
- Complete registration, verification and login flow.
- Revocable sessions and logout-all behavior.
- Working authenticated reference-domain CRUD.
- URL-persisted filtering and optimistic customer UX.
- Operator metrics/admin surface.
- Agent-readable architecture and transformation recipes.
- CI that typechecks and builds every TypeScript application.
