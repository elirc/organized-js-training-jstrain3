# Guide: `src/app/reports/page.tsx`

## Purpose
This page renders basic KPI cards and a status distribution list for quick operational visibility.

## Line-by-line walkthrough
- Imports auth + ticket list query.
- Loads user and tickets.
- Computes derived metrics (`open`, `resolved`, `urgent`, `waiting`).
- Renders:
  - KPI card row.
  - status distribution list built from fixed status array.

## Concepts taught by this file
- Simple analytics rendering in server components
- Derived values from arrays

## Common mistakes
- Recomputing expensive filters repeatedly for large datasets.
- Hardcoding status list in multiple places (risk drift).

## Mini exercises
1. Replace repeated filters with one reduce pass.
2. Add chart-friendly response endpoint and render line chart.
3. Add date range controls.

## Further reading
- Search: `array reduce aggregation patterns`
- Search: `dashboard kpi design`

