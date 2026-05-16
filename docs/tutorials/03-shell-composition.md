---
diataxis: tutorial
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer]
---

# Tutorial 03 — Shell composition: AppShell + Sidebar + Topbar + CommandPalette

**You will learn:**

- How to assemble the full portal chrome using `AppShell`, `Sidebar`, and `Topbar`.
- How to wire `ProductSwitcher` and `ProjectSwitcher` into the topbar chips.
- How to open and close `CommandPalette` via the ⌘K shortcut.
- How to open `TweaksPanel` from the topbar tweaks button.

**By the end of this tutorial you will have** a working portal shell with sidebar
navigation, topbar breadcrumb, search palette, and tweaks drawer.

**Prerequisites:** Completed [Tutorial 02](./02-theming.md).

**Time:** approximately 30 minutes.

---

## Step 1 — Understand the shell layout

`AppShell` renders a CSS Grid with three areas:

```
┌─────────────────────────────────────┐
│         app-topbar (header)         │
├──────────────┬──────────────────────┤
│  app-sidebar │  app-main (scroll)   │
│  (aside)     │                      │
└──────────────┴──────────────────────┘
```

The grid adapts when `data-collapsed` is set on the root `div`: the sidebar
shrinks to 64 px (icon-only mode). All widths, heights, and transitions come
from `--sidebar-width`, `--sidebar-collapsed-width`, and `--header-height` in `tokens.css`.

---

## Step 2 — Define navigation data

Create `src/nav.ts` to hold the sidebar structure:

```ts
// src/nav.ts
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  Bug,
  Lightbulb,
  Settings,
} from "lucide-react"
import type { SidebarSection } from "@godxjp/ui/components/shell"

export const NAV_SECTIONS: SidebarSection[] = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "plans",     label: "Plans",     icon: ClipboardList },
      { id: "issues",    label: "Issues",    icon: Bug, badge: 12 },
      { id: "wiki",      label: "Wiki",      icon: BookOpen },
      { id: "ideas",     label: "Ideas",     icon: Lightbulb },
    ],
  },
  {
    label: "System",
    items: [
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
]

export const COMMANDS = [
  { id: "go-dashboard", label: "Go to Dashboard", group: "Navigation",  onSelect: () => { console.log("nav dashboard") } },
  { id: "go-plans",     label: "Go to Plans",     group: "Navigation",  onSelect: () => { console.log("nav plans") } },
  { id: "new-issue",    label: "New issue",        group: "Quick create", onSelect: () => { console.log("new issue") } },
  { id: "new-plan",     label: "New plan",         group: "Quick create", onSelect: () => { console.log("new plan") } },
]
```

---

## Step 3 — Build the shell layout

Replace `src/App.tsx` with the full shell:

