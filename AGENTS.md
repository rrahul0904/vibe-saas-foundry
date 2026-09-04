# Agent Working Contract

This repository is designed to be edited safely by coding agents.

## Non-negotiables
1. Preserve separation between `apps/api`, `apps/web`, `apps/admin`, `apps/marketing`, and `apps/mobile`.
2. Keep public API contracts in `packages/contracts` before duplicating types in clients.
3. Authentication uses revocable server-side sessions; do not replace it with irreversible long-lived JWT-only auth.
4. Customer task list search/filter/sort state belongs in the URL.
5. Mutations in the customer web app should remain optimistic with rollback on failure.
6. Production schema changes require TypeORM migrations.
7. Never commit secrets. Update `.env.example` and deployment docs instead.
8. Add tests when changing domain logic or auth behavior.

## Definition of done
- `pnpm build`
- `pnpm typecheck`
- API health endpoint works
- registration -> verification -> login works
- authenticated task CRUD works
- admin metrics work with `x-admin-key`
- web filter state survives refresh
