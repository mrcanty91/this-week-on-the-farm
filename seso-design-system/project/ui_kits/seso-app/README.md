# Seso App — UI kit

High-fidelity, click-through recreation of the **Seso** labor-management
platform (the product shown on sesolabor.com). It composes the design-system
primitives — it does **not** re-implement them.

## Run it
Open `index.html`. It loads `../../styles.css` + `../../_ds_bundle.js`, then the
kit scripts. Flow: **Sign in → Workers (digital onboarding) → Worker profile →
Contract → Payroll**, navigable via the sidebar.

## Files
- `index.html` — entry; mounts the app, tagged as a `@dsCard` + `@startingPoint`.
- `data.js` — fictional sample data (workers, worker, contract, payroll).
- `icons.jsx` — line-icon set (`window.SesoIcons`). ⚠️ Approximates Lucide; see caveats.
- `shell.jsx` — `AppShell` (Sidebar + TopBar layout) and the nav model.
- `screens.jsx` — `LoginScreen`, `WorkersScreen`, `WorkerProfileScreen`, `ContractScreen`, `PayrollScreen`.
- `app.jsx` — interactive orchestrator (auth + nav + worker drill-in).

## Components used (from `window.SesoDesignSystem_<hash>`)
Sidebar, TopBar, Breadcrumb, Tabs, Card, DataTable, Button, Badge,
StatusIndicator, Tag, Input, Select, Checkbox, Avatar, StatField, FormField.

## Surfaces recreated
- **Login** — split brand panel + sign-in form.
- **Workers / digital onboarding** — selectable table with document-status cells, filter chips, row actions.
- **Worker profile** — header stat strip, tabs, left sub-nav, edit form + document card.
- **Contract (H-2A)** — stat strip, audit-file summary grid, audit-file table.
- **Payroll draft** — summary stats, payroll run table with pay methods.

## Caveats
- Icons approximate Lucide — replace with Seso's real icon set when available.
- Data is fictional and mirrors the public marketing demos.
