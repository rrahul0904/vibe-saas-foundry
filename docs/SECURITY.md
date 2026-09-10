# Security baseline

## Implemented
- bcrypt password hashing with cost 12
- opaque random session credentials; only SHA-256 token hashes are persisted
- session expiry, individual revocation and logout-all
- password reset uses one-time hashed expiring tokens and revokes every old session
- email verification uses one-time hashed expiring tokens
- transactional email adapter backed by Resend in production
- production auth responses never expose verification/reset tokens
- non-enumerating password-reset and verification-resend responses
- global request throttling plus tighter limits on registration/login/reset endpoints
- Helmet HTTP security headers
- DTO validation, transformation, field allowlisting and rejection of unknown fields
- ownership predicates on task reads/writes
- persisted member/operator role and operator-only admin routes
- operator bootstrap is controlled by the `OPERATOR_EMAILS` environment allowlist
- security audit log for registration, verification, login, logout, operator bootstrap and password reset
- account deletion cascades identity/domain rows while audit rows can remain for security history
- production Docker startup runs migrations; TypeORM schema synchronization is disabled
- no committed secrets
- CI runs test, typecheck and build

## Still required before high-assurance public production
1. Add MFA for operators and optionally customers.
2. Add OAuth/OIDC providers with account-linking safeguards.
3. Move runtime secrets to the target platform's secret manager/Vault/external-secrets implementation.
4. Add IP/device context, retention policy and tamper-resistant export for audit records.
5. Add CSP tuned to final production domains and automated DAST/container/dependency scanning.
6. Define database backups, point-in-time recovery and restore drills.
7. Perform threat modeling and external security review before handling sensitive customer data.
