# Security baseline

Implemented:
- bcrypt password hashing with cost 12
- opaque random session credentials
- only token hashes stored server-side
- session expiry and revocation
- logout-all
- ownership predicates on task reads/writes
- DTO validation and field allowlisting
- admin API key isolated from customer auth
- account deletion cascades dependent rows
- no secrets committed

Before public production:
1. Add rate limiting and brute-force protection.
2. Send verification/reset links through a transactional email provider.
3. Store secrets in cloud/Kubernetes/Vault-style secret storage.
4. Replace starter admin key with operator authentication, MFA and RBAC.
5. Add CSP, security headers, audit log and incident telemetry.
6. Run SAST/dependency scanning and container scanning in CI.
7. Run migrations instead of schema synchronization.
8. Define backups, point-in-time recovery and restore drills.
