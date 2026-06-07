# Theming `@godxjp/ui`

The design system ships a complete, **zero-config default theme**. Two audiences:

- **Internal apps** — just import the styles. No configuration needed.
- **Customer apps** — override a handful of **anchor tokens** in your own `theme.css`; the whole
  system rescales/retints in proportion (golden-ratio type & radius, derived shadow ramp, etc.).

---

## Internal apps — zero config

```ts
import "@godxjp/ui/styles";
```

That single import ships everything: colors, the M PLUS 2 font (self-bundled, subsetted
latin/vi/jp), the golden-ratio type scale, spacing grid, radius scale, shadow ramp, and all
component CSS. Nothing else to configure. Pick density per surface with
`<PageContainer density="compact | default | comfortable">`.

---

## Customer apps — override anchor tokens

Import the styles, then set anchor tokens in your app's `theme.css` (loaded after the import).
**Never edit the package token files** — override from your app.

```css
@import "@godxjp/ui/styles";

:root {
  /* ── Brand color (HSL components — no hsl() wrapper) ─────────────── */
  --primary: 211 73% 15%; /* your brand hue → buttons, links, focus ring, brand chrome */
  --primary-foreground: 0 0% 100%; /* text on --primary */
  --ring: 24 99% 46%; /* focus ring (often a brand accent) */
  --accent: 24 99% 95%; /* hover/active surface tint */
  --accent-foreground: 24 99% 28%;

  /* ── Type scale — ONE knob, golden-ratio derived ────────────────── */
  --font-size-base: 1rem; /* 16px (default 14px). Every step (xs…2xl) + headings rescale by ratio. */
  --font-size-ratio: 1.1227; /* φ^¼ default — raise toward φ=1.618 for a more dramatic scale. */

  /* ── Radius — ONE knob, golden-ratio derived ───────────────────── */
  --radius: 0.5rem; /* 8px (default 6px). xs…2xl rescale by --radius-ratio (φ). */

  /* ── Shadow tint — ONE knob ─────────────────────────────────────── */
  --shadow-color: 12 26 49; /* RGB channels (default 0 0 0). Tints the WHOLE shadow ramp. */
}
```

### The anchor tokens (single knobs that propagate)

| Anchor                                                                     | Default                 | Propagates to                                                                           |
| -------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| `--primary` (+ `-foreground`, `--ring`, `--accent`, `--accent-foreground`) | SmartHR blue            | every brand/action/focus surface                                                        |
| `--font-size-base` (+ `--font-size-ratio`)                                 | `0.875rem` (14px) / φ^¼ | the whole type scale `--font-size-{2xs…2xl}` + `--heading-h{1…4}` (all `base × ratioⁿ`) |
| `--radius` (+ `--radius-ratio`)                                            | `0.375rem` (6px) / φ    | `--radius-{xs…2xl}` (all `radius × φⁿ`)                                                 |
| `--shadow-color`                                                           | `0 0 0`                 | every shadow step `--shadow-{xs…2xl}` (`rgb(color / α)`)                                |

Semantic status colors (`--success/-warning/-info/-attention/-destructive`) are **fixed** so a
"rejected" badge means the same in every brand — override them only if your brand genuinely
redefines status meaning.

### What does NOT need an anchor

- **Spacing** is a fixed 4px grid (`--space-*`, Tailwind/Material standard) — predictable, not
  rescaled by brand. Density (`<PageContainer density>`) scales component sizes, not the grid.
- **Pills / squared corners** use `--radius-pill` (9999px) / `--radius-sharp` (0) — full-round
  shapes stay round regardless of `--radius`.

---

## Multi-tenant (one app, many brands)

Scope the overrides under a tenant attribute instead of `:root`:

```css
[data-tenant="betoya"] {
  --primary: 146 60% 30%; /* VN green */
  --ring: 146 60% 30%;
}
```

Set `data-tenant` on `<html>` / the app root. Only `--primary`/`--ring`/`--foreground` typically
vary per tenant; semantic colors stay shared.
