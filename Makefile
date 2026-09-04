.PHONY: dev db build typecheck

dev:
	corepack enable && pnpm dev

db:
	docker compose up -d postgres

build:
	pnpm build

typecheck:
	pnpm typecheck
