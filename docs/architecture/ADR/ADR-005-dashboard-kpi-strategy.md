# ADR-005: Dashboard KPI Strategy

## Status
Approved

## Context
Dashboards for the six roles (Client, Company Admin, Consulting Engineer, Operations Officer, Sales Agent, Super Admin) computed statistics and counts inline (e.g. `projects.filter(...)`). This is error-prone, duplicates logic, and creates UI synchronization issues.

## Decision
- Centralize all KPI and summary metric calculations into domain selector methods.
- ViewModels and dashboards must query these domain selectors rather than computing them independently in UI/hooks.

## Consequences
- Single source of truth for dashboard KPIs.
- Updates to safety request workflows reflect instantly across dashboards.
