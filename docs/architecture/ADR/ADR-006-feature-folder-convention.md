# ADR-006: Feature Folder Convention

## Status
Approved

## Context
Structuring features directly around current screen layouts (e.g. `invoice-dashboard`) makes it hard to scale as the business scope grows (e.g., adding details, creation, or editing screens).

## Decision
- Features must be organized around **business domains** (e.g. `src/features/invoices/`) rather than single screens.
- Specific screens live as sub-features (e.g., `invoices/invoice-list/`).
- Shared logic or components between feature sub-screens lives in a `shared/` directory inside the feature (e.g. `src/features/invoices/shared/`).

## Consequences
- The codebase scales naturally as new pages or modals are introduced.
- Clean folder structure that matches professional production standards.
