# ADR-001: Feature Boundaries

## Status
Approved

## Context
As features grow in the SSLM platform, developers may import code across feature boundaries (e.g., `invoices` importing components from `projects`). This tightly couples features, causing circular dependencies and rendering modular refactoring difficult.

## Decision
- Features must remain isolated units inside `src/features/[feature-name]`.
- Direct imports across feature directories are strictly prohibited.
- Communication between features must occur either through domain selectors/actions or by elevating common presentation code to the `src/shared` library.

## Consequences
- Features can be refactored, replaced, or deleted independently.
- Improved modularity and zero circular imports.
