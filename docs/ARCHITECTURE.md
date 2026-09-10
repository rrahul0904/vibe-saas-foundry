# Architecture

## System
```text
Marketing (Next static)

Web ──────┐
Mobile ───┼──> NestJS API ───> PostgreSQL
Admin ────┘       │
                  ├── identity + revocable sessions
                  ├── organizations/memberships/invitations
                  ├── internal entitlements
                  ├── tenant-scoped task domain
                  └── audit events
```

## Product boundaries
- `marketing`: independently deployable public acquisition surface.
- `web`: customer application, workspace switcher, task and team workflows.
- `admin`: operator-only experience; no customer admin concerns leak into web code.
- `mobile`: same public API and tenant context as web.
- `api`: source of truth for identity, tenancy, permissions and domain state.
- `packages/contracts`: cross-client contract types.
- `packages/design-tokens`: shared brand primitives.

## Authorization layers
1. Session guard validates an opaque revocable bearer credential.
2. Global user role protects operator endpoints.
3. Organization membership protects tenant endpoints.
4. Membership role protects owner/admin operations.
5. Database predicates include `organization_id` for tenant-domain data.

Never use a client-provided organization ID alone as proof of access.

## Billing boundary
The product layer reads internal entitlements, not payment-provider objects. A billing adapter can later translate Stripe subscription state into `plan_code`, limits and feature flags without coupling customer-domain code to Stripe IDs.

## Production runtime
Docker starts with TypeORM migrations and schema synchronization disabled. PostgreSQL + HTTP remain the only hard platform assumptions; the applications can run in Docker, Kubernetes or cloud/VPC environments.
