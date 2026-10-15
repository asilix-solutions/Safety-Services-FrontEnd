# Amanix API Contract and Frontend Architecture

> Treat this as a checklist. Regenerate types and verify against the deployed OpenAPI schema plus the checked-out backend’s `.http` suites before implementation.

## 1. Endpoints and reference locations

- Staging API base: `https://amanixapi-001-site1.ktempurl.com`
- Versioned API base: `https://amanixapi-001-site1.ktempurl.com/api/v1`
- Interactive API reference: `https://amanixapi-001-site1.ktempurl.com/scalar/v1`
- OpenAPI source: `https://amanixapi-001-site1.ktempurl.com/openapi/v1.json`
- Local API base documented by the backend frontend guide: `http://localhost:5128/api/v1`
- Backend repo discovered in connected GitHub: `asilix-solutions/amanix-backend`

The current repository’s frontend guide describes 157 endpoints and 21 `.http` files, but other audit/overview snapshots show older counts. Do not trust these counts blindly. Inventory the actual checkout, regenerate OpenAPI types from the current schema, inspect every `.http` file and record the live diagnostic build/environment.

## 2. Response envelope

The backend contract is consistently documented as camelCase with an envelope shaped like:

```ts
export interface ApiEnvelope<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
  errors?: string[] | null;
}
```

Use `isSuccess` as the success discriminator. Failure responses may omit `data`; zero and `false` can be legitimate values and must not be treated as missing. `message` and validation `errors` are already localized according to `Accept-Language`. Create one shared `unwrap<T>()` and one typed API error implementation for the whole frontend. Do not let each page invent its own envelope parsing.

Status handling baseline from current frontend contract docs:

| Status | Required client behavior |
|---:|---|
| 200/201 | Treat as successful only when the envelope indicates success; preserve returned IDs/state. |
| 400 | Display localized validation/business errors; keep form data and show useful field/form-level feedback. |
| 401 | Coordinate a single refresh attempt, retry a request at most once, then clear the session and route to sign-in with an explanation. |
| 402 | Subscription/quota write refusal. Preserve read access; show plan/standing UI rather than logging the user out or blanking the app. Confirm current contract first. |
| 403 | Usually means the frontend offered an action without the required effective permission. Log/telemetry it and correct the UI gate; do not design the normal flow around expected 403s. |
| 404 | Resource absent or intentionally invisible because it belongs to another tenant. Show “not found”; never reveal existence elsewhere. |
| 409 | State/concurrency conflict. Re-fetch the affected resource and explain the server message. |
| 415 | Usually wrong request content type, commonly JSON sent to a multipart endpoint. |
| 429 | Show localized wait/retry feedback and use backoff; avoid aggressive polling shared across users within one tenant. |
| 5xx | Treat as a server failure, preserve user input, attach safe diagnostic context and do not silently fabricate success. |

Always check the current API contract before assuming these are exhaustive. Do not transform backend bugs into permanent silent compatibility hacks.

## 3. Request conventions

- API path is generally `/api/v1`; keep the base URL in one validated environment/config module.
- `Authorization: Bearer <accessToken>` for authenticated endpoints.
- `Accept-Language: ar|en` on **every** request.
- `X-Tenant-Domain: <slug>` only where an anonymous request needs tenant context (notably public branding, login for a tenant portal, client self-registration). After sign-in, tenant identity comes from the token; the header cannot switch a signed-in user to another company.
- Follow each endpoint’s actual content type. Multipart upload endpoints require `multipart/form-data`; do not set the JSON content type manually for `FormData`.
- Enums travel as integer values. Generate types from current OpenAPI and never write a numeric enum fallback of `0` when zero is not a valid member.
- Dates are ISO-8601; respect the API timezone/offset contract. Amounts are decimals, and server-computed totals remain authoritative.
- Paged lists follow current OpenAPI for `pageNumber`, `pageSize` and metadata. Handle empty pages, errors and server limits.
- Upload validation uses actual file bytes/MIME sniffing; validate size/type for usability, but understand server validation remains authoritative.

