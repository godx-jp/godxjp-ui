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

That single import ships everything: colors, the bundled fonts (Noto Sans JP by default,
Montserrat for the Vietnamese locale — self-bundled & subsetted), the golden-ratio type scale,
spacing grid, radius scale, shadow ramp, and all component CSS. Nothing else to configure. Pick
density per surface with
`<PageContainer density="compact | default | comfortable">`.

---

## Slim CSS — ship only the layers you use

`@godxjp/ui/styles` bundles every component's CSS plus the fonts. To ship only
what you render, import the foundation plus the per-layer files you use (these
mirror the JS subpaths, so the CSS tree-shakes the same way):

```css
@import "@godxjp/ui/styles/base";          /* REQUIRED: tailwind + tokens + @layer base */
@import "@godxjp/ui/styles/control";       /* Button, Input, Select, Textarea, toggles */
@import "@godxjp/ui/styles/form-layout";   /* FormField */
@import "@godxjp/ui/styles/dialog-layout"; /* Dialog */
@import "@godxjp/ui/styles/card-layout";   /* Card */
@import "@godxjp/ui/styles/layout";        /* Flex/Grid spacing helpers */
/* …only what you use. Available: shell-layout, layout, control, card-layout,
   text-layout, table-layout, dialog-layout, alert-layout, badge-layout,
   data-display-layout, data-entry-layout, form-layout, navigation-layout,
   chart-layout, density. */
```

Rules: import `base` FIRST (the layer files declare `@layer components` and use
`@apply`, which need Tailwind + tokens already loaded). Skip
`@godxjp/ui/styles/fonts` when you manage fonts yourself and set the font tokens
(next section). A ~10-component site typically drops component CSS ~142K → ~26K
gzip.

---

## Fonts — token-driven, per-language

The base ships **no hardcoded brand face** (`--font-sans-base` is a pure system
stack). Supply your own faces (next/font, `@fontsource`, self-host) and set
tokens — never edit the library. Two modes, both token-only:

```css
/* 1. One face everywhere */
:root {
  --font-sans-base: var(--my-face), system-ui, sans-serif;
}

/* 2. Per-language faces — no [lang] selectors to write. Each locale reads its
      slot, falling back to --font-sans-base. */
:root {
  --font-sans-base: var(--brand-sans), system-ui, sans-serif;
  --font-sans-ja: "Noto Sans JP", var(--font-sans-base); /* html lang="ja" */
  --font-sans-vi: "Montserrat", var(--font-sans-base); /* html lang="vi" */
  --font-sans-ko: var(--font-kr), var(--font-sans-base); /* html lang="ko" */
  --font-sans-zh-hans: var(--font-sc), var(--font-sans-base); /* zh | zh-Hans | zh-CN */
  --font-sans-zh-hant: var(--font-tc), var(--font-sans-base); /* zh-Hant | zh-TW */
}
```

`styles/base.css` wires every `[lang]` to its slot; `styles/fonts` fills the
slots for the bundled Noto Sans JP + Montserrat. Headings read
`--font-family-display` and body reads `--font-family-body`, both defaulting to
`--font-family-sans` — override them for a dual-font (display + body) brand.

