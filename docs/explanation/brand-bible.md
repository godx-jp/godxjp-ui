---
diataxis: explanation
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer]
---

# Brand bible

This document expands the GoDX visual language philosophy. The canonical specification
is in [BRAND.md](../../BRAND.md). Read this document to understand why the rules
exist; read BRAND.md to apply them.

---

## The three founding principles

The GoDX brand is grounded in Japanese enterprise aesthetic tradition, adapted for
professional developer tools:

### 渋み — Shibumi (restrained elegance)

Shibumi rejects decoration for its own sake. A UI element earns its visual weight
by the function it performs — not by being colorful, animated, or distinctive.

The token rule: primary chroma ≤ 0.18 in OKLCH. At 0.18 chroma, colors read as
rich but not garish — the SmartHR blue (`oklch(56% 0.15 240)`) is recognizable as
a brand color without demanding attention. A neon green at chroma 0.30 would
violate shibumi.

Functional UI elements (buttons, badges, alerts) use semantic role colors:
`--primary`, `--destructive`, `--success`, `--warning`, `--info`, `--attention`.
The wa-iro decorative palette (akane, gunjo, yamabuki, etc.) is reserved for charts,
illustrations, and accent tags — surfaces that carry no action semantics.

### 間 — Ma (spatial breathing room)

Ma is the principle that empty space is not wasted space — it is the interval that
gives elements room to breathe and meaning to emerge.

The token rules: body `line-height: 1.7` (above the Western default of ~1.5),
generous spacing scale (4 px grid starting at 4 px), a density system that lets
operators tune without violating the principle.

The density system exists because some contexts genuinely need compact data tables
(kintone-style 28 px rows) while others need comfortable forms (WCAG 44 px touch
targets). Ma does not mean "always generous" — it means "never cramped without reason."

### 簡素 — Kanso (simplicity)

Kanso rejects unnecessary complexity. Three font weights (400, 500, 700) instead
of six. Heading sizes smaller than Western defaults (h1 = 20 px vs. h1 = 32 px)
because information density is more Japanese than spectacle. The sidebar is 256 px
wide — enough to read labels; not so wide that it dominates the canvas.

---

## The token contract

The brand bible is enforced through the CSS custom property system. Every visual
value is a token; every token has a name that implies its semantic role.

Services that consume `@godxjp/ui`:

- Import `@godxjp/ui/tailwind.css` once as the first stylesheet.
- Never redefine `--primary`, `--foreground`, `--background`, `--card`, `--muted`,
  or any base token on `:root`.
- May add tenant overrides under `[data-tenant="<slug>"]` in a service-local `theme.css`,
  subject to the chroma cap.
- Use `[data-tenant]` and `[data-theme]` attribute switches, never JavaScript-driven
  style mutations.

Breaking the contract means the brand no longer governs the visual output. A PR
that hard-codes `color: #0077c7` or `background: blue` in component code is rejected
at review — not because of aesthetic preference but because it removes the token
from operator control.

---

## Design handoff artifacts

The v3 brand is derived from the Claude Design handoff bundle archived at
`design/source-2026-05-13/`. Reference HTML prototypes in that directory show:

- `godx-unified.html` — full admin shell (the canonical visual target).
- `signin.html`, `device.html`, `login.html` — auth flow screens.
- `design-canvas.jsx` — React canvas of every primitive.

When implementing a new screen, open the closest reference prototype first. Match
the visual rhythm. Deviations require a design sign-off.

---

## Forbidden patterns

From BRAND.md (summarized here for context):

- Hard-coded hex colors in component code.
- Custom font sizes outside `--text-*` scale.
- Spacing values off the 4 px grid.
- Font weight 300 / 600 / 800 / 900.
- Tailwind utilities that re-encode token values (`text-blue-500` instead of
  `text-[var(--primary)]`).
- New shadow / radius / motion curves "just for this card."

---

## See also

- [BRAND.md](../../BRAND.md) — canonical specification (always authoritative).
- [Reference: Tokens](../reference/tokens.md) — every CSS custom property.
- [ADR 0003: Tokens not utilities](../adr/0003-tokens-not-utilities.md).
