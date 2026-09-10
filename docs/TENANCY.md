# Multi-tenancy and RBAC

## Tenant boundary
`Organization` is the tenant root. Customer-domain records that are collaborative must carry `organization_id`. Task APIs require `x-organization-id`; the API verifies an active membership before any query or mutation and then scopes the database predicate to that organization.

The client-supplied organization ID is **context, not authorization**. Membership lookup is the authorization decision.

## Roles
- `owner`: full workspace control, role changes, deletion and all admin/member actions.
- `admin`: member/invitation management and normal domain work; cannot change roles, delete the workspace, remove another admin, or remove an owner.
- `member`: normal tenant-domain access only.

At least one owner must remain. Owners cannot be removed directly; ownership must first be transferred or the target owner demoted while another owner remains.

## Personal workspace
Every user receives a personal workspace with an owner membership. The migration creates these for existing users and moves their existing tasks into that tenant. Login/list operations self-heal old users that somehow lack a membership.

## Invitations
Invitations contain a random raw credential sent by email. Only a SHA-256 hash is persisted. Tokens expire after seven days, are single-use, are bound to a normalized email address, and stored token hashes are never returned by APIs. Acceptance enforces the target organization's member entitlement.

## Entitlements
`organization_entitlements` is intentionally independent of a billing vendor. It holds the internal source of truth consumed by product authorization:
- `plan_code`
- `max_members`
- feature flags (`jsonb`)

A future Stripe adapter updates this internal model; product code should never depend directly on Stripe price IDs.
