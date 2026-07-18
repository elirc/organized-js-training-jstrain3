# Guide: `src/app/globals.css`

## Purpose
This file defines global design tokens and utility classes used across pages/components. It replaces default Next template styles with a custom DeskPilot look.

## Line-by-line walkthrough
- Tailwind directives (`@tailwind base/components/utilities`) load framework layers.
- `:root` declares CSS variables:
  - background/surface/ink/muted/accent/danger colors.
- `body` sets global margin, background, text color, and font stack.
- Global anchor styling removes default underline.
- Layout classes:
  - `.app-shell`, `.sidebar`, `.content` define app frame.
- Typography classes:
  - `.brand-title`, `.page-title`, `.muted`.
- Reusable UI primitives:
  - `.surface`, `.stack`, `.row`, `.input`, `.select`, `.textarea`, `.button`, `.badge`.
- List/timeline classes:
  - `.ticket-list`, `.ticket-item`, `.timeline`, `.timeline-item`.
- Media query `@media (max-width: 960px)` collapses sidebar layout on smaller screens.

## Concepts taught by this file
- Design tokens
- Utility-style component class system
- Responsive layout with media queries

## Common mistakes
- Mixing hardcoded colors everywhere instead of variables.
- Not testing mobile breakpoints after changing shell layout.
- Inconsistent class naming across components.

## Mini exercises
1. Add dark theme variable set and toggle class.
2. Add focus-visible styles for keyboard accessibility.
3. Add a reusable `.card-title` utility and apply it in pages.

## Further reading
- Search: `css custom properties design tokens`
- Search: `responsive css grid sidebar layout`

