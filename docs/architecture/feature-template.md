# SSLM Feature Development Template

This document serves as the official template and quality checklist for creating new features inside the SSLM platform.

## Feature Folder Structure Checklist

Before submitting a Pull Request for a new feature, verify that it adheres to the appropriate structure.

### 1. Simple Feature (e.g., Simple list page)
Does not require a ViewModel.
```text
src/features/[feature-name]/
  [feature-sub-name]/
    index.ts             # Exposes the Feature Shell only
    [name].tsx           # Feature Shell / Composition Root
    hooks/               # Custom hook for orchestration
      use-[name].ts
    helpers/             # Pure helper functions / formatting / permissions
      helpers.ts
    components/          # Stateless presentational components
```

### 2. Complex Feature (e.g., Project Workspace, complex metrics)
Includes a ViewModel for formatting and aggregating complex data structures.
```text
src/features/[feature-name]/
  [feature-sub-name]/
    index.ts
    [name].tsx
    hooks/
      use-[name].ts
    view-models/
      [name].viewmodel.ts
    helpers/
      helpers.ts
    components/
```

---

## Architectural Checklist

- [ ] **Thin Route**: Next.js `page.tsx` contains only the import and mounting of the Feature Shell.
- [ ] **Public API**: The feature folder's `index.ts` exports only the public Feature Shell component.
- [ ] **Stateless Components**: Presentation components are stateless and rely only on props and event callbacks.
- [ ] **No Inline Business Logic**: Zero inline logic inside React components; use helpers or hook-level values.
- [ ] **No Direct Storage Access**: No direct `localStorage` calls inside features. All storage operations go through the Domain storage layer.
- [ ] **No Direct Workflow Mutability**: Custom hooks do not mutate workflow status directly. All transitions must go through Domain workflow methods.
- [ ] **No Cross-Feature Imports**: Bounded features must not import from each other directly.
- [ ] **Centralized Dashboard Selectors**: Dashboard KPIs must be calculated by centralized domain selectors.
- [ ] **TypeScript Validated**: Code compiles cleanly with no `any` usages or unused imports.
