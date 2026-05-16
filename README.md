# @godxjp/ui — GoDX Forge unified design system

**Status:** core source of truth. **Every frontend in the GoDX
ecosystem MUST consume this package.** No service may bring its own
tokens, theme, color palette, i18n provider, or component primitives.
This rule is review-blocking (see `MUST RULES` below).

The only thing a service is allowed to do differently from another is
**layout**: route tree, page composition, screen-specific widgets that
have no equivalent in another service. Everything visual — typography,
color, spacing, density, dark mode, language switcher, sidebar shape,
top-bar shape, buttons, badges, kanban, KPI tiles, modal pattern — comes
from here.

---

## MUST RULES (review-blocking)

> If a PR violates any of these the reviewer rejects, regardless of
> deadline. Sync the visual layer first, ship the feature after.

1. **Tokens.** Every frontend imports `@godxjp/ui/tokens.css` AND
   `@godxjp/ui/tokens-ext.css` from its root entry (`main.tsx` /
   `app.tsx`). Services do not define their own `--background`,
   `--foreground`, `--primary`, font stack, density variables, or
   shadow scale. Tenant overrides happen via `[data-tenant="<id>"]`
   on `<html>`, never per-service.

2. **Stack.** TypeScript + React 19 + Vite + Tailwind v4 + shadcn-style
   primitives (Radix + cva + tailwind-merge). Components from this
   package are the only UI atoms a service uses. No service may ship
   `@mui/material`, `chakra-ui`, `antd`, native `styled-components`,
   raw `<input>` with custom CSS, etc.

3. **i18n.** All translation goes through `@godxjp/ui/i18n` — a single
   pre-configured `i18next` instance with auto-detect + JA fallback +
   localStorage persistence. The base dictionary (nav, shell, common,
   tweaks, kpi, pdca, issue) lives in `src/i18n/locales/{ja,en,vi}.ts`
   and is exported as `ForgeTranslations`. Services may register their
   own namespace (e.g. `i18n.addResourceBundle("ja", "sandbox", {…})`)
   but never replace the base.

4. **Locale set.** Supported: `ja` (default), `en`, `vi`. Adding a
   locale = PR to this package, never per-service.

5. **Theme + density + tenant.** All toggled via the `useTweaks` hook
   from `@godxjp/ui/hooks`. The hook mirrors selections onto `<html>`
   data attributes — services rely on those, they do not maintain
   their own theme state.

6. **Fonts.** `M PLUS 2` (loaded by `tokens.css`) is the primary face;
   fallbacks are Hiragino → Yu Gothic → Noto Sans JP → system. No
   service may swap in `Inter`, `Roboto`, `Comic Sans`, etc.

7. **Color literals.** No hex / rgb / oklch literals in service code.
   Always reference a CSS variable: `var(--primary)`, `var(--wa-akane)`,
   `text-foreground`, `bg-surface-2`. The 13 `--wa-*` 和色 colors are
   for charts + decoration ONLY; never role-map them.

8. **Density.** Three modes only: `compact` (28 px element), `default`
   (32 px), `comfortable` (44 px, WCAG-friendly). No `medium`, no
   intermediate sizes. Components honor `--density-element-*` tokens.

9. **Signal palette.** 5 colors with fixed semantics — `--success`
   (若竹 wakatake), `--warning` (山吹 yamabuki), `--info` (群青
   gunjō), `--error/destructive` (茜 akane), `--attention` (朱 shu).
   **Red (`--destructive`) is reserved for destructive actions only.**
   Don't use `--destructive` for "wrong answer" badges, validation
   chrome, or general emphasis.

10. **No emojis in product UI.** Iconography uses `lucide-react`.
    Emoji are acceptable in user-generated content (comments, chat,
    notifications) but never in chrome.

11. **Shell layout.** When a service needs a sidebar + topbar shell,
    it imports `<AppShell>` from `@godxjp/ui/components/shell` and
    plugs in its own nav config + screen routes. Services do not
    hand-roll a CSS grid for the chrome.

12. **Switchers (product/project) are universal.** The Linear-style
    quick switcher is one component, used everywhere — same data
    shape (`ForgeProduct` / `ForgeProject` from `@godxjp/ui/data`).
    A service that doesn't have a project concept passes
    `project={null}`; the chip auto-hides.

---

## Layout boundary — what a service CAN do without violating