## 4. Type generation and contract drift

Inspect the actual frontend package scripts and source structure. The backend guide suggests `openapi-typescript` and a generated source such as `src/types/api.generated.ts` with an `npm run gen:api` command. If the frontend uses a different conventional structure, preserve its conventions while implementing the equivalent.

Required approach:

1. Retrieve the current staging OpenAPI schema, and/or generate a schema from the local backend.
2. Compare the current branch’s API schema with staging; record differences by endpoint/schema/status code.
3. Generate TypeScript types from the authoritative schema; do not hand-maintain duplicate enum DTOs.
4. Add a repeatable script and document which schema it uses and why.
5. Run type generation and TypeScript/lint checks in CI or the project’s equivalent pipeline.
6. Regenerate after meaningful backend updates. Do not vendor/copy `.http` suites into the frontend; they are maintained in the backend repo and can go stale.

If staging is unreachable, do not pretend it was reviewed. Use local backend code, committed OpenAPI artefacts and current `.http` tests, document the blocker, and retry live verification when network access permits.

## 5. Authentication architecture

Prefer a server-side backend-for-frontend (BFF) where supported by the existing stack. For Next.js, use route handlers and secure `httpOnly; Secure; SameSite=Lax` cookies on the relevant host; for Nuxt, use its server routes and equivalent secure server-only cookies. Do not migrate the entire framework just because the guide examples use a different framework.

Requirements:

- Keep long-lived refresh tokens and access tokens out of `localStorage` and other browser-readable persistent storage.
- Sign-in should normalize the legacy token name once. Prefer `accessToken`; the backend guide says `token` is a deprecated alias and may be removed.
- Refresh request uses the documented pair `{ accessToken, refreshToken }`. The refresh token rotates; store the entire new pair atomically.
- Refresh must be single-flight: concurrent 401 responses share one refresh promise to avoid multiple refresh attempts invalidating each other.
- On refresh failure, clear cookies/session and redirect with a clear expiry reason. Retry original API calls at most once.
- Call the authenticated logout endpoint to revoke the refresh token, then clear local session even if logout fails.
- After sign-in and on session restoration load both `GET /api/v1/me` and `GET /api/v1/auth/permissions/me` into one typed session model.
- The profile’s `tenantId` can be null for platform staff; type it correctly, do not assert it is always present.
- Forgot-password confirmation must not reveal whether an email exists. Use real `devOnlyOtp`/`devOnly...` response fields only in explicitly permitted Development/Staging flows, never in production UI.
- Do not hard-code OTP values or expose tokens in logs, URLs, toast text, analytics or docs.

## 6. Tenant routing and application context

Implement exactly one shared host/tenant resolution utility and reuse it across middleware/server layout/API client/routing. Parse the actual host; do not store the chosen tenant in `localStorage` and do not trust arbitrary client-provided tenant IDs.

Expected conceptual contexts:

- `localhost` / root platform host → platform console context.
- `{tenant}.localhost` in local development → tenant context.
- `amanix.com` root → platform console.
- `{tenant}.amanix.com` → tenant portal, if current deployment supports the mapping.
- Single-host staging (`amanixapi-001-site1.ktempurl.com`) does not provide real company subdomains; test tenant resolution there with supported anonymous `X-Tenant-Domain` calls and use local `*.localhost` hosts for real host-resolution flows.
- Custom domain support must be verified against current resolver/controller/API. Do not claim a custom domain works merely because a branding setting accepts a canonical URL.

Guard against ports, case, unknown hosts, reserved system labels and malformed slugs. A typo or unrecognized tenant must not silently become the default company. Keep platform roles and tenant roles isolated in navigation, layouts, permissions and cookies. The server remains authoritative for tenant isolation; frontend resolution is UX/routing, not a security boundary.

## 7. White-label data flow

For an anonymous request to tenant branding:

