# Backend HTTP API Contracts & Test Suites

This directory contains the imported HTTP integration tests and API contracts from the backend repository (`amanix-backend`), validating contracts against live staging and local environments.

## Environments & Base URLs

| Environment | Base URL | API Prefix | Scalar Documentation | OpenAPI Spec |
| :--- | :--- | :--- | :--- | :--- |
| **Staging** | `https://amainix-001-site1.ltempurl.com` | `/api/v1` | [Scalar v1](https://amainix-001-site1.ltempurl.com/scalar/v1) | [openapi.json](https://amainix-001-site1.ltempurl.com/openapi/v1.json) |
| **Local** | `http://localhost:5128` | `/api/v1` | `http://localhost:5128/scalar/v1` | `http://localhost:5128/openapi/v1.json` |

## Mandatory / Universal Request Headers

The backend architecture requires the following custom headers across endpoints:
- `Accept-Language`: Client's preferred response language (`ar` or `en`). Defaults to `ar`.
- `X-Tenant-Domain`: Subdomain of the active tenant (e.g., `al-salamah` or `demo`). Mandatory for tenant-scoped operations.
- `Authorization`: `Bearer <jwt_token>` (for all authenticated endpoints).

## Test Suite Inventory

1. **`01-public-tenant-tests.http`**
   - API Heartbeat & Diagnostics (`/ping`, `/api/v1/diagnostics/health`)
   - Tenant Subdomain Availability Checks (`/api/v1/tenants/subdomains/{subdomain}/availability`)
   - Public Tenant Branding Lookup (`/api/v1/tenants/settings/public-branding`)
2. **`02-auth-tests.http`**
   - Authentication Lifecycle (`/api/v1/auth/login`)
   - Silent Token Rotation (`/api/v1/auth/refresh-token`)
   - Password Recovery Flow (`/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password`)
   - Current User Profile & Password Change (`/api/v1/me`, `/api/v1/me/change-password`)
3. **`03-tenant-onboarding-tests.http`**
   - Tenant Registration (`/api/v1/tenants/register`)
   - Registration OTP Verification (`/api/v1/tenants/verify-otp`)
   - Initial Tenant Configuration
4. **`04-system-admin-tests.http`**
   - Platform SuperAdmin operations, tenant governance, system audit logs
5. **`05-tenant-users-tests.http`**
   - Tenant User Management (`/api/v1/tenant-users`)
   - Status toggling (`/api/v1/tenant-users/{id}/toggle-status`)
   - Role assignments & deputy admin permission bounds
6. **`06-field-workers-tests.http`**
   - Field Worker rosters, labor cost tracking, role classifications
7. **`07-equipment-tests.http`**
   - Equipment registry, maintenance scheduling, asset tracking
8. **`08-tenant-activation-tests.http`**
   - Tenant subscription activation pathways and verification documents
9. **`09-tenant-financial-and-branding-tests.http`**
   - Tenant branding assets (`/api/v1/tenants/settings/branding`), invoices, VAT configurations
10. **`stage-auth-tests.http` (`docs/test/auth-tests.http`)**
   - Live Staging verification for Platform SuperAdmin, Tenant Manager, and validation scenarios.
