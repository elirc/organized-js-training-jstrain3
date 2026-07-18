# Guide: `src/app/api/reports/overview/route.ts`

## Purpose
This route returns top-level KPI counts for dashboard cards.

## Line-by-line walkthrough
- Imports auth + `ok` + `listTickets`.
- `GET` flow:
  - requires user.
  - loads org tickets.
  - computes counts:
    - open
    - resolved/closed
    - urgent
    - waiting_on_customer
    - total
  - returns `kpis` object.

## Concepts taught by this file
- Simple analytics aggregation
- Derived metrics from transactional data

## Common mistakes
- Treating this as source of truth for complex SLA calculations.
- Hardcoding business definitions in multiple files (open/resolved logic).

## Mini exercises
1. Add KPI: `unassignedTickets`.
2. Add date-range filtering with query params.
3. Return trend data for last 7 days.

## Further reading
- Search: `kpi endpoint backend design`
- Search: `analytics aggregation patterns`

