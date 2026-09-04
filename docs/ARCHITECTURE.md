# Architecture

## Design goal
The reference product should be complete enough that a coding agent can infer conventions from working code, while the example domain remains simple enough to replace.

```text
Marketing (Next.js static)
          │
Web (React/Vite) ─────┐
Mobile (Flutter) ─────┼──> NestJS API ───> PostgreSQL
Admin (React/Vite) ───┘       │
                              ├── users
                              ├── revocable sessions
                              ├── verification tokens
                              └── tasks
```

## Boundaries
- `marketing`: public acquisition/legal surface, deployable independently.
- `web`: customer application; never import admin behavior.
- `admin`: operator-only experience; uses a distinct admin credential model in the starter.
- `mobile`: API consumer with no database access.
- `api`: source of truth for identity and domain state.
- `packages/contracts`: cross-client public types.
- `packages/design-tokens`: shared brand primitives.

## Authentication
Opaque session tokens are returned to clients. Only SHA-256 hashes are persisted. This enables immediate revocation and `logout-all` without relying on long-lived stateless JWT semantics.

## URL state
Customer list filters map to query parameters: `search`, `status`, `sort`. Refreshing or sharing the URL preserves the same view.

## Optimistic UI
Task create/status/delete mutations update local state immediately. Network failure restores the prior snapshot and shows an error.

## Production evolution
Move schema changes from development `synchronize` to explicit TypeORM migrations before production. Add a real email provider, production secret manager, rate limiting, structured audit logs, and organization/RBAC modules as documented in the roadmap.
