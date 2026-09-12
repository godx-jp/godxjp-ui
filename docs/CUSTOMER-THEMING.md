# Theming `@godxjp/ui`

The design system ships a complete, **zero-config default theme**. Two audiences:

- **Internal apps** — just import the styles. No configuration needed. - **Customer apps** — override a handful of **anchor tokens** in your own `theme.css`; the whole system rescales/retints in proportion (golden-ratio type & radius, derived shadow ramp, etc.).

---

## Internal apps — zero config

```ts
import "@godxjp/ui/styles";
```

That single import ships everything: colors, the bundled fonts (**Noto Sans JP** as the default face — including the Vietnamese coverage — with **M PLUS 2** as the fallback, self-bundled & subsetted), the golden-ratio type scale, spacing grid, radius scale, shadow ramp, and all component CSS. Nothing else to configure. Pick density per surface with `<PageContainer density="compact | default | comfortable">`.

---

## CSS entries — `styles`, `styles/core`, `styles/core-with-fallbacks`, `styles/core-with-jis-level1`, nothing smaller

`@godxjp/ui/styles` bundles every component's CSS plus the fonts: **729 woff2 subsets, ~11.7 MB on disk** at the current @fontsource versions (issue #535 measured 737 files / 13 MB in a real consumer build). When you manage fonts yourself (next/font, a system stack, a browser extension that must not ship font files), load the same layers without the faces:

```css
@import "@godxjp/ui/styles/core"; /* every component layer, no @font-face */
```