> **Per-locale @font-face loading is the consumer's job.** The library only
> exposes the tokens; deciding *which* `@font-face` blocks ship on *which* pages
> (e.g. loading the heavy CJK face only on `lang="ja"` routes) is done in your
> app's font pipeline, not the library.

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

  /* ── Brand depth — all opt-in, all quiet by default ─────────────── */
  --shadow-glow: 0 8px 20px hsl(var(--primary) / 0.32); /* glow halo on the primary CTA */
  --card-shadow: 0 1px 2px rgb(12 26 49 / 0.06), 0 10px 28px -14px rgb(12 26 49 / 0.2); /* lift every Card */
  --focus-ring-color: var(--ring); /* hue of every focus ring */
  --focus-ring-width: 2px; /* thickness of every focus ring */
  --gradient-hero: linear-gradient(180deg, hsl(var(--accent)), transparent); /* PageContainer header banner */
  --gradient-glow: radial-gradient(60% 70% at 90% -8%, hsl(var(--primary) / 0.1), transparent 70%); /* AppShell ambient wash */
  --overlay-background: rgb(12 26 49 / 0.55); /* modal scrim (Dialog / Sheet / Drawer) */
}
```

### The anchor tokens (single knobs that propagate)

| Anchor                                                                     | Default                 | Propagates to                                                                           |
| -------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| `--primary` (+ `-foreground`, `--ring`, `--accent`, `--accent-foreground`) | SmartHR blue            | every brand/action/focus surface                                                        |
| `--font-size-base` (+ `--font-size-ratio`)                                 | `0.875rem` (14px) / φ^¼ | the whole type scale `--font-size-{2xs…2xl}` + `--heading-h{1…4}` (all `base × ratioⁿ`) |
| `--radius` (+ `--radius-ratio`)                                            | `0.375rem` (6px) / φ    | `--radius-{xs…2xl}` (all `radius × φⁿ`)                                                 |
| `--shadow-color`                                                           | `0 0 0`                 | every shadow step `--shadow-{xs…2xl}` (`rgb(color / α)`)                                |
| `--shadow-glow`                                                            | invisible               | brand glow halo on the primary CTA (set the full shadow value)                          |
| `--card-shadow`                                                           | `none`                  | resting elevation of every Card                                                         |
| `--focus-ring-color` / `--focus-ring-width`                               | `var(--ring)` / `2px`   | hue & thickness of every keyboard-focus ring                                            |
| `--gradient-{hero,glow,brand}`                                            | `none`                  | hero header banner / AppShell ambient wash / spare (set the full gradient)              |
| `--overlay-background`                                                    | `rgb(0 0 0 / .5)`       | the scrim of every overlay (Dialog / AlertDialog / Sheet / Drawer)                      |

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

Scope the overrides under a tenant attribute instead of `:root`. The colour utilities are declared
with `@theme inline`, so a scoped `--primary` (and the other anchors) **re-resolve at the element**
— `bg-primary`, `text-success`, every component surface, the focus ring, the brand glow, gradients
and the modal scrim all retint inside the scope:

```css
[data-tenant="betoya"] {
  /* Colours, focus, glow, gradient, scrim — all propagate scoped */
  --primary: 146 60% 30%; /* VN green */
  --primary-foreground: 0 0% 100%;
  --ring: 146 60% 30%;
  --focus-ring-color: 146 60% 30%;
  --shadow-glow: 0 8px 20px hsl(var(--primary) / 0.3);
  --gradient-glow: radial-gradient(60% 70% at 90% -8%, hsl(var(--primary) / 0.1), transparent 70%);
  --overlay-background: rgb(10 40 25 / 0.55);
}
```

Set `data-tenant` on the app root. Two CSS-inheritance caveats for the **scoped** case (a single
`:root` brand theme is unaffected — there, overriding just `--radius` / `--shadow-color` cascades):

- **Radius & shadow-tint don't cascade from a scoped anchor.** `--radius-{xs…2xl}`, `--card-radius`,
  `--control-radius` and the `--shadow-{xs…2xl}` ramp are computed at their declaring element, so a
  scoped `--radius` / `--shadow-color` override won't reach them. For a scoped re-theme, re-declare
  the derived tokens you need (e.g. `--card-radius: var(--radius)`, or set `--card-shadow` to a
  literal value). See `docs/showcase/tiximax-portal.tsx` for a full scoped example.
- **Portaled overlays escape the subtree.** Dropdowns, Selects, Dialogs and Tooltips render in a
  portal at `<body>`, outside the `[data-tenant]` element — put the same `data-tenant` attribute on
  your portal container so they inherit the tenant's tokens (including `--overlay-background`).