```tsx
// src/App.tsx
import { useState } from "react"
import {
  AppShell,
  Sidebar,
  Topbar,
  TweaksPanel,
  CommandPalette,
  ProductSwitcher,
  ProjectSwitcher,
} from "@godxjp/ui/components/shell"
import { useTweaks } from "@godxjp/ui/hooks"
import { PRODUCTS } from "@godxjp/ui/data"
import { NAV_SECTIONS, COMMANDS } from "./nav"

export default function App() {
  const { tweaks, setTweak } = useTweaks()

  const [activeNav,   setActiveNav]   = useState("dashboard")
  const [productOpen, setProductOpen] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [tweaksOpen,  setTweaksOpen]  = useState(false)

  const activeProduct = PRODUCTS.find((p) => p.tenant === tweaks.tenant) ?? PRODUCTS[0]!
  const activeProject = activeProduct.projects[0] ?? null

  return (
    <AppShell
      sidebarCollapsed={tweaks.sidebarCollapsed}
      sidebar={
        <Sidebar
          activeId={activeNav}
          onSelect={setActiveNav}
          sections={NAV_SECTIONS}
          product={activeProduct}
          onProductClick={() => setProductOpen(true)}
          collapsed={tweaks.sidebarCollapsed}
        />
      }
      topbar={
        <Topbar
          product={activeProduct}
          project={activeProject}
          collapsed={tweaks.sidebarCollapsed}
          onToggleCollapsed={() => setTweak("sidebarCollapsed", !tweaks.sidebarCollapsed)}
          onProductOpen={() => setProductOpen(true)}
          onProjectOpen={() => setProjectOpen(true)}
          onSearchOpen={() => setSearchOpen(true)}
          onTweaksOpen={() => setTweaksOpen(true)}
        />
      }
    >
      {/* Page content */}
      <div style={{ padding: "1.5rem" }}>
        <h1 style={{ fontSize: "var(--heading-h1)", fontWeight: "var(--font-weight-medium)" }}>
          {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
        </h1>
        <p style={{ color: "var(--muted-foreground)", marginTop: "0.5rem" }}>
          Active nav: <strong>{activeNav}</strong>. Use the sidebar to navigate.
        </p>
      </div>

      {/* Overlays — outside the main scroll area so they render above content */}
      <ProductSwitcher
        trigger={<span />}  {/* ProductSwitcher is opened programmatically */}
        activeId={activeProduct.id}
        onSelect={(product) => {
          setTweak("tenant", product.tenant)
          setProductOpen(false)
        }}
        open={productOpen}
        onOpenChange={setProductOpen}
      />

      <ProjectSwitcher
        trigger={<span />}
        activeProductId={activeProduct.id}
        activeProjectId={activeProject?.id}
        onSelect={(_project, product) => {
          setTweak("tenant", product.tenant)
          setProjectOpen(false)
        }}
        open={projectOpen}
        onOpenChange={setProjectOpen}
      />

      <CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        commands={COMMANDS}
      />

      <TweaksPanel open={tweaksOpen} onOpenChange={setTweaksOpen} />
    </AppShell>
  )
}
```

Run `pnpm dev`. You should see:

- A sidebar on the left with your navigation sections.
- A topbar at the top with product and project chips.
- A search button (⌘K opens the command palette).
- A tweaks button that opens the density/theme/locale drawer.
- The sidebar collapses when you click the panel toggle in the topbar.

---

## Step 4 — Wire keyboard shortcut

The `CommandPalette` component registers a global `keydown` handler automatically
when it is mounted. Pressing ⌘K (macOS) or Ctrl+K (Windows / Linux) toggles the palette.

No extra wiring is needed. Confirm it works by pressing ⌘K in the browser.

---

## Step 5 — Add routes

For a real service, replace the plain `<h1>` in the main area with `react-router-dom`
or `tanstack-router`. The shell layout is router-agnostic:

```tsx
// src/App.tsx (excerpt)
import { Routes, Route, useNavigate } from "react-router-dom"

// In the sidebar onSelect handler:
const navigate = useNavigate()

// …
sidebar={
  <Sidebar
    activeId={activeNav}
    onSelect={(id) => {
      setActiveNav(id)
      navigate(`/${id}`)
    }}
    // …
  />
}
```

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Sidebar has no visible background | Tokens CSS not loaded | Add `import "@godxjp/ui/tailwind.css"` first in `main.tsx` |
| Topbar chips show raw i18n keys | `initI18n()` not called | Add `initI18n()` before `createRoot(…).render(…)` |
| Sidebar collapse animation is jerky | CSS transition token not applied | Confirm `@godxjp/ui/tailwind.css` is the first CSS import |
| `ProductSwitcher` does not open | State wiring issue | Confirm `open={productOpen}` and `onOpenChange={setProductOpen}` are both set |
| ⌘K does nothing | `CommandPalette` not mounted | Confirm `<CommandPalette />` is in the JSX tree |

---

## What you achieved

You assembled the full GoDX portal chrome with sidebar navigation, topbar breadcrumb,
command palette, and tweaks panel. This is the exact shell pattern every GoDX service
(admin-platform, forge-service, console-service, me-service) uses.

**Next:** [Tutorial 04 — Add a new primitive](./04-add-a-new-primitive.md).