`core` carries **zero** `@font-face` — `grep -c '@font-face' node_modules/@godxjp/ui/dist/styles/core.css` → `0` — and that number is the point of it. If you supply Noto Sans JP yourself and also want the cold-visit swap to stop reflowing the page (issue #475), take the third entry: `core` plus the six metric-matched fallback faces, every one `local()`-only, so the extra cost over `core` is **zero network bytes**.

```css
@import "@godxjp/ui/styles/core-with-fallbacks"; /* core + 6 local()-only faces */
```

It declares the faces and nothing else — name the family yourself, directly after your own face:

```css
:root {
  --font-sans-base: "Noto Sans JP", "Noto Sans JP Fallback", system-ui, sans-serif;
}
```

### A Japanese app that wants the bundled face anyway

The slicing is what costs the round-trips: a browser cannot know which of the 729 faces it needs
until it has laid out and measured the text, so every new screen discovers a new handful. The
fourth entry replaces them with **one merged file per weight**, JIS X 0208 level 1 — 2965 kanji
plus kana, symbols, Cyrillic, Latin and Vietnamese, 3861 code points:

```css
@import "@godxjp/ui/styles/core-with-jis-level1"; /* core + fallbacks + 3 merged faces */
```

Measured against the sliced entry, Noto Sans JP only, weights 400/500/700:

| distinct Japanese characters on screen        |                   `styles` |   `core-with-jis-level1` |
| --------------------------------------------- | -------------------------: | -----------------------: |
| 448 — this package's own `ja` labels, no data |  99 requests · 1,051,268 B | 3 requests · 1,534,636 B |
| 694 — labels plus names, addresses, prose     | 150 requests · 1,772,728 B | 3 requests · 1,534,636 B |
| 772 — a little more prose                     | 216 requests · 3,491,840 B | 3 requests · 1,534,636 B |

The left column grows with your content and is paid again on every screen that renders a character
no earlier screen did; the right column does not move. **Below roughly 620 distinct characters the
slices are fewer bytes** (in ~100 requests), so an app that renders less Japanese than this
package's own menu labels should stay on `styles`.

What is deliberately not in it: **JIS level 2** (rows 48–84), which would roughly double the bytes
to cover kanji that appear in rare surnames — those resolve from the platform Japanese face, so
name one after ours. **M PLUS 2**, which sits behind Noto Sans JP in every stack this package ships
and is therefore never downloaded today either; merging it would add 1,089,676 bytes for nothing.
And **no `unicode-range`** on the merged faces, because per-range discovery is the mechanism the
entry exists to remove — the cost of that is a Latin-only screen downloading its weight's ~500 KB
rather than the ~25 KB of Latin inside it.

Like `core-with-fallbacks`, it declares faces and does not set `--font-sans-base`; name a platform
Japanese face after ours so level 2 kanji have somewhere to land:

```css
:root {
  --font-sans-base:
    "Noto Sans JP", "Noto Sans JP Fallback", "Hiragino Sans", "Yu Gothic Medium", Meiryo, system-ui,
    sans-serif;
}
```

The per-layer files (`control`, `card-layout`, `navigation-layout`, …) are the package's internal structure, **not a public menu**. Layers share rules — a Select's rows and a menu's surface, a form's rhythm, a card's header type — so a page that loads a subset renders naked menus and unsized rows with no error. The runtime `visual-audit` reports it as `css-layers-missing`.

---

## Fonts — token-driven, per-language

The base ships **no hardcoded brand face** (`--font-sans-base` is a pure system stack). Supply your own faces (next/font, `@fontsource`, self-host) and set tokens — never edit the library. Two modes, both token-only:

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

`styles/base.css` wires every `[lang]` to its slot; the opt-in `styles/fonts`
overwrites `--font-sans-base` (and `--font-sans-vi`) with the bundled stack —
**Noto Sans JP** primary, **M PLUS 2** fallback. (**Bundle change:** v16 bundled
Noto Sans JP + Montserrat; v18.12.0–18.12.19 bundled M PLUS 2 + Noto Sans JP;
v18.12.20+ bundles Noto Sans JP + M PLUS 2 (product override, direct
instruction). If your design spec named an earlier bundle's faces, set the
tokens yourself rather than relying on the bundle.) Second in that stack is
`"Noto Sans JP Fallback"`: local faces (Arial / Liberation Sans for Latin, the
platform's gothic face for Japanese) with `size-adjust` and ascent/descent
overrides tuned to Noto Sans JP. The bundled faces are `font-display: swap`, so
a cold visit paints in this fallback first; because it occupies the same line
boxes and nearly the same advances, the swap does not reflow the page (#475).
If you restate the stack yourself, keep it directly after "Noto Sans JP". Headings read
`--font-family-display` and body reads `--font-family-body`, both defaulting to
`--font-family-sans` — override them for a dual-font (display + body) brand.

> **Per-locale @font-face loading is the consumer's job.** The library only
> exposes the tokens; deciding _which_ `@font-face` blocks ship on _which_ pages
> (e.g. loading the heavy CJK face only on `lang="ja"` routes) is done in your
> app's font pipeline, not the library.

---

## Customer apps — override anchor tokens

Import the styles, then set anchor tokens in your app's `theme.css` (loaded after the import).
**Never edit the package token files** — override from your app.

````css
@import "@godxjp/ui/styles";

:root { /* ── Brand color (HSL components — no hsl() wrapper) ─────────────── */ --primary: 211 73% 15%; /* your brand hue → buttons, links, focus ring, brand chrome */ --primary-foreground: 0 0% 100%; /* text on --primary */ --ring: 24 99% 46%; /* focus ring (often a brand accent) */ --accent: 24 99% 95%; /* hover/active surface tint */ --accent-foreground: 24 99% 28%;

/* ── Type scale — ONE knob, golden-ratio derived ────────────────── */ --font-size-base: 1rem; /* 16px (default 14px). Every step (xs…2xl) + headings rescale by ratio. */ --font-size-ratio: 1.1227; /* φ^¼ default — raise toward φ=1.618 for a more dramatic scale. */

/* ── Radius — ONE knob, golden-ratio derived ───────────────────── */ --radius: 0.5rem; /* 8px (default 6px). xs…2xl rescale by --radius-ratio (φ). */

/* ── Shadow tint — ONE knob ─────────────────────────────────────── */ --shadow-color: 12 26 49; /* RGB channels (default 0 0 0). Tints the WHOLE shadow ramp. */

/* ── Brand depth — all opt-in, all quiet by default ─────────────── */ --shadow-glow: 0 8px 20px hsl(var(--primary) / 0.32); /* glow halo on the primary CTA */ --card-shadow: 0 1px 2px rgb(12 26 49 / 0.06), 0 10px 28px -14px rgb(12 26 49 / 0.2); /* lift every Card */ --focus-ring-color: var(--ring); /* hue of every focus ring */ --focus-ring-weight: var(--stroke-md); /* thickness of every focus ring — 2px; nothing paints until <html data-focus-outline="on"> */ --focus-ring-opacity: 1; /* alpha of every focus ring */ --focus-ring-offset: 0px; /* gap, outline-form rings only (star, dot, anchor) */ --gradient-hero: linear-gradient( 180deg, hsl(var(--accent)), transparent ); /* PageContainer header banner */ --gradient-glow: radial-gradient( 60% 70% at 90% -8%, hsl(var(--primary) / 0.1), transparent 70% ); /* AppShell ambient wash */ --overlay-background: rgb(12 26 49 / 0.55); /* modal scrim (Dialog / Sheet / Drawer) */ } ```

### The anchor tokens (single knobs that propagate)

| Anchor                                                                     | Default                 | Propagates to                                                                           |
| -------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| `--primary` (+ `-foreground`, `--ring`, `--accent`, `--accent-foreground`) | SmartHR blue            | every brand/action/focus surface                                                        |
| `--font-size-base` (+ `--font-size-ratio`)                                 | `0.875rem` (14px) / φ^¼ | the whole type scale `--font-size-{2xs…2xl}` + `--heading-h{1…4}` (all `base × ratioⁿ`) |
| `--radius` (+ `--radius-ratio`)                                            | `0.375rem` (6px) / φ    | `--radius-{xs…2xl}` (all `radius × φⁿ`)                                                 |
| `--shadow-color`                                                           | `0 0 0`                 | every shadow step `--shadow-{xs…2xl}` (`rgb(color / α)`)                                |
| `--shadow-glow`                                                            | invisible               | brand glow halo on the primary CTA (set the full shadow value)                          |
| `--card-shadow`                                                            | `none`                  | resting elevation of every Card                                                         |
| `--focus-ring-color` / `--focus-ring-weight`                               | `var(--ring)` / `1px`   | hue & thickness of every keyboard-focus ring — but nothing paints until the switch below is on |
| `--focus-ring-opacity` / `--focus-ring-offset`                             | `1` / `0px`             | alpha of every ring · gap for outline-form rings (star, carousel dot, heading anchor)   |
| `--gradient-{hero,glow,brand}`                                             | `none`                  | hero header banner / AppShell ambient wash / spare (set the full gradient)              |
| `--overlay-background`                                                     | `rgb(0 0 0 / .5)`       | the scrim of every overlay (Dialog / AlertDialog / Sheet / Drawer)                      |

### Focus ring — THE SWITCH FIRST, then three levels of override

**The indicator ships OFF.** `--focus-outline` is `0`, and every painted focus length multiplies by it, so by default nothing paints a focus mark. That is a product decision with a stated cost — it forfeits WCAG 2.2 SC 2.4.7 (AA) and a JIS X 8341-3 AA claim — recorded in `docs/DESIGN-AUTHORITY.md`. Turning it on is ONE attribute on the root element, no CSS:

```html
<html data-focus-outline="on"></html>
```

(`AppProvider` has the equivalent.) Every `:focus-visible` selector is present either way; only the paint is switched.

Every ring is then drawn by a single rule (`src/styles/focus-ring.css`) reading the tokens above. Nothing else paints one; a test fails the build if a stylesheet tries.

**Thickness is `--focus-ring-weight`, never `--focus-ring-width`.** The width is DERIVED — `calc(var(--focus-ring-weight) * var(--focus-outline))` — so assigning it directly paints a ring even while the indicator is switched off, and that is exactly what the build-failing test forbids a stylesheet to do.

```css
:root {
  --focus-ring-color: 24 99% 46%; /* every ring, brand orange */
  --focus-ring-weight: var(--stroke-md); /* every ring, 2px */
}
```

**A slim ring that still satisfies the criteria.** Switched on, the shipped weight is one hairline (1px) in the focus hue, measured in Chromium at **5.05:1** light and **7.07:1** dark on every surface a control sits on — so SC 1.4.11 (3:1, non-text contrast) is met on colour, independent of thickness. SC 2.4.13 Focus Appearance (AAA) additionally wants a perimeter of at least 2 CSS px: set `--focus-ring-weight: var(--stroke-md)` (measured: a 2px ring, same hue, same ratio). `var(--stroke-lg)` is the heavy 3px mark.

**Per component.** A component that genuinely needs a different ring publishes its own knob and the rule picks it up locally — Toggle and TimeInput ship a heavier, softer ring because they are filled surfaces where a hard 2px reads as a second border:

```css
:root {
  --toggle-focus-ring-width: 3px;
  --toggle-focus-ring-alpha: 0.35;
  --sidebar-user-focus-ring-alpha: 0.45; /* tinted shell ground */
  --rating-focus-ring-offset: 2px; /* outline form needs a gap */
}
```

**Per instance.** Any subtree, no CSS file needed:

```tsx
<div style={{ "--focus-ring-color": "0 84% 60%" } as React.CSSProperties}>…</div>
```

**Turning it back off** — drop the `data-focus-outline` attribute (or set `--focus-outline: 0`), which is the shipped state. Do NOT reach for `--focus-ring-width`: it is derived from the weight and the switch, and pinning it to any value is the same mistake in the other direction. Note the cost either way — with no visible focus indicator the package does not meet WCAG 2.2 SC 2.4.7.

**Adding your own component to the system**: put `ui-focus-ring` (or `ui-focus-ring-outline` when the mark needs a gap) on the focusable element.

### What does NOT need an anchor

Density (`<PageContainer density>`) scales component sizes, not the grid. - **Pills / squared corners** use `--radius-pill` (9999px) / `--radius-sharp` (0) — full-round shapes stay round regardless of `--radius`.

---

## Multi-tenant (one app, many brands)

Scope the overrides under a tenant attribute instead of `:root`. The colour utilities are declared with `@theme inline`, so a scoped `--primary` (and the other anchors) **re-resolve at the element** — `bg-primary`, `text-success`, every component surface, the focus ring, the brand glow, gradients and the modal scrim all retint inside the scope:

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

Set `data-tenant` on the app root. Two CSS-inheritance caveats for the **scoped** case (a single `:root` brand theme is unaffected — there, overriding just `--radius` / `--shadow-color` cascades):

- **Radius & shadow-tint don't cascade from a scoped anchor.** `--radius-{xs…2xl}`, `--card-radius`, `--control-radius` and the `--shadow-{xs…2xl}` ramp are computed at their declaring element, so a scoped `--radius` / `--shadow-color` override won't reach them. For a scoped re-theme, re-declare the derived tokens you need (e.g. `--card-radius: var(--radius)`, or set `--card-shadow` to a literal value).
````
