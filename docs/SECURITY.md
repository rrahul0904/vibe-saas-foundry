# Security baseline

## Implemented identity/security
- bcrypt cost 12; opaque session credentials with only SHA-256 hashes persisted
- expiry, individual revocation, logout-all and reset-driven session revocation
- one-time hashed verification/reset tokens; production never returns raw tokens
- Resend transactional email adapter
- global and auth-specific throttling, Helmet, strict DTO validation/allowlisting
- persisted global operator role and operator-only admin APIs
- audit events for sensitive identity and tenant administration actions

## Implemented tenant security
- organization membership is checked server-side for every tenant operation
- tenant-domain SQL predicates include `organization_id`
- owner/admin/member role policy with explicit privileged operations
- last-owner safeguard; owner removal is prohibited until ownership changes
- admins cannot remove owners or peer admins
- invitations are email-bound, expiring, one-time credentials stored only as hashes
- invitation token hashes are explicitly excluded from API response mappings
- member limits are enforced from internal entitlements at invitation acceptance
- existing user tasks are backfilled into personal organizations by migration

## Still required for higher assurance
1. MFA/WebAuthn for operators and optional customers.
2. OAuth/OIDC account linking with anti-takeover safeguards.
3. Secret-manager integration for each deployment target.
4. Audit retention/export/tamper-resistance plus device/IP context.
5. Tuned CSP, DAST, container/dependency scanning.
6. Database PITR, backup/restore drills and disaster-recovery runbooks.
7. Threat model and external review before sensitive customer workloads.
