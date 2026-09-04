# API Contract

## Public
- `GET /health`
- `POST /auth/register`
- `POST /auth/verify-email`
- `POST /auth/login`

## Authenticated
- `POST /auth/logout`
- `POST /auth/logout-all`
- `DELETE /users/me`
- `GET /tasks?search=&status=&priority=&sort=&order=`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

## Operator
Send `x-admin-key`.
- `GET /admin/metrics`
- `GET /admin/users`

The admin-key scheme is intentionally small for the reference implementation. Replace it with operator identity + RBAC before multi-user production administration.
