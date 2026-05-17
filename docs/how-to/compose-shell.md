---
title: "How to compose the portal shell in main.tsx"
diataxis: how-to
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer]
lang: en
status: published
---

# How to compose the portal shell in main.tsx

**When to use:** You are adding `@godxjp/ui` to a new service frontend and need to wire the full shell (AppShell + Sidebar + Topbar) in five minutes.

**Prerequisites:** `@godxjp/ui` installed. `initI18n()` called before `createRoot`.

---

## Steps

1. Import the shell components:

   ```tsx
   import {
     AppShell,
     Sidebar,
     Topbar,
     TweaksPanel,
     CommandPalette,
   } from "@godxjp/ui/components/shell"
   import type { ForgeProduct } from "@godxjp/ui/components/shell"
   import { useTweaks } from "@godxjp/ui/hooks"

   // Per cardinal rule 28 §D the framework does NOT ship a
   // `@godxjp/ui/data` entry — consumers register their own
   // product catalogues.
   const PRODUCTS: ForgeProduct[] = [
     {
       id: "my-svc",
       name: "My Service",
       tenant: "my-svc",
       role: "Admin",
       desc: "My service description",
       color: "oklch(56% 0.15 200)",
       owner: "Team",
       devs: 3,
       projects: [],
     },
   ]
   ```

2. Define navigation sections. Each section has a label and an array of nav items:

   ```tsx
   import type { SidebarSection } from "@godxjp/ui/components/shell"
   import { LayoutDashboard, Settings } from "lucide-react"

   const NAV: SidebarSection[] = [
     {
       label: "Workspace",
       items: [
         { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
         { id: "settings",  label: "Settings",  icon: Settings },
       ],
     },
   ]
   ```

3. Render the shell. The minimum viable shell needs `sidebar` and `topbar` slots and at least one product:

   ```tsx
   function App() {
     const { tweaks, setTweak } = useTweaks()
     const [activeNav, setActiveNav] = useState("dashboard")
     const [searchOpen, setSearchOpen] = useState(false)
     const [tweaksOpen, setTweaksOpen] = useState(false)
     const product = PRODUCTS.find((p) => p.tenant === tweaks.tenant) ?? PRODUCTS[0]!

     return (
       <AppShell
         sidebarCollapsed={tweaks.sidebarCollapsed}
         sidebar={
           <Sidebar
             activeId={activeNav}
             onSelect={setActiveNav}
             sections={NAV}
             product={product}
             collapsed={tweaks.sidebarCollapsed}
           />
         }
         topbar={
           <Topbar
             product={product}
             collapsed={tweaks.sidebarCollapsed}
             onToggleCollapsed={() => setTweak("sidebarCollapsed", !tweaks.sidebarCollapsed)}
             onSearchOpen={() => setSearchOpen(true)}
             onTweaksOpen={() => setTweaksOpen(true)}
           />
         }
       >
         {/* page content */}
         <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} commands={[]} />
         <TweaksPanel open={tweaksOpen} onOpenChange={setTweaksOpen} />
       </AppShell>
     )
   }
   ```

4. The `ForgeProduct` type is exported from
   `@godxjp/ui/components/shell` — see step 1 above for the
   minimal product shape. Storybook's `src/stories/examples/`
   tree contains illustrative fixtures consumers may copy.

---

## What if it fails?

| Symptom | Cause | Fix |
|---|---|---|
| Sidebar and topbar overlap | `app-root` CSS grid not applied | Confirm `@godxjp/ui/tailwind.css` is loaded |
| Topbar chips show raw keys | `initI18n()` not called | Call `initI18n()` before `createRoot` |
| No sidebar collapse animation | `sidebarCollapsed` prop not wired | Pass `sidebarCollapsed={tweaks.sidebarCollapsed}` to `AppShell` |

---

## Related

- [Tutorial 03: Shell composition](../tutorials/03-shell-composition.md)
- [Reference: AppShell](../reference/shell/AppShell.md)
- [Reference: Sidebar](../reference/shell/Sidebar.md)
- [Reference: Topbar](../reference/shell/Topbar.md)
