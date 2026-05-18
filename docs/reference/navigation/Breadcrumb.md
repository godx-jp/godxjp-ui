---
title: "Breadcrumb"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Breadcrumb
status: stable
audience: [developer, agent]
lang: en
---

# Breadcrumb

> Navigation breadcrumb trail with ARIA landmark and `aria-current` for the active crumb.

## Usage

```tsx
import { Breadcrumb, Breadcrumb, Breadcrumb } from "@godxjp/ui";

<Breadcrumb>
  <Breadcrumb href="/products">GoDX</Breadcrumb>
  <Breadcrumb />
  <Breadcrumb href="/products/godx-admin">Admin</Breadcrumb>
  <Breadcrumb />
  <Breadcrumb current>Settings</Breadcrumb>
</Breadcrumb>;
```

## Exports

| Export           | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `Breadcrumb`     | Container — renders `<nav aria-label="Breadcrumb">`                |
| `Breadcrumb` | A single crumb — renders `<a>` (with `href`) or `<span>` (without) |
| `Breadcrumb`  | Visual separator — `/` with `aria-hidden`                          |

## Props — Breadcrumb

| Prop       | Type                          | Default  | Description                            |
| ---------- | ----------------------------- | -------- | -------------------------------------- |
| `children` | `ReactNode`                   | required | Breadcrumb and Breadcrumb nodes |
| `...rest`  | `HTMLAttributes<HTMLElement>` | —        | Standard `<nav>` props                 |

## Props — Breadcrumb

| Prop       | Type                          | Default  | Description                                                 |
| ---------- | ----------------------------- | -------- | ----------------------------------------------------------- |
| `href`     | `string`                      | —        | If set, renders an `<a>` link; otherwise renders a `<span>` |
| `current`  | `boolean`                     | `false`  | Marks the current page — adds `aria-current="page"`         |
| `children` | `ReactNode`                   | required | Crumb label                                                 |
| `...rest`  | `HTMLAttributes<HTMLElement>` | —        | Standard element props                                      |

## Accessibility

- `Breadcrumb` renders `<nav aria-label="Breadcrumb">` — announces the region.
- The current page crumb has `aria-current="page"`.
- `Breadcrumb` renders with `aria-hidden="true"` — separators are not read aloud.
- WCAG 2.1 SC 2.4.8 (Location): breadcrumbs satisfy the Location success criterion.
- WCAG 2.1 SC 1.4.3: crumb link text meets 4.5:1 contrast ratio.

## Router integration

When using `react-router-dom`, wrap `Breadcrumb` children with `<Link>`:

```tsx
import { Link } from "react-router-dom";

<Breadcrumb>
  <Breadcrumb>
    <Link to="/dashboard">Dashboard</Link>
  </Breadcrumb>
  <Breadcrumb />
  <Breadcrumb current>Projects</Breadcrumb>
</Breadcrumb>;
```

## See also

- [Topbar](../shell/Topbar.md) — the topbar breadcrumb chip area.
