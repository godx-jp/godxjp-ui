---
diataxis: explanation
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer]
---

# Design philosophy

`@godxjp/ui` is built on three founding pillars. Each pillar has a corresponding
architecture decision record (ADR) that documents the alternatives considered
and the reasoning. This document explains the reasoning in narrative form.

---

## Pillar 1 — Radix as the interactive primitive foundation

Every component that involves keyboard navigation, focus management, ARIA roles,
or portal rendering wraps a [Radix UI](https://radix-ui.com) primitive.

Accessibility is genuinely hard. Implementing a correct keyboard-navigable `Select`
component that satisfies WCAG 2.1 AA, works in screen readers across VoiceOver,
NVDA, and JAWS, handles RTL, and degrades gracefully in reduced-motion mode is
a multi-week project. Radix has already done that work and maintains it across
browser updates and accessibility specification changes.

We do not reinvent keyboard navigation. If Radix has a primitive for it (Dialog,
Select, DropdownMenu, Tabs, Popover, Checkbox, Switch, AlertDialog, Separator,
Label, Slot), we wrap it. The Radix layer is invisible to consumers — they import
from `@godxjp/ui`, not from `@radix-ui/react-*` directly.

The consequence is that every interactive primitive in `@godxjp/ui` gets ARIA roles,
keyboard behavior, and focus management for free. We test on top of Radix's baseline
rather than building from scratch.

**See also:** [ADR 0001: Radix as foundation](../adr/0001-radix-as-foundation.md).

---

## Pillar 2 — shadcn-style ownership, not MUI-style black box

Material UI's model is: the framework owns the component; consumers configure it
via a theme object; the component's visual output depends on the framework's
internal rendering logic.

`@godxjp/ui`'s model is: components are thin wrappers that apply CSS classes.
The classes come from the token files. The consumer can read — and if needed, fork —
any component's source. The escape hatch is clear.

This is the pattern [shadcn/ui](https://ui.shadcn.com) pioneered: copy the
component source into your project if you need full control. `@godxjp/ui` does not
require copying — the package ships stable, published components — but the pattern's
spirit is preserved: components are explicit, readable, and not hiding state or
styling behind a configuration API.

The practical benefit is that when a service needs a behavior the component does not
yet support, they can extend it locally and open a PR to upstream rather than
threading props through a configuration system.

**See also:** [ADR 0002: shadcn-style not MUI](../adr/0002-shadcn-style-not-mui.md).

---

## Pillar 3 — Tokens, not utilities

Tailwind CSS utility classes encode values at compile time. `bg-blue-500` bakes
in `#3b82f6`. When the brand color changes, every file that uses `bg-blue-500`
must change.

`@godxjp/ui` components use CSS classes that read CSS custom properties at render
time. `.btn-primary` reads `background: var(--primary)`. When the brand color
changes, one line in `tokens.css` changes — no component file changes, no rebuild,
no per-service patch.

This makes dark mode, density modes, and per-tenant theming mechanical CSS attribute
flips. Set `data-theme="dark"` on `<html>` and every token in the system switches
to its dark-mode declaration in `tokens-ext.css`. No JavaScript, no React state,
no style recalculation beyond CSS variable resolution.

Tailwind utilities that compose token names (e.g. `bg-background`, `text-foreground`,
`border-border`) are allowed because they translate to `var(--background)` etc.
via the Tailwind v4 theme integration. Raw value utilities (`bg-blue-500`,
`text-zinc-900`) are forbidden in primitive source code.

**See also:** [ADR 0003: Tokens not utilities](../adr/0003-tokens-not-utilities.md).

---

## The GoDX visual language

The design tokens encode three Japanese enterprise aesthetic principles:

| Principle | Meaning | Enforcement |
|---|---|---|
| **渋み** (shibumi) | Restrained elegance | Primary chroma ≤ 0.18 in OKLCH. No neon. No gradients on functional UI. |
| **間** (ma) | Vertical breathing room | Body `line-height: 1.7`. Generous spacing scale. Density toggle for compact data tables. |
| **簡素** (kanso) | Simplicity | Three font weights: 400 (body), 500 (headings + buttons), 700 (emphasis). |

These are brand contracts, not taste choices. Deviations require operator sign-off.

**See also:** [BRAND.md](../../BRAND.md), [brand-bible](./brand-bible.md).

---

## See also

- [Architecture](./architecture.md) — how the three pillars translate to the component hierarchy.
- [Accessibility](./accessibility.md) — how Radix + WCAG 2.1 AA combine.
