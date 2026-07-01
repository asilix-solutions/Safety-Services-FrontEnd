# ADR-002: Domain Storage Ownership

## Status
Approved

## Context
Multiple screens or feature modules were reading and writing directly to `localStorage` or local cache keys, leading to duplicate states, out-of-sync dashboards, and fragmented read/write structures.

## Decision
- Only Domain files (e.g. `src/domains/[domain-name]/storage.ts`) are allowed to call `localStorage` read/write APIs.
- Features must load data through domain selector methods (e.g., `getMergedInvoices()`) and save via domain API methods (e.g., `upsertRequest()`).

## Consequences
- Single source of truth for all database-simulating states.
- Easy to switch mock `localStorage` implementations to real API integrations in future phases.
