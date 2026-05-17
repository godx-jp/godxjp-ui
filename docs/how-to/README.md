---
title: "How-to guides"
diataxis: index
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer]
lang: en
status: published
---

# How-to guides

How-to guides are task-oriented. Each one answers a specific
"how do I…?" question. They assume you have already completed
[Tutorial 01](../tutorials/01-getting-started.md) and are familiar
with the basic import surface.

| Guide | When to use |
|---|---|
| [Override tokens](./override-tokens.md) | Add a per-deployment brand accent palette via `[data-accent="<palette>"]` |
| [Customize theme](./customize-theme.md) | Recipes for theme axes, accent palettes, density overrides, dark mode |
| [Compose shell](./compose-shell.md) | Wire up AppShell + Sidebar + Topbar in a new service's `main.tsx` |
| [Add a locale](./add-locale.md) | Support a new BCP 47 locale in your service namespace |
| [Customise density](./customise-density.md) | Switch between compact / default / comfortable density modes |
| [Wire preferences](./wire-godx-config.md) | Wire `GodxConfigProvider` + axios `Accept-Language` / `X-Timezone` propagation |
| [Contribute a primitive](./contribute-primitive.md) | Open a PR to the submodule with a new or changed primitive |
| [Consume from a service](./consume-from-service.md) | Wire `@godxjp/ui` into a freshly scaffolded service frontend |
