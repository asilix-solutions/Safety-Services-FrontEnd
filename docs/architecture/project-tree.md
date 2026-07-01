# SSLM Project Tree Architecture Reference

This document maps out the repository structure and the architectural layer responsibilities.

```text
src/
├── app/                  # Next.js App Router (Thin Page Wrappers only)
├── constants/            # Global Constants (Routes, Navigation roles)
├── domains/              # Bounded contexts, storage accessors, workflow logic, state transitions
│   ├── requests/
│   ├── projects/
│   ├── invoices/
│   ├── contracts/
│   └── site-visits/
├── features/             # Scalable UI modules grouped by business scope
│   ├── invoices/
│   ├── contracts/
│   ├── certificates/
│   └── site-visits/
├── providers/            # Auth, translation, and UI context providers
└── shared/               # Pure stateless visual controls, base layout grids, and shared UI assets
```

## Architectural Guidelines

1. **Pages (`src/app`)**: Must remain thin wrappers. No business logic, data-fetching hook wrappers, or layout assembly is allowed.
2. **Features (`src/features`)**: Contains feature list, detail views, custom hooks, and helpers. Features are stateless composition boundaries.
3. **Domains (`src/domains`)**: Houses the application logic, types, storage operations, and workflow progression. This is the single source of truth.
4. **Shared (`src/shared`)**: General reusable atomic presentation units (buttons, layouts, empty states, search inputs).
