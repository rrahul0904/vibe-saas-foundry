# API Contract

## Public identity endpoints
All public identity endpoints are throttled; sensitive endpoints have tighter per-minute limits.

- `GET /health`
- `POST /auth/register` `{ email, password }`
- `POST /auth/resend-verification` `{ email }`
- `POST /auth/verify-email` `{ token }`
- `POST /auth/login` `{ email, password }`
- `POST /auth/request-password-reset` `{ email }`
- `POST /auth/reset-password` `{ token, password }`

Password-reset and resend-verification responses are intentionally non-enumerating in production.

## Authenticated customer endpoints
Use `Authorization: Bearer <opaque-session-token>`.

- `POST /auth/logout`
- `POST /auth/logout-all`
- `DELETE /users/me`
- `GET /tasks?search=&status=&priority=&sort=&order=`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

## Operator endpoints
Operator routes use the same revocable bearer-session mechanism and additionally require `user.role=operator`.

- `GET /admin/metrics`
- `GET /admin/users`
- `GET /admin/audit`

There is no shared admin API key in the hardened architecture.
