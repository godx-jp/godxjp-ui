---
diataxis: adr
library: "@godxjp/ui"
library_version: 3.0.0
adr: "0001"
title: Use Radix UI as the accessibility foundation for interactive primitives
status: accepted
date: 2026-01-14
updated: 2026-05-16
audience: [developer]
---

# ADR 0001 — Use Radix UI as the accessibility foundation

## Status

Accepted.

---

## Context

`@godxjp/ui` ships interactive primitives (Button, Dialog, Select, Tabs,
AlertDialog, Switch, Checkbox, Combobox, DropdownMenu, Popover, Calendar, and
Sheet) that require:

- Correct ARIA roles and state attributes (`aria-expanded`, `aria-selected`,
  `aria-checked`, `aria-disabled`, `aria-labelledby`, `aria-describedby`).
- Keyboard navigation contracts from WAI-ARIA APG 1.2 (Arrow keys, Home/End,
  Escape, Enter/Space).
- Focus trapping inside modal layers (Dialog, AlertDialog, Sheet).
- Portal rendering that prevents clipping by ancestor `overflow: hidden`.
- Cross-browser correctness (Chromium, WebKit, Gecko).

Implementing these from scratch for every primitive is expensive and
error-prone. Each primitive is a non-trivial state machine; missing a single
keyboard shortcut or ARIA attribute produces a WCAG 4.1.2 or 2.1.1 failure.

The team evaluated three approaches:

1. **Build in-house** — Maximum control; multi-month implementation; high
   ongoing maintenance cost as WAI-ARIA patterns evolve.
2. **Adopt a full component library** (MUI, Chakra, Ant Design) — Ships
   interactive primitives with a11y; also ships design opinions that
   conflict with the GoDX token system.
3. **Use a headless primitive layer** (Radix UI, Headless UI, Ark UI) —
   Provides the accessibility machinery only; styling is the library's
   responsibility.

---

## Decision

Use Radix UI primitives as the accessibility foundation for all interactive
components.

Every interactive primitive in `@godxjp/ui` wraps the corresponding Radix
primitive:

| `@godxjp/ui` primitive | Radix package |
|---|---|
| `Button` | `@radix-ui/react-slot` (for `asChild`) |
| `Dialog` | `@radix-ui/react-dialog` |
| `AlertDialog` | `@radix-ui/react-alert-dialog` |
| `Sheet` | `@radix-ui/react-dialog` |
| `Select` | `@radix-ui/react-select` |
| `Tabs` | `@radix-ui/react-tabs` |
| `Switch` | `@radix-ui/react-switch` |
| `Checkbox` | `@radix-ui/react-checkbox` |
| `DropdownMenu` | `@radix-ui/react-dropdown-menu` |
| `Popover` | `@radix-ui/react-popover` |
| `Combobox` | `@radix-ui/react-popover` + `cmdk` |
| `Label` | `@radix-ui/react-label` |

Radix handles all ARIA, keyboard nav, focus trap, and portal rendering. The
`@godxjp/ui` wrapper layer adds:

- CSS class application (`.btn`, `.btn-primary`, etc.) from the token system.
- `className` passthrough for per-instance Tailwind overrides.
- TypeScript prop typing (`ButtonProps`, `SheetContentProps`, etc.).
- Forwarded refs for parent access.

---

## Consequences

**Positive:**

- WCAG 2.1 AA compliance is inherited for keyboard and ARIA requirements
  across every wrapped primitive — no per-primitive a11y testing burden for
  the pattern.
- Radix is axe-core tested on every release; regressions are caught upstream.
- Thin wrapper pattern keeps component source small (~30–80 lines each) and
  legible.
- Consumers can inspect or fork the wrapper source without losing the a11y
  contract (ADR-0002).

**Negative / constraints:**

- `@godxjp/ui` takes a dependency on the Radix package family. Adding a new
  primitive that has no Radix counterpart requires either an in-house
  implementation or a Radix-compatible headless alternative, both of which
  require an ADR.
- Radix version pinning must be coordinated; a major Radix release that
  changes ARIA roles would be a breaking change for `@godxjp/ui`.

**Neutral:**

- Storybook (deferred to v3.1.0) will run `@storybook/addon-a11y` on every
  story as a CI gate for regressions. Until then, `jest-axe`/`vitest-axe`
  assertions cover the rendered output.

---

## See also

- [ADR 0002: shadcn-style ownership](./0002-shadcn-style-not-mui.md)
- [Explanation: Accessibility](../explanation/accessibility.md)
- [Radix UI](https://www.radix-ui.com/) — upstream documentation.
- [WAI-ARIA APG 1.2](https://www.w3.org/WAI/ARIA/apg/) — keyboard contracts.
