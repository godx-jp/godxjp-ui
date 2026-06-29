# Roadmap — Colour extensibility (glow · tint · gradient · accent)

> Principle: **extend colour by adding a structural SLOT that reads an existing semantic role —
> never by inventing a new colour code.** A service themes depth (glow), washes (tint), brand chrome
> (gradient) and emphasis (accent) from the token layer alone; components stay role-bound so meaning
> never drifts and you never "manage many colour codes". Audited 2026-06 (1 mapper + 8 parallel
> implement→review agents). All implemented slots are **opt-in and quiet by default** — the
> dxs-kintai baseline is byte-identical (verified in a browser).

## The mental model — three layers

1. **Semantic role** (`--primary`, `--secondary`, `--success`, …) — a FIXED vocabulary. Components
   read roles; you re-theme by changing a role's VALUE (`--primary: 41 73% 53%` → gold). One value,
   whole system. No props.
2. **Decorative colour** (`--wa-*`, `--chart-*`, or a consumer's own `--rose`/`--silver`) — ADD a
   token; use it in your own UI or feed it to a colour-accepting prop (charts). Never overrides a
   role.
3. **Structural slot** (this document) — a per-surface knob (`--card-glow`, `--card-tint`,
   `--sidebar-gradient`, `--checkbox-checked-background`, …) that lets a role colour reach a surface
   it couldn't before. Default is a no-op (invisible) or the surface's existing role value.

> Adding a NEW `tone`/`variant` VALUE to a component (e.g. `<Badge tone="rose">`) is a **fourth**
> thing — a controlled-vocabulary change in the library (union type + CSS), not a token. Those live
> in the "prop tier" roadmap at the bottom.

## The four extension primitives (patterns to mirror)

| Primitive       | What it does                     | Reference implementation                                                             | Default     |
| --------------- | -------------------------------- | ------------------------------------------------------------------------------------ | ----------- |
| **Accent edge** | semantic leading-edge stripe     | `Card` `data-accent` + `--card-accent-rail-width`                                    | off         |
| **Glow**        | brand halo layered on a shadow   | foundation `--shadow-glow`; `Button` CTA, `--card-glow`, `--dialog-content-glow`     | invisible   |
| **Tint**        | role wash over a fill/background | `Alert` `--alert-bg-alpha`; `--card-tint`, `--avatar-tint`                           | transparent |
| **Gradient**    | brand chrome fill                | foundation `--gradient-hero/-glow/-brand`; `--sidebar-gradient`, `--topbar-gradient` | none        |

**Glow** layers onto an existing `box-shadow`: `box-shadow: var(--card-shadow), var(--card-glow)`
(both default to `0 0 0 0 transparent`, valid in a comma list — `none` is not).
**Tint** is an overlay gradient over the base fill: `background: linear-gradient(var(--card-tint),
var(--card-tint)), hsl(var(--card-background))` (transparent default = byte-identical at rest).

## Implemented slots (token-only, shipped)

Everything below is now a token. Defaults are unchanged; a service overrides the token (globally at
`:root`, or scoped under `[data-tenant]`) to retheme.

### Layout / Shell

| Surface              | Slot(s)                                                     | Default      |
| -------------------- | ----------------------------------------------------------- | ------------ |
| AppShell sidebar     | `--sidebar-gradient`                                        | `none`       |
| AppShell topbar      | `--topbar-gradient`                                         | `none`       |
| AppShell main        | `--gradient-glow` (ambient wash)                            | `none`       |
| PageContainer header | `--gradient-hero` (hero banner)                             | `none`       |
| Sidebar active item  | `--sidebar-item-active-color`, `--sidebar-item-active-tint` | role default |

### Data-display

| Surface              | Slot(s)                                                                          | Default                     |
| -------------------- | -------------------------------------------------------------------------------- | --------------------------- |
| Card surface         | `--card-shadow` (lift), `--card-glow` (halo), `--card-tint` (fill wash)          | quiet                       |
| Card accent edge     | `data-accent` + `--card-accent-rail-width`                                       | off                         |
| Avatar               | `--avatar-background`, `--avatar-tint`                                           | `--muted` / transparent     |
| Progress             | `--progress-track-background`, `--progress-fill-background`                      | `--secondary` / `--success` |
| Timeline             | `--timeline-dot-done/current-background`, `--timeline-line-completed-background` | `--success`/`--primary`     |
| TreeList active item | `--tree-item-active-border`, `--tree-item-active-background`                     | `--primary`/.3, /.05        |
| Table rows           | `--table-row-striped/hover/selected-background`                                  | `--muted` washes            |

### Feedback

| Surface              | Slot(s)                                                    | Default                        |
| -------------------- | ---------------------------------------------------------- | ------------------------------ |
| Dialog / Sheet panel | `--dialog-content-glow`                                    | invisible                      |
| Alert soft tint      | `--alert-bg-alpha`, `--alert-border-alpha`                 | 0.05 / 0.3                     |
| EmptyState icon      | `--empty-state-icon-foreground`, `--empty-state-icon-tint` | `--muted-foreground`/`--muted` |
| Skeleton             | `--skeleton-background`                                    | `--muted`                      |
| Overlay scrim        | `--overlay-background` (Dialog/Sheet/Drawer)               | `rgb(0 0 0 / .5)`              |

### Controls

| Surface                            | Slot(s)                                                                                  | Default                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------- |
| Checkbox / Switch / Toggle checked | `--checkbox-checked-background`, `--switch-checked-background`, `--toggle-on-background` | `--primary`                 |
| Slider                             | `--slider-track-background`, `--slider-range-background`                                 | `--primary`/.2, `--primary` |
| Button CTA glow                    | `--shadow-glow`                                                                          | invisible                   |
| Focus ring (all controls)          | `--focus-ring-color`, `--focus-ring-width`                                               | `--ring` / 2px              |

### Navigation

| Surface                                                 | Slot(s)                                       | Default    |
| ------------------------------------------------------- | --------------------------------------------- | ---------- |
| Floating menus (context-menu, menubar, navigation-menu) | brand glow via `--shadow-glow`                | invisible  |
| Menubar item hover                                      | `--menubar-item-hover-background/-foreground` | `--accent` |

## Usage

```css
@import "@godxjp/ui/styles";

:root {
  /* depth — one global glow knob washes every opted-in surface */
  --shadow-glow: 0 8px 20px hsl(var(--primary) / 0.3);
  --card-shadow: var(--shadow-sm); /* lift every card */
  --card-glow: var(--shadow-glow); /* …and glow it */
  --card-tint: hsl(var(--primary) / 0.03); /* faint brand wash on the fill */

  /* brand chrome */
  --sidebar-gradient: linear-gradient(180deg, hsl(var(--secondary)), transparent);

  /* retint a state without touching the role */
  --checkbox-checked-background: hsl(var(--success)); /* green "checked" */
}
```

Scoped multi-tenant: put the same overrides under `[data-tenant="x"]`. Opt-in slots (glow/tint/
gradient) and tokenised role-colours both re-resolve inside the scope because the consuming CSS
reads the token directly at the element. (See `docs/CUSTOMER-THEMING.md` for the two scoped
caveats — radius/shadow-tint intermediates and portaled overlays.)

## Naming convention

Component depth tokens follow `--{component}-{part}-{property}` where `{property}` ∈
`glow | tint | gradient | background | border | shadow | color | foreground | alpha`. Put them in
`src/tokens/components/<component>.css`; the `check-token-tiers` guard enforces the prefix + suffix.

## Prop tier — roadmap (NOT yet implemented)

These need a controlled-vocabulary / TSX change (a new `tone`/`variant`/`data-*` value), not just a
token — so they are deliberately **not** consumer-configurable from tokens alone. Each is a small,
reviewable library change when a real need appears:

- **Per-instance accent/tone** where today it's global or role-fixed: `Sidebar` item state
  (`data-tone` for attention/destructive nav), `Steps` per-step status colour, `Calendar` selected
  day tone, `Progress` `tone="primary"` (currently only success/warning), `DropdownMenuItem`
  info/warning/success variants, `Tabs` active-trigger tone, `Badge`/`Button` custom brand tone.
- **Tailwind-in-TSX colours** that can't be tokenised without moving them to CSS:
  `TableRow` base hover/selected (`hover:bg-accent/70`, `data-[state=selected]:bg-primary/[0.06]`
  in `table.tsx`), `Calendar`/`Checkbox` checked classes set in TSX, `Tooltip`/`Popover` chrome.
- **Resting decorative chrome** that could each get a role-expression token in a follow-up:
  `Rating` star colour (`--rating-star-color`), checkbox/radio resting border
  (`--checkbox-border-color`).

## Known finding — default semantic colours vs AA text contrast

`check:contrast` (the WCAG-AA text gate) surfaces a design-level tradeoff in the **default dxs-kintai
theme**: the light wa-iro semantics — 若竹 `--success` (#68be8d) and 山吹 `--warning` (#f8b500) — do
NOT meet AA 4.5:1 for **small text on white** (a green/yellow `StatCard` delta, a `Badge tone="success"
variant="outline"` label). They are fine as fills (status band + dark/white text) but fail as small
coloured text. Brand re-themes (e.g. TIXIMAX) pass because they pick darker semantics. Resolving the
default theme is a brand-colour decision — either darken `--success`/`--warning`, or add darker
`--text-success` / `--text-warning` tokens (as the source Claude Design does: `--text-success`
#197A43 ≠ `--success` #008148) and route success/warning _text_ through them. Tracked here; not yet
changed to avoid an unflagged shift of the core signalling palette.

When implementing a prop-tier item, follow the controlled-vocabulary discipline
(`docs/PROPS-VOCABULARY.md`): extend the union type, add the `data-*` CSS rule reading a role +
an optional alpha token, register the prop in the MCP catalog, add a vitest, and an example page.