1. Resolve the tenant slug/host using the shared host resolver.
2. Fetch the current public-branding/settings contract before first paint where SSR is available.
3. Supply only the documented anonymous header/context needed by the endpoint.
4. Validate and normalize the branding response with safe defaults that do not impersonate a different tenant.
5. Render logo/favicon, CSS variables, title/description, canonical URL and Open Graph metadata from real values.
6. Treat maps like `themeColors`/`socialLinks` as extensible: read known keys, ignore unknown keys, sanitize URLs and colors before applying them.
7. On save, invalidate/refetch branding so the visible site updates immediately.
8. In the company admin UI, keep tenant-branding preview visibly scoped to the current tenant, and obey permission restrictions (for example, `DeputyAdmin` read-only if the current permission guide confirms it).

## 8. Roles and permissions

- Role drives primary shell, navigation grouping and landing destination.
- The effective permission list returned by the API drives action visibility/enabling.
- Build one `can(permissionKey)` abstraction and a route-guard convention that can be unit-tested.
- Use server-side checks as well as client visibility; the frontend is not the authority.
- Never expose a control expected to return 403.
- Do not invent capabilities for `PlatformSupport` while its permission set remains unresolved.
- `DeputyAdmin` restrictions on branding/financial policy are an intentional segregation-of-duties rule in the current guide, not an invitation to bypass RBAC.
- The permissions catalogue’s caller-specific assignable roles is the source for role selectors.
- For client users, consume client-safe response DTOs only. Do not surface internal margin, labor cost, confidential engineer notes or other internal financial details by removing fields from an internal DTO. Prefer backend client projections that allow-list what clients may see.

## 9. State machines and financial correctness

- Generate/use enums from the current OpenAPI and backend enum source.
- Branch on documented status/state enums, not “does field X exist?” heuristics.
- Model transitions as explicit actions only when they are valid for that actor, permission, current state and API contract.
- Never compute authoritative quotation totals, VAT, margin floor, expenses, commissions or profitability in the browser. Display server-calculated values; frontend calculations may be non-authoritative estimates only if the product genuinely needs them and labels them as estimates.
- Fetch the company’s financial policy when needed. Never hard-code VAT to 15%; use the current tenant’s returned rate and preserve VAT/subtotal/total as distinct fields.
- A 402/quota refusal must not discard a draft or appear as a login failure.
- On 409, refetch and re-render current state rather than retrying a prohibited transition.
- A sealed/vaulted workflow resource is read-only; suppress mutations after the sealed state is known.

## 10. Files, photos, signatures and sensitive data

- Read per-endpoint MIME/size expectations in OpenAPI/`.http` suites.
- Use multipart requests exactly as documented and show upload progress, cancellation/retry behavior where safe, file validation and clear failure status.
- Preserve original EXIF metadata for field photos where geofence verification depends on it. Do not compress/re-encode uploaded verification evidence unless proven not to remove required metadata; preserve originals when the API workflow calls for that.
- Use backend-authorized download endpoints; do not create durable public links to protected business documents.
- Signature capture must send the exact payload the backend expects; treat signatures and site photos as sensitive records.
- Never log auth headers, refresh tokens, OTPs, password data, private document URLs or full sensitive payloads.

## 11. Shared frontend layers

Adapt file organization to the existing framework, but enforce a single logical implementation for:

- API base/config and generated API types
- envelope unwrapping and typed `ApiError`
- auth/session/cookie/BFF flow and single-flight refresh
- tenant host parsing and host-specific application context
- permission checks and role-based navigation
- branding/SEO metadata and theme tokens
- query keys/cache invalidation and server-state loading
- localized messages/date/number/currency formatting
- common form validation/error presentation
- file upload and safe download behavior
- loading, empty, failure, disabled, conflict and success UI states

Avoid duplicate fetch logic in pages, duplicated `can()` implementations, repeated API URL builders, broad untyped `any`, large all-in-one components, mock responses on production routes and silent catch blocks.
