# Theming `@godxjp/ui`

The design system ships a complete, **zero-config default theme**. Two audiences:

- **Internal apps** — just import the styles. No configuration needed. - **Customer apps** — override a handful of **anchor tokens** in your own `theme.css`; the whole system rescales/retints in proportion (golden-ratio type & radius, derived shadow ramp, etc.).

---

## The order to reach for things — read this before anything below

This document lists a lot of ways to change how the system looks. They are not alternatives; they
are a **priority order**, and the whole point of the order is that you stop at the first level that
does the job. Ant Design states the same rule for the same reason — _"In most cases, using Seed
Tokens is sufficient for custom themes"_ — and the cost of skipping down a level is real, not
stylistic.

| level            | what it is                                                                                                                                          | when                                            | what you give up by going lower                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| **1 · seed**     | `--primary`, `--radius`, `--font-size-base`, `--shadow-color` — the handful everything derives from. `pnpm gen:brand '#RRGGBB'` writes them for you | **almost always**                               | nothing — this is the main road                                           |
| **2 · role**     | a named semantic token: `--text-link`, `--accent`, `--card-radius`                                                                                  | when the seed is right but ONE role must differ | that role stops following the seed; a later brand change will not move it |
| **3 · scope**    | the same token under `[data-tenant]` / `.dark` / any subtree                                                                                        | multi-tenant, or one region that differs        | nothing extra, provided you set the token and not a literal               |
| **4 · instance** | a documented prop, or `style={{ "--x": … }}` on one element                                                                                         | this one element, this one time                 | it is invisible to every audit and every future theme                     |

**Why the order matters more than the count of knobs.** Every level below the first is a value that
has stopped being derived. A literal at level 4 is not "more control" — it is a pixel that has left
the system, and nothing will tell you when the brand moves past it. That is why the generator
writes three tokens and not thirty: the ones it leaves out are not missing, they are _downstream_.

**If you find yourself at level 4 twice for the same reason, the token is missing.** File it —
`docs/COMPOSITION-VS-COMPONENT.md` has the test for whether it is a token or a composition. Adding
the knob is how the system absorbs the change; repeating the literal is how it drifts.

---

## Start from one hex — `pnpm gen:brand`

Everything below this section is the manual route, and it is worth reading because it says what each
role means. But the colour half of a brand file is mechanical, and two of its decisions are ones CSS
cannot make at all, so there is a generator:

```sh
pnpm gen:brand '#2563EB' --name acme --out src/theme
```

It writes `acme.service.css` and `acme.email.ts`, and prints what it measured:

```
  light seed #2563eb  ·  dark seed #5586ef (lifted 10.4%)

  ✓ primary label on fill (light)    5.17:1  (needs 4.5:1)
  ✓ primary label on fill (dark)     6.03:1  (needs 4.5:1)
  ✓ primary fill on canvas (light)   5.09:1  (needs 3:1)
  ✓ primary fill on canvas (dark)    5.10:1  (needs 3:1)
  ✓ link ink on canvas (light)       6.73:1  (needs 4.5:1)
  ✓ link ink on canvas (dark)        6.36:1  (needs 4.5:1)
```

It exits non-zero when a ratio misses, so a brand that cannot meet AA says so at the point you
choose the colour rather than at the point a user cannot read a link.

**The two things it does that hand-authoring keeps getting wrong:**

- **A dark seed.** Nothing in CSS lifts a light seed onto the dark spine, so a brand file that sets
  `--primary` only in `:root` keeps the GoDX violet in dark mode and nothing says so. The generator
  holds your hue and saturation and moves lightness until the dark seed reads against the dark
  canvas the way the light seed reads against the light one.
- **Email.** `src/email/tokens.generated.ts` bakes literal hex at build time, because Gmail strips
  `<style>` and Outlook ignores custom properties. Those literals are _this package's_ seed, so a
  re-themed product still sends GoDX-violet mail — the one surface no amount of CSS reaches. The
  emitted `acme.email.ts` is the override that corrects it.

**What it deliberately leaves out**, because writing them would be a regression:

- `--primary-hover`, `--primary-active`, `--primary-border`, `--control-outline` — these DERIVE from
  the `--primary` in scope at the element that paints them (gh#678). A literal pins them to one seed
  and stops them following the next change.
- `--brand` / `--brand-foreground` — the identity role is independent of the action colour on
  purpose (gh#250), so the logo does not retint when a tenant changes its button colour.

The output is a starting point, not a ceiling: every role in the tables below can still be set by
hand in the generated file, and an explicit value always beats a derived default.

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

**The indicator ships ON.** `--focus-outline` is `1` (`src/tokens/foundation.css`), and every painted focus length multiplies by it, so a focus mark paints by default and the package meets WCAG 2.2 SC 2.4.7. It did ship `0` once, and that earlier default — with its stated cost, a forfeited SC 2.4.7 and JIS X 8341-3 AA claim — is recorded in `docs/DESIGN-AUTHORITY.md`; gh#544 flipped it. Nothing has to be opted into.

Switching the paint is ONE attribute on the root element, no CSS:

```html
<html data-focus-outline="on"></html>
<html data-focus-outline="off"></html>
```

(`AppProvider` has the equivalent.) Every `:focus-visible` selector is present either way; only the paint is switched.

Every ring is then drawn by a single rule (`src/styles/focus-ring.css`) reading the tokens above. Nothing else paints one; a test fails the build if a stylesheet tries.

**Thickness is `--focus-ring-weight`, never `--focus-ring-width`.** The width is DERIVED — `calc(var(--focus-ring-weight) * var(--focus-outline))` — so assigning it directly paints a ring even where the indicator is switched off, and that is exactly what the build-failing test forbids a stylesheet to do.

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

**Turning it off** — set `--focus-outline: 0` (or `data-focus-outline="off"`). Do NOT reach for `--focus-ring-width`: it is derived from the weight and the switch, and pinning it to any value is the same mistake in the other direction. Note the cost: with no visible focus indicator the package no longer meets WCAG 2.2 SC 2.4.7, so this is a claim you are giving up, not a style preference.

**Adding your own component to the system**: put `ui-focus-ring` (or `ui-focus-ring-outline` when the mark needs a gap) on the focusable element.

### What does NOT need an anchor

Density (`<PageContainer density>`) scales component sizes, not the grid. - **Pills / squared corners** use `--radius-pill` (9999px) / `--radius-sharp` (0) — full-round shapes stay round regardless of `--radius`.

---

## Selectors the package promises are YOURS

A `data-*` attribute the package never writes is a selector you can hold a stylesheet against — the one place where CSS of your own is the documented route rather than a workaround. Each of these is a promise held by a test, not an accident of the current markup:

| You write | The package promises | Why it exists |
| --- | --- | --- |
| `.ui-prose a[data-…]` | Prose writes `data-*` on its **own root only** — never on a descendant. Every `data-*` on an `a` inside it is yours, survives the render, and stays selectable (gh#717) | A renderer knows things about a link that the package cannot: in a wiki, a link whose target **does not exist yet** must read differently from one that resolves |
| `<TableRow data-expanded-row="">` | The striping counts records, not DOM rows — a row you mark is skipped in the count and wears its record's stripe | A detail row under a record is your composition, not a row of data |
| `[data-tenant]`, `[data-program]` | Every anchor token re-resolves at the scope (below) | One app, many brands |

**Style a marked link through the knob, not around it.** `--prose-link-color` is read as `hsl(var(--prose-link-color, var(--primary)))` **at the anchor**, so declaring the custom property inside your own higher-specificity selector is enough — you never have to restate the `color` declaration, and a later package change to how the ink is painted still reaches you:

```css
/* your app's stylesheet */
.ui-prose a[data-unresolved="true"] {
  --prose-link-color: var(--text-error); /* the TEXT tier — 7.25:1 light, 5.51:1 dark on a card */
  text-decoration-style: dashed;
}
```

Use `--text-error`, not `--destructive`: the fill tier is tuned for a white label on top of it and measures 2.95:1 as ink on the dark card (gh#610). The whole family is `--prose-link-color` (default `hsl(var(--primary))`, resolved at the anchor so a scoped re-tint reaches it) and `--prose-link-decoration-line` (default `underline`). Set the first on `[data-tenant]` to re-tint every wiki link at once.

There is **no prop** naming the attribute, deliberately: the attribute IS the API, the same way `data-expanded-row` and `data-axe-open` are. A prop would make the package own a name only your renderer knows, and would let exactly one state be marked.

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

Set `data-tenant` on the app root.

#### What follows `--primary`, and what you still set (gh#678)

The interaction states are **derived from the `--primary` in scope, at the element that paints them** — on `<html>` or on any nested `[data-tenant]` / `[data-program]` element, in both themes. You do not declare them:

| Token | Follows `--primary`? | Default (evaluated at the painting element) |
| --- | --- | --- |
| `--primary-hover` | **yes** — Button hover, `bg-primary-hover`, Typography action hover | `hsl(from hsl(var(--primary)) var(--primary-hover-channels))` — light `h s calc(l - 8.4)`, dark `h s calc(l + 5.8)` |
| `--primary-active` | **yes** — `bg-primary-active`, the open sidebar row's label | light `h s calc(l - 15.5)`; dark one step further up, reflected to one step down past 83.4% L |
| `--control-outline` | **yes** — the focused field's halo (`--control-outline-alpha` stays per theme) | light `h s calc(l - 5.3)`, dark `h calc(s * 0.99) calc(l - 25.1)` |
| `--primary-border` | **yes** (painted by no package surface; kept for the measurement in DESIGN-AUTHORITY) | light `h calc(s * 0.68) calc(l + 16)`, dark `h calc(s * 0.467) calc(l * 0.27043)` |
| `--sidebar-item-active-foreground` | **yes** — defaults to the live `--primary-active` | — |
| `--focus-outline-color` | **yes, through `--ring`** — every keyboard-focus outline (gh#687) | `var(--focus-ring-color, var(--ring))`, read at the focused element — so it follows the `--ring` you set in the scope |
| Radio button bar selected (`--choice-button-*`), Slider active dot, BackTop progress, `.ui-brand-glow` | **yes** (gh#687) | `var(--primary)` / `var(--primary-foreground)` at the call site |
| Topbar item / AppLauncher tile / Segmented / filled-control hover | **follow `--accent`** (gh#687) | `var(--accent)` / `var(--accent-foreground)` at the call site |
| `--primary-foreground` | **no — set it** | the label on a filled primary; you choose it for your seed |
| `--ring` | **only on the element that declares `--primary`** — set it in a nested scope | `var(--primary)` on `:root` / `.dark`. `--ring` is a public role read as `hsl(var(--ring))` in consumer CSS, so it cannot become a live default; a scope below `<html>` inherits the root's |
| `--destructive-*`, `--control-outline-error` | no — not brand | literals |

On the package seed these produce exactly the identity kit values the tier used to hard-code (`#6500d4` / `#5400b0` light, `#ecdaff` / `#cd9fff` dark). Engines without CSS relative colour (Chrome/Edge 111–118) get those literals and do **not** follow a consumer seed.

**Rules that come with it:**

- **No token tier binds to a scoped role at `:root`.** Every knob whose default is `--primary`, `--primary-foreground`, `--ring`, `--accent` or `--accent-foreground` is `initial`, with the role as the call-site fallback — `--ring` itself is the one exception (above). `tenant-scope-freeze-687.test.ts` holds it.
- **Override a state only by setting its knob** (`--primary-hover: 221 90% 72%`). A set knob wins over the derived default, in its own scope and below.
- **Read a state through its fallback, not bare.** The four knobs are `initial` so that the default can resolve at the painting element (docs/TOKENS.md, the freeze rule). `hsl(var(--primary-hover))` on its own therefore paints nothing — use the utility (`bg-primary-hover`) or `hsl(var(--primary-hover, from hsl(var(--primary)) var(--primary-hover-channels)))`.
- **Label polarity.** The theme's pair steps AWAY from that theme's default label: `darken` under a light label, `lighten` under a dark one, which keeps a label that clears 4.5:1 at rest at 4.5:1 in hover and pressed for every seed (measured, `derived-seed-sweep.test.ts`). If your seed needs the OTHER polarity of label (a pale yellow with dark text in the light theme), point the pair at it too — `applyPrimaryColor()` does this automatically from the label it picks:

```css
[data-tenant="sunny"] {
  --primary: 48 100% 60%;
  --primary-foreground: 48 9% 9%;
  --primary-hover-channels: var(--primary-hover-lighten-channels);
  --primary-active-channels: var(--primary-active-lighten-channels);
}
```

- **The open sidebar row** is legible (≥ 4.5:1 on the 12% tint) for any seed that is itself legible as text on the page. A seed that is not (a pale seed on the light page, a very dark one on the dark page) needs `--sidebar-item-active-foreground` set.

Two more CSS-inheritance caveats for the **scoped** case (a single `:root` brand theme is unaffected — there, overriding just `--radius` / `--shadow-color` cascades):

- **Radius & shadow-tint don't cascade from a scoped anchor.** `--radius-{xs…2xl}`, `--card-radius`, `--control-radius` and the `--shadow-{xs…2xl}` ramp are computed at their declaring element, so a scoped `--radius` / `--shadow-color` override won't reach them. For a scoped re-theme, re-declare the derived tokens you need (e.g. `--card-radius: var(--radius)`, or set `--card-shadow` to a literal value).
````
