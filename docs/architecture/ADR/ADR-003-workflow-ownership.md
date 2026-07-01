# ADR-003: Workflow Ownership

## Status
Approved

## Context
Workflow steps (e.g. marking an invoice as paid, transitioning a request to quotation phase) were frequently triggered inline in UI components or modified directly inside hooks. This fragments the business state transition logic.

## Decision
- Custom hooks or page templates must never mutate workflow states directly.
- All workflow actions must be routed to domain-specific workflow handlers (e.g. `src/domains/payments/workflow.ts` or `src/domains/certificates/workflow.ts`).

## Consequences
- The Core Workflow is encapsulated, testable, and guaranteed to execute correct business transitions (creating downstream records, updating dates, audit flags).
