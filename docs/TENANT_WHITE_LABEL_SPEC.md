# Amanix Multi-Tenant White-Label Specification

This specification dictates how the Amanix frontend resolves tenant context, loads public branding, and dynamically adapts the visual presentation, typography, favicons, and metadata at runtime.

---

## 1. Multi-Domain & Tenant Resolution Architecture

The system supports multi-tenant resolution across development, staging, and production topologies:

```
[ Incoming Request ]
        │
        ▼
[ Next.js Middleware: src/middleware.ts ]
        │
   Extract Hostname
        ├─ Dev: `al-salamah.localhost:3000` ───► Subdomain: `al-salamah`
        ├─ Prod: `al-salamah.amanix.sa` ───────► Subdomain: `al-salamah`
        ├─ Platform Console: `amanix.sa` ──────► Subdomain: null (Platform Console)
        └─ Override Header: `x-custom-tenant-domain` ──► Subdomain: override
        │
        ▼
Inject Request Headers:
   `x-tenant-domain: <subdomain>`
   `x-is-subdomain: true|false`
```

### Shared Single Implementation: `subdomainFromHost`
The resolution logic must remain strictly centralized in one helper (`src/lib/server-tenant.ts` / `src/lib/auth-storage.ts`).
- Never invent tenant identities for unmapped subdomains.
- If a subdomain does not correspond to an active tenant on the backend, render an explicit "Company Not Found / Suspended" page.

---

## 2. Dynamic Branding Ingestion Protocol

Before first paint, the application fetches the tenant's public branding payload via:

```http
GET /api/v1/tenants/settings/public-branding
Accept-Language: ar
X-Tenant-Domain: <subdomain>
```

### Response Shape

```json
{
  "isSuccess": true,
  "data": {
    "publicEmail": "contact@al-salamah.com",
    "publicPhone": "+966114567890",
    "address": "الرياض - طريق الملك فهد",
    "logoUrl": "https://storage.amanix.sa/tenants/al-salamah/logo.svg",
    "faviconUrl": "https://storage.amanix.sa/tenants/al-salamah/favicon.ico",
    "themeColors": {
      "primary": "#C8102E",
      "secondary": "#1D1D1B",
      "accent": "#F5A623"
    },
    "socialLinks": {
      "twitter": "https://twitter.com/alsalamah",
      "linkedin": "https://linkedin.com/company/alsalamah"
    },
    "welcomeMessage": "مرحباً بكم في منصة شركة السلامة لحلول وأنظمة مكافحة الحريق",
    "aboutUsText": "شركة معتمدة من الدفاع المدني لتقديم حلول واستشارات السلامة الهندسية",
    "seoTitle": "شركة السلامة لأنظمة الإطفاء والسلامة الهندسية",
    "seoDescription": "المنصة الرسمية لإصدار تراخيص الدفاع المدني ومراجعة المخططات الهندسية",
    "seoKeywords": "سلامة، دفاع مدني، كود البناء السعودي، تراخيص، إطفاء",
    "ogTitle": "شركة السلامة - حلول السلامة المتقدمة",
    "ogDescription": "بوابة مراجعة وتراخيص الدفاع المدني المعتمدة",
    "ogImage": "https://storage.amanix.sa/tenants/al-salamah/og.png",
    "ogType": "website"
  }
}
```

---

## 3. CSS Variable Injection & Token System

The frontend dynamically sets the following CSS Custom Properties on `:root` based on the fetched `themeColors`:

```css
:root {
  /* Brand Primary */
  --color-primary: #C8102E;
  --color-primary-foreground: #FFFFFF;
  --color-primary-hover: #A00D25;
  --color-primary-subtle: #FDF2F4;

  /* Brand Secondary */
  --color-secondary: #1D1D1B;
  --color-secondary-foreground: #FFFFFF;

  /* Accent & Highlight */
  --color-accent: #F5A623;
  --color-accent-foreground: #1D1D1B;

  /* Surface & Background */
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F8FAFC;
  --color-surface-border: #E2E8F0;

  /* Typography */
  --font-heading: 'IBM Plex Sans Arabic', sans-serif;
  --font-body: 'IBM Plex Sans Arabic', sans-serif;
}
```

### Cumulative Layout Shift (CLS) Prevention
- Theme tokens are computed during server-side rendering (SSR) via `getServerTenantBranding()` and injected inline in the `<head>` of the root document.
- Custom web fonts use font-display swap with preconnect hints.

---

## 4. White-Label Management UI & Segregation of Duties

The Tenant Administration Settings (`src/app/(dashboard)/settings/general/` and `src/app/(dashboard)/settings/seo/`) allow authorized administrators to manage branding:

| Action | `CompanyAdmin` | `DeputyAdmin` | Other Roles |
|---|---|---|---|
| View Branding & Themes | Allowed | Allowed | Hidden |
| Edit Colors & Logo | Allowed | **Read-Only / Disabled** | Hidden |
| Update Contact & Socials | Allowed | **Read-Only / Disabled** | Hidden |
| Update SEO Metadata | Allowed | **Read-Only / Disabled** | Hidden |

> **Segregation of Duties Note:** The exclusion of `DeputyAdmin` from editing sovereign settings (branding, logo, VAT/financial policy) is an intentional enterprise governance requirement. The frontend UI must never render editable inputs to a `DeputyAdmin`.