| Service-owned | Must come from `@godxjp/ui` |
|---|---|
| Route tree (`react-router-dom` config) | Visual atoms: button, badge, card, KPI, kanban col |
| Page composition (what cards live on this screen) | Shell: sidebar + topbar + tweaks panel |
| Screen-specific widgets (e.g. a domain-pool map view that no other service has) | Theme tokens, density, dark mode |
| Domain data shapes (e.g. the sandbox's tmux pane object) | i18n provider, locale list, base dictionary |
| Per-service API client | Color palette, font stack, spacing scale |

If a screen requires a NEW primitive that another service might also
need, add it to this package first, then consume it. Don't fork.

---

## Adoption tracker

Each service must reach **100% token coverage** before it's allowed
to claim "GoDX Forge compliant" in its README:

| Service | Status | Owner | Notes |
|---|---|---|---|
| `calendar-service/frontend` | ✓ Adopted V1 | calendar | Greenfield SPA; ships compliant from F1 with shared tokens, primitives, shell, and i18n. |
| `forge-service/frontend` | adopting (phase 1) | platform | Reference implementation. |
| `admin-platform/frontend` | partial (existing Omnify tokens overlap ~90%) | platform | Migrate before Plan #19 cut-over. |
| `me-service/frontend` | not started | platform | Tracked under Plan #31 R6. |
| `console-service/frontend` | adopting (shell + routes) | platform | Epic #1412; tokens + `AppShell` + menu from `console-layout-spec.md` §6; gateway `VITE_CONSOLE_API_BASE_URL`. Rich CRUD waits on @godxjp/ui parity (#1461). |
| `agent-service/frontend` | not started | platform | Plan #21 G17 finished embed; visual port pending. |
| `knowledge-service/frontend` | not started | knowledge | Plan #18 K-phase polish. |

Operator-side dashboards (Grafana, Mailpit, etc.) are external — they
keep their own UI, not in scope.

---

## What lives here

```
packages/godxjp-ui/src/
├── tokens/                      Source of truth for CSS variables.
│   ├── tokens.css               Base palette, type scale, density,
│   │                            shadows, motion. Imports M PLUS 2.
│   └── tokens-ext.css           Sidebar, topbar, page, card, badge,
│                                kanban, dark mode, tenant overrides.
│
├── i18n/                        i18next bootstrap + base dictionary.
│   ├── index.ts                 initI18n(); auto-detect + JA fallback.
│   └── locales/{ja,en,vi}.ts    `ForgeTranslations` shape.
│
├── hooks/
│   └── useTweaks.ts             density / theme / tenant / locale /
│                                sidebar-collapsed state w/ persistence.
│
├── data/
│   └── products.ts              ForgeProduct / ForgeProject types +
│                                mock fixture (until forge-service
│                                /api/v1/orgs/ wires real data).
│
├── primitives/                  shadcn-styled atoms (button, badge,
│                                card, dialog, sheet, alert-dialog,
│                                select, switch, checkbox, table,
│                                tabs, popover, dropdown, …). One copy
│                                across the org.
│
└── components/shell/            AppShell, Sidebar, Topbar,
                                 ProductSwitcher, ProjectSwitcher,
                                 TweaksPanel, CommandPalette.
```

---

## How to consume from a service frontend

```tsx
// services/<svc>/frontend/src/main.tsx
import "@godxjp/ui/tokens.css";
import "@godxjp/ui/tokens-ext.css";
import { initI18n } from "@godxjp/ui/i18n";
import { AppShell, Sidebar, Topbar } from "@godxjp/ui/components/shell";

initI18n();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppShell sidebar={<Sidebar nav={MY_NAV} />} topbar={<Topbar />}>
      <Routes>{/* service-specific routes */}</Routes>
    </AppShell>
  </BrowserRouter>,
);
```

That's the entire integration surface for a new service.

---

## Versioning + change control

The package follows semver. Breaking changes (renamed token, removed
component prop, changed default tenant) require:

1. RFC issue in `godx-platform-sdk` repo (or local `docs/plans/` if
   pre-extraction).
2. Cross-service audit — which surfaces break, who fixes them.
3. Major version bump.

Additive changes (new component, new locale string, new wa-iro color,
new tenant) are minor / patch — no RFC needed.

Issue / PR for changes: file under `godx-jp/godx-platform-sdk` repo
once Plan #22 extraction completes; until then file under
`godx-jp/godx-admin` with label `area:design-system`.

---

## See also

- Design prototype the package is ported from: `chat1.md` + `chat2.md`
  (Claude Design handoff, 2026-05-08 / 2026-05-09).
- Plan #19 — forge-service extraction.
- Plan #22 — multi-repo standalone services. `@godxjp/ui` is the
  TypeScript counterpart to `godx-platform-sdk` (Go shared kernel).
- Plan #31 R6 — per-portal UI alignment.
