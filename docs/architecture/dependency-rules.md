# SSLM Dependency Rules

To prevent dependency cycles and maintain modularity, the following rules are strictly enforced:

```text
  Route Page (app/)
        ↓
   Feature Shell (features/)
        ↓
     Custom Hook / Pure Helpers
        ↓
    Domain Core (domains/)
        ↓
    Shared UI Components (shared/)
```

## Governance Constraints

1. **No Cross-Feature Imports**: A feature module inside `src/features/invoices` must NEVER import anything directly from `src/features/projects`. Shared UI components must live in `src/shared` and business/data cross-referencing must go through domain selector wrappers.
2. **No Upward Imports**: A domain or helper module must never import anything from features or routes.
3. **No Direct Storage/Workflow Mutations in UI**: View components and presentation wrappers are stateless and must trigger transitions exclusively by calling hook methods that route commands to the domain workflow layer.
