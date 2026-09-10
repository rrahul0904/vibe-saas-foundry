# API Contract

## Public identity
- `GET /health`
- `POST /auth/register`
- `POST /auth/resend-verification`
- `POST /auth/verify-email`
- `POST /auth/login`
- `POST /auth/request-password-reset`
- `POST /auth/reset-password`

## Authenticated identity
Use `Authorization: Bearer <opaque-session-token>`.
- `POST /auth/logout`
- `POST /auth/logout-all`
- `DELETE /users/me`

## Organizations
- `GET /organizations`
- `POST /organizations` `{ name }`
- `DELETE /organizations/:organizationId` owner only
- `GET /organizations/:organizationId/members`
- `PATCH /organizations/:organizationId/members/:membershipId` `{ role }` owner only
- `DELETE /organizations/:organizationId/members/:membershipId` owner/admin subject to safeguards
- `GET /organizations/:organizationId/entitlements`
- `GET /organizations/:organizationId/invitations` owner/admin
- `POST /organizations/:organizationId/invitations` `{ email, role }` owner/admin
- `DELETE /organizations/:organizationId/invitations/:invitationId` owner/admin
- `POST /invitations/accept` `{ token }`

## Tenant-domain tasks
Every task request must include `x-organization-id`. The API checks membership and scopes SQL to that tenant.
- `GET /tasks?search=&status=&priority=&sort=&order=`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

## Operator
Requires an authenticated session whose persisted user role is `operator`.
- `GET /admin/metrics`
- `GET /admin/users`
- `GET /admin/audit`
