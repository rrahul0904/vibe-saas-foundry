# Deployment

The project is intentionally infrastructure-agnostic.

## Local Docker
`docker compose up --build`

## Vercel-style split
- deploy `apps/marketing` as static Next.js
- deploy `apps/web` and `apps/admin` as static Vite applications
- run `apps/api` on a persistent Node/container runtime with PostgreSQL

## Kubernetes
Containerize API, web, admin and marketing independently. Use an external PostgreSQL service, Ingress, sealed/external secrets, readiness probes against `/health`, and HorizontalPodAutoscaler for stateless API replicas.

## Cloud/VPC
No app requires a proprietary hosting primitive. PostgreSQL and HTTP are the only hard runtime assumptions in phase 0.
