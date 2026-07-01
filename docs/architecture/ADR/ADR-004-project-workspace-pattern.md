# ADR-004: Project Workspace Pattern

## Status
Approved

## Context
Features in the system were implemented with inconsistent architectural boundaries: some UI components had complex data fetching, others executed state transitions inside table components. A clear pattern was needed.

## Decision
- The `src/features/projects/project-workspace/` directory is established as the Golden Reference Architecture.
- UI features are split into: Thin Route → Feature Shell / Composition Root → Hook → Presentational Components.
- A ViewModel is introduced only when there is high complexity (multiple tabs, data sources, Timeline generation, etc.).

## Consequences
- Developers have a concrete, working template within the codebase to refer to.
- Predictable code structure across the application.
