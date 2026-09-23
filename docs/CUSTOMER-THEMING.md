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

---

## A CUSTOMER's colour, at runtime — `tenantTheme()` (gh#861, gh#868)

Everything above is a colour **you** author, in a stylesheet. This section is the other case: a hex
your customer picked in a settings screen, which reaches the page as data and must paint one region
of it — an app launcher, a partner portal, a tenant switcher showing two tenants at once.

There is no `<TenantTheme>` component, and `docs/COMPOSITION-VS-COMPONENT.md` §3.2 records why (it
fails C3, C4 and C6: a `<div>` with a `style`, a screen-shaped API, and no text or role for the
international contract to apply to). What ships instead is the part two consumer repos each
hand-rolled — the arithmetic:

```tsx
import { tenantTheme } from "@godxjp/ui/app";

const brand = tenantTheme(tenant.primary_color); // "#0071bd", 3- or 6-digit

<div data-tenant={tenant.slug} style={brand.vars}>
  <Topbar … />
</div>;
```

`brand.vars` is exactly five declarations, and each one is there for a stated reason:

| declaration            | why                                                                                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--primary`            | the seed, as an `H S% L%` triplet — `hexToHsl()` is the same conversion, exported separately                                                                                        |
| `--primary-foreground` | **does not follow the seed** (see the table above): the label is chosen by contrast, here                                                                                           |
| `--ring`               | `derived.css` binds `--ring: var(--primary)` at `:root`, where a `var()` substitutes ONCE — a scope below `<html>` inherits the root's ring unless it restates it (the freeze rule) |
| `--primary-hover`      | a LITERAL, not `initial` — see "no silent half-application" below                                                                                                                   |
| `--primary-active`     | the same                                                                                                                                                                            |

It never throws and never returns null. An unusable hex yields **empty `vars`**, so the region
falls back to the app's own theme instead of breaking the page — the same contract `ColorPicker`
already has.

### The contrast rule, stated

**WCAG 2.2 SC 1.4.3 Contrast (Minimum), normal text, 4.5:1.** Relative luminance is WCAG's own
definition (`c′ = c ≤ 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4`, then
`L = 0.2126·R′ + 0.7152·G′ + 0.0722·B′`), and the ratio is `(L_lighter + 0.05) / (L_darker + 0.05)`.

The label is whichever of `#ffffff` / `#000000` scores higher, i.e. the pivot at **L = 0.179**. That
is not "usually fine": at the pivot BOTH candidates measure 4.58:1, and away from it the winner only
rises — so the chosen label clears AA for **every** sRGB seed, by construction. The claim is swept
over the whole cube in `src/app/__tests__/tenant-theme.test.ts`; the worst seed in it measures
4.58:1.

Measured, for the two shapes where a naive rule fails:

| customer hex | label chosen | ratio   | what "always white" would have given |
| ------------ | ------------ | ------- | ------------------------------------ |
| `#0071bd`    | `#ffffff`    | 5.13:1  | 5.13:1                               |
| `#7a00ff`    | `#ffffff`    | 6.42:1  | 6.42:1                               |
| `#FFD400`    | `#000000`    | 14.67:1 | **1.29:1**                           |
| `#0A1F44`    | `#ffffff`    | 16.25:1 | 16.25:1                              |
| `#E30613`    | `#ffffff`    | 4.88:1  | 4.88:1                               |
| `#00A86B`    | `#000000`    | 6.81:1  | **2.34:1**                           |
| `#767676`    | `#000000`    | 4.62:1  | 4.54:1                               |

**If you already computed the pair server-side, pass it and it is used as given** — it is not
silently second-guessed — but the result reports what it actually achieves, and a dev build warns
under 4.5:1:

```ts
const brand = tenantTheme(hex, { foreground: tenant.theme_tokens.foreground });
if (!brand.meetsAA) {
  // brand.contrast is the number. The API SAYS no rather than quietly returning white.
}
```

`contrastRatio(a, b)` and `relativeLuminance(hex)` are exported for the same reason: so the
arithmetic can be checked rather than trusted.

### No silent half-application

The derived family (`--primary-hover` & co.) resolves at the painting element with CSS relative
colour. An engine without it (Chrome/Edge 111–118) gets the `:root` literals of the PACKAGE seed
instead — so a tenant colour set as a bare `--primary` applies at REST and not on HOVER, with no
error and no warning. That is the shape a consumer repo was guarding by hand with
`CSS.supports("color", "hsl(from red h s l)")`, and it is worse than not applying at all.

`tenantTheme` therefore computes the two steps in JS, from the same channel formulas, and emits
them as literal triplets on the same element that carries the seed. **No feature detection, every
engine, both states.** It is not a return to the gh#648 defect, because that was a literal on
`:root` — ABOVE every scope that re-seeds. These are written by the same call that writes
`--primary`, so a nested region that re-seeds re-emits its own pair and nothing freezes.
`src/app/__tests__/tenant-theme.test.ts` holds the literals EQUAL to the CSS formula, evaluated the
way the browser would, over a sweep of seeds and both label polarities.

`--primary-border` and `--control-outline` are left to derive: their channels are per-THEME rather
than per-label, so JS cannot compute them without being told the theme, and they are a hairline and
an 11%-alpha halo rather than a state a reader tracks.

### What it deliberately does NOT retint

`--text-link` / `--text-brand` / `--text-primary` are brand INK on the page surface. Their
legibility depends on `--background`, which a customer's fill colour does not control, and their
step direction is per-theme. A pale seed such as `#FFD400` derives a link at about **1.4:1** on a
white page. `tenantTheme` leaves those three alone; if you want brand links, set them yourself
after measuring with `contrastRatio()`.

Worked screen: `docs/showcase/tenant-brand-color.tsx` (`/showcase/tenant-brand-color`) — scope
proof inside vs outside, the contrast table above, and three run cases (an invalid hex, a
server-supplied pair below AA, and the brand-ink boundary).

### A scoped theme needs `ThemeScope` to reach the overlays (gh#877)

Every overlay in this library portals to `document.body`, so custom-property inheritance stops at
the portal boundary: a themed region themes its own subtree and **nothing it opens**. Measured with
the trigger inside the scope, the region read `--primary 204 100% 37%` and the Dialog it opened read
`268.7 100% 50%`, the package default — the button right, the panel it opens wrong.

Wrap the region in `ThemeScope` (`@godxjp/ui/app`) and the Dialog, Select listbox, Popover,
DropdownMenu, Tooltip, Sheet and Toast all follow it:

```tsx
<ThemeScope data-tenant={tenant.slug} style={tenantTheme(tenant.primary_color).vars}>
  {region}
</ThemeScope>
```

It reads the COMPUTED tokens at its own element, so it does not care whether the theme came from
`tenantTheme(...).vars`, from `className="dark"`, or from a `[data-tenant]` rule in your own
stylesheet — the path this page recommends. `docs/providers/theme-scope.tsx`
(`/isolate/providers-theme-scope`) is the worked screen.

### `applyPrimaryColor` vs `tenantTheme`

Both land on the same arithmetic. Use `tenantTheme` when you are painting a region declaratively —
no effect, no unmount restore, no SSR flash. Use `applyPrimaryColor(el, hex)` when you are
RE-SEEDING a tree that is already themed (a project switcher, a service theme): it additionally
resets `--primary-border` / `--control-outline` / the brand ink roles to `initial`, so a literal an
ancestor pinned for the previous brand cannot outrank the new seed, and it returns a cleanup.

---

## Building a COMPLEX theme — the eight things that cost the most

Everything above changes a **colour**. This section is for a theme that changes the **material** of
every surface — glass, a dark console, a high-contrast skin, anything where the page is no longer
"the default with a different hue".

It was written by building one (`docs/themes/glassmorphism.css`, `/showcase/glassmorphism`) from the
public token API and nothing else, as a deliberate stress test. It worked. But every failure along
the way was one a consumer would hit with no way to know, and the expensive ones **fail silently**:
nothing errors, nothing warns, and the surface simply keeps the colour it had. Where the cause is a
gap on our side rather than a rule you should have guessed, the section says so.

Do them in this order. Each one makes the next one decidable:

| #   | decide                                                                 | why it is first                                               |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | which **value form** each knob takes                                   | a knob set in the wrong form paints nothing, and says nothing |
| 2   | the **polarity** of every surface — light panes or dark                | it determines the ink ramp, and one ramp cannot serve both    |
| 3   | `--background`, the canvas under the whole shell                       | four visible defects at once if you skip it                   |
| 4   | the **ink ramp**, measured against the worst ground                    |                                                               |
| 5   | the **resting** fill of every surface                                  |                                                               |
| 6   | the **interaction states** — 95 tokens, and resting is not one of them | what you ship broken                                          |
| 7   | the **overlay opacity tiers** — a dialog is not a card                 |                                                               |
| 8   | your own `@supports` / `prefers-reduced-transparency` fallbacks        | the library cannot write them for you                         |

Then measure. On composited pixels, never declared colours.

### 1 · There are TWO token value forms, and the name does not tell you which

```css
HSL COMPONENTS    --card: 60 33% 99%          read at the call site as  hsl(var(--card))
COMPLETE COLOUR   --card-tint: hsl(var(--primary) / 4%)   read as  var(--card-tint)
```

A components token holds three (or four) bare numbers with no function around them. A complete
token holds a finished CSS colour — `hsl(…)`, `rgb(…)`, `oklch(…)`, `#hex`, `color-mix(…)`.

**The name is not a signal, and neither is the tier.** Five knobs that all paint the hover or
active fill of a navigable row, all defaulting to the same `--accent` role, in three components:

| knob                                | the declaration that reads it                                                                                   | form                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------- |
| `--menu-item-hover-background`      | `src/styles/navigation-layout.css:828` — `background: var(--menu-item-hover-background, hsl(var(--accent)))`    | **complete colour** |
| `--tree-node-hover-background`      | `src/styles/data-display-layout.css:2525` — `background: var(--tree-node-hover-background, hsl(var(--accent)))` | **complete colour** |
| `--table-row-hover-background`      | `src/styles/table-layout.css:591` — `var(--table-row-hover-background, hsl(var(--accent) / 0.7))`               | **complete colour** |
| `--segmented-item-hover-background` | `src/styles/control.css:1559` — `background: hsl(var(--segmented-item-hover-background, var(--accent)))`        | **HSL components**  |
| `--topbar-item-hover-background`    | `src/styles/shell-layout.css:2852` — `background: hsl(var(--topbar-item-hover-background, var(--accent)))`      | **HSL components**  |

And the two halves of the same `.ui-card` rule disagree with each other:
`--card-background` is components (`src/styles/card-layout.css:62`, `hsl(var(--card-background,
var(--card)))`) while `--card-tint` three lines above it is a complete colour.

**How to tell, today: read the call site.** The knob's own declaration in
`dist/tokens/**` is `initial` and tells you nothing; the read site tells you everything.

```sh
# in your app, after installing the package
grep -rho 'hsl(var(--tabs-list-background\|var(--tabs-list-background' node_modules/@godxjp/ui/dist
#   var(--tabs-list-background              → COMPLETE COLOUR
#   hsl(var(--tabs-list-background          → HSL COMPONENTS
```

Grep `dist` whole, not `dist/styles` — a few knobs are read from a component's JS
(`--toast-background` is read in `sonner.tsx` as `var(--toast-background, hsl(var(--popover)))`,
because sonner renders the toast body itself).

Measured on this repo's sources: **346 published tokens hold a colour. 96 take HSL components, 249
take a complete colour, 1 (`--brand-foreground`) is published for your CSS and read by none of
ours.** There is no rule that predicts the split. The older semantic roles — `--primary`,
`--background`, `--foreground`, `--card`, `--muted`, `--accent`, `--border`, `--input`, `--ring`,
the `--text-*` ramp, the four status pairs — are components. Most component-tier knobs added since
are complete colours. "Most" is not a rule you can theme against.

#### The failure is silent, and it does NOT fall back

Set a knob in the wrong form and the substituted declaration is **invalid at computed-value time**.
The property takes **its own initial value** — and _not_ the call-site fallback, which is the part
that makes this read like a knob that does not work. Measured in Chromium, both forms, both
mistakes:

| the call site                | what you set     | computed `background-color`       |
| ---------------------------- | ---------------- | --------------------------------- |
| `var(--k, hsl(120 50% 50%))` | nothing          | `rgb(64, 191, 64)` — the fallback |
| `var(--k, hsl(120 50% 50%))` | `rgb(255 0 0)` ✓ | `rgb(255, 0, 0)`                  |
| `var(--k, hsl(120 50% 50%))` | `0 100% 50%` ✗   | **`rgba(0, 0, 0, 0)`**            |
| `hsl(var(--k, 120 50% 50%))` | nothing          | `rgb(64, 191, 64)` — the fallback |
| `hsl(var(--k, 120 50% 50%))` | `0 100% 50%` ✓   | `rgb(255, 0, 0)`                  |
| `hsl(var(--k, 120 50% 50%))` | `rgb(255 0 0)` ✗ | **`rgba(0, 0, 0, 0)`**            |

A transparent background shows whatever is painted behind it, so the surface looks like it kept its
old colour. A table header set in the wrong form measured **1.03:1** against light ink — because it
was showing the card beneath it, not the fill that was written for it.

**The tell, when you are debugging:** in DevTools the custom property is set to exactly what you
wrote, and the painted property is `rgba(0, 0, 0, 0)`. If both of those are true, it is the form.

#### The sub-trap: an alpha baked into a components role

A components role may legally carry an alpha — `--card: 0 0% 100% / 42%` is how a glass theme makes
every card translucent in one line, and it works. But **83 declarations across 15 roles read a role
and apply their own alpha** (`hsl(var(--accent) / 0.7)`, `hsl(var(--primary) / 0.12)`, …). A role
that already carries one produces a second `/` in those, which is a parse error. Measured:

| `--role`          | read as `hsl(var(--role))`  | read as `hsl(var(--role) / 0.9)` |
| ----------------- | --------------------------- | -------------------------------- |
| `0 0% 100%`       | `rgb(255, 255, 255)`        | `rgba(255, 255, 255, 0.9)`       |
| `0 0% 100% / 42%` | `rgba(255, 255, 255, 0.42)` | **`rgba(0, 0, 0, 0)`**           |

The 15 roles with at least one such reader, worst first: `--primary` (18 sites), `--muted` (15),
`--destructive` (8), `--warning` (6), `--success` (5), `--info` (5), `--accent` (5), `--foreground`
(5), `--muted-foreground` (4), `--table-row-tone-color` (4), `--background` (3),
`--destructive-foreground` (2), `--secondary` (1), `--accent-foreground` (1), `--ring` (1).
`--card` and `--popover` have none, which is exactly why baking an alpha into those two is the
glass theme's main move.

#### This is our defect, not your oversight

`get_tokens`, `agent/tokens.json` and `mcp/src/data/component-tokens.generated.ts` all report a
knob as `value: "initial"` plus prose. **3 of the 346 colour tokens say which value form they
take** (`--background`, `--focus-ring-color`, `--rating-star-filled-color`, each by accident of
someone writing it into a source comment). `scripts/explain-token.mjs` prints every read site of a
token but not the text of the read, and it is not in the package's `files` list, so a consumer does
not have it. Until the catalog carries the form as a field, the grep above is the answer, and it
should not have to be. Cardinal rule **48** states the rule; the gap is what the rule is for.

### 2 · Ninety-five interaction-state tokens exist, and resting state is not one of them

```sh
node -e "const t=require('./node_modules/@godxjp/ui/agent/tokens.json'); \
  console.log(t.filter(x => /-(hover|active|selected|checked|pressed|focus)(-|\$)/.test(x.name)).length)"
# 95
```

**95** published tokens paint only in a non-resting state; **62** of them paint a colour, an edge or
an elevation. The glass theme, after three rounds of fixes, sets **5**. Every defect reported off a
screenshot during that build was one of the missing 90:

- a sidebar row at `[data-active="true"]` reading dark violet on a violet tint —
  `--sidebar-item-active-foreground` defaults to the live `--primary-active`
  (`src/styles/shell-layout.css:2289-2291`), which is legible against the page only for a seed that is
  itself legible as text on the page. A dark seed on a dark theme is not. The same caveat is in
  "What follows `--primary`" above; it bites hardest in a re-materialised theme.
- a Segmented item with a dark hover fill under dark hover text — `--segmented-item-hover-background`
  and `--segmented-item-hover-color` are separate knobs and the first was set alone.
- a Topbar hover block — `--topbar-item-hover-background`, same shape.

**`--focus-ring-color` is on that list, and it is the worst one to get wrong.** Every ring in the
package is painted by one rule (`src/styles/focus-ring.css:116-119`):

```css
outline: var(--focus-ring-width) solid
  hsl(
    var(--focus-outline-color, var(--focus-ring-color, var(--ring))) / var(--focus-ring-opacity, 1)
  );
```

So it is **HSL components** — and it is read with an alpha applied, which means both mistakes from
§1 delete the focus indicator outright rather than mistinting it: write `hsl(...)` into it, or bake
an alpha into it, and the whole `outline` declaration is invalid at computed-value time. Unset it
follows `--ring`, which is the package's, not your theme's. A ring tuned for a light page is a WCAG
2.2 SC 1.4.11 defect on a dark one (3:1 against **every** surface a control sits on) and an SC 2.4.7
failure if it vanishes. See the focus-ring section above for the switch, the weight and the
per-component knobs.

**The method:** for each component your theme re-materialises, list its tokens
(`get_component`, or `grep -r -- '--<component>-' node_modules/@godxjp/ui/dist/tokens/components/`)
and
set the hover / active / selected / checked row **at the same time as the resting one**. A state
knob left at its default resolves against the _live role_ at the painting element — which is the
right default and exactly why it can be wrong for you: your `--accent` is now a dark violet, and the
item's ink still assumes the package's pale one.

### 3 · One ink ramp only works if every surface shares a POLARITY

`docs/GLASSMORPHISM-STANDARD.md` §3 says "one ink ramp for the whole theme". That is right and
incomplete, and measuring found where: **a single ramp only serves surfaces of the same polarity.**

Light panes take dark ink. A toned tint over a **dark** page is a dark pane and takes light ink. The
glass theme had one dark ramp serving both; the Cards were fine and the Alert measured **1.27:1 and
1.35:1** — not a contrast bug in the ink but a polarity bug, two surfaces of opposite value asking
one ramp to serve both.

**So decide polarity first, then derive one ramp per polarity.** If you want a single ramp — and you
should, because it is the only way "muted" stays consistent — then every surface has to be the same
polarity, which for a tinted status pane means making it a **light pane tinted by hue** rather than a
dark pane darkened by it. The four knobs for that are
`--surface-success` / `--surface-warning` / `--surface-info` / `--surface-destructive`
(`src/tokens/foundation.css:235-238`): independently chosen grounds for the four status tones, so
the ground stops being derived from the ink through an alpha. They are **finished colours**, and
`foundation.css:217` says so in as many words — "FINISHED COLOURS, NOT HSL COMPONENTS — the one
place this tier differs from the three above". See §1.

And on any re-materialised surface, `muted` cannot mean lower contrast. Hierarchy is carried by
size and weight at the **same** ratio — body at 7:1 so it keeps a margin when the ground shifts
under it, secondary just inside 4.5:1.

### 4 · `--background` is the canvas under the whole shell

`--gradient-glow` paints on the shell's **main region only** — `.app-main`
(`src/styles/shell-layout.css:412`), and the two other shells' equivalents,
`.ui-centered-shell-main` (`:897`) and `.ui-mobile-shell-main` (`:3384`). Sidebar and Topbar are
`.app-main`'s **siblings** in the same CSS grid (`grid-area: sidebar` at `:217`, `grid-area:
topbar` at `:384`), so none of the gradient is behind them. What is behind them is
`.app-root { background: hsl(var(--background)) }` (`:28`) — and `body`
(`src/styles/base.css:260`) under that.

A theme that sets `--foreground` to near-white and never sets its pair therefore gets **light chrome
carrying near-white labels**. In the glass build, one missing line was four reported defects: a pink
Sidebar, a Topbar running pink on the left and blue on the right, an unreadable near-white table
header strip, and a washed-out dropdown. The fix was `--background` plus the family that derives
from the same canvas decision — `--muted`, `--accent`, `--secondary`, `--input` and their
`-foreground` pairs.

**`--foreground` and `--background` are one decision — never set only one of them.** The canvas
family, in full:

```css
--background   --foreground
--card         --card-foreground
--popover      --popover-foreground
--muted        --muted-foreground
--accent       --accent-foreground
--secondary    --secondary-foreground
--border       --input       --ring
```

### 5 · A scoped theme cannot re-ink its own text

`src/styles/base.css:261` sets `color: hsl(var(--foreground))` on `body`. `body` is above every
scope you can make, so that `var()` substitutes against the **root's** `--foreground` exactly once
and every element below inherits the already-resolved colour. A plain `<div>` that sets your theme's
tokens therefore retints every **surface** and no **text**. Measured on the showcase before it was
fixed: the title's own computed `--foreground` was the theme's near-white while its `color` stayed
`rgb(36, 35, 30)` — real-pixel contrast **1.34:1**, every element in the subtree reporting that it
was inside the scope. It is the `:root` freeze rule (`docs/TOKEN-RESOLUTION.md` §3) applied to a
_property_ instead of a token, and worse there: a token can be given a knob, and `color` on `body`
has none to give.

Two remedies, and they are not interchangeable:

- **React** — wrap the region in `ThemeScope` (`@godxjp/ui/app`). It re-states
  `color: "hsl(var(--foreground))"` on its own element (`src/lib/overlay-portal.tsx:270`, with
  `display: contents` so it removes the box and not the inheritance) **and** on the `body`-level
  host it creates for portalled overlays (`:203`) — which is the other half of the problem, because
  a Dialog portals to `document.body` and would otherwise wear the root's theme. `...style` is
  spread after, so your own `color` still wins.
- **A stylesheet-only scope** — state it yourself, on your own element:

  ```css
  [data-theme="glass"] {
    --foreground: 48 20% 96%;
    --background: 230 40% 9%;
    /* … */
    color: hsl(var(--foreground)); /* NOT optional */
  }
  ```

  That is a declaration on _your_ element, not a selector into this package, so it does not breach
  "a consumer sets tokens, never selectors" (`docs/TOKEN-RESOLUTION.md` §5 rule 5). It does **not**
  reach portalled overlays; for those you still need `ThemeScope` or a scope on the portal
  container. `docs/TOKEN-RESOLUTION.md` §5 rule 7 is the short form; gh#881 is the incident.

### 6 · A theme owns its own transparency fallbacks

If your theme makes a surface translucent, **your theme** writes its
`@media (prefers-reduced-transparency: reduce)` and
`@supports not (backdrop-filter: blur(1px))` branches. The library does not, and cannot: it does
not know what opaque colour you want, and guessing at the role's own value is not safe — a theme
whose `--card` is `0 0% 100% / 42%` would get a "fallback" that is still 42% translucent.

We shipped a generic fallback for a while and it was **actively wrong**: under `reduce` it left a
Card translucent and painted the Topbar fully transparent — invisible. It is removed.
`docs/TOKEN-RESOLUTION.md` §5 rule 6 is the standing rule. Keep both branches to
custom-property declarations on your theme's own selector, and repaint exactly the surfaces you
made translucent; leave borders alone.

`prefers-reduced-transparency` is an OS accessibility setting. Honouring it is not optional.

### 7 · Overlays are not cards

A dialog or a drawer at a card's alpha is read straight through, and both were, at 20%. A card sits
on a ground you chose; an overlay sits over **arbitrary** content, and the smaller it is the less
the reader can use context to recover a word. So every overlay belongs at the opaque end of the
range and the card belongs at the translucent end — the gap is much bigger than it looks when you
are picking numbers in a token file.

Where the glass theme landed, after the first pass at 20% was reported unreadable:

| surface                           | fill                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| drawer (`Sheet`)                  | **92%** — covers content that must stay unreadable-but-present                     |
| `Toast`                           | **90%**                                                                            |
| dialog panel                      | **88%**, over `--dialog-overlay-alpha: 62%` — a scrim that both darkens and blurs  |
| `DropdownMenu` / `Select` listbox | **88%**                                                                            |
| `Card`                            | **12%** — the recipe's own number, and the one that makes the backdrop the palette |

Two mechanics worth knowing before you tune those numbers:

- **A modal's blur belongs on the SCRIM, not the panel.** `backdrop-filter` filters what is behind
  the element, and the scrim is the layer that covers the page. It also makes the element the
  containing block for its `position: fixed` descendants, which is why every blur knob in this
  package is `initial` rather than `blur(0px)` — unset, the whole declaration is invalid at
  computed-value time, `backdrop-filter` keeps its own `none`, and no backdrop root is created.
  `--dialog-overlay-backdrop-blur-size` and `--sheet-overlay-backdrop-blur-size` are the scrim
  knobs; there is deliberately no knob for a blur on the panel itself.
- **Do not double-blur.** A dropdown inside an already-blurred panel blurs a blurred copy and reads
  as dirty glass. Blur the few surfaces that define depth — chrome and overlays — not every card,
  row and chip. It is also GPU-expensive.

`docs/GLASSMORPHISM-STANDARD.md` §4 has the reasoning per surface, and §4b covers form fields, which
are the hardest case in the system: a field has to read as _a place you can type_ before it reads as
anything else, and translucency destroys exactly the two signals that say so.

### 8 · Measure the COMPOSITED pixel, against the worst region

A translucent fill over a gradient is not the colour you declared, and `getComputedStyle` cannot
tell you what it became — it reports the element's own `background-color` with its own alpha, not
the stack. **Screenshot the rendered page, sample the pixel under the text, compute the ratio.**

Two more rules that come from getting this wrong four times in one session:

- **Sample the worst region the backdrop can produce**, not a convenient one. A radial gradient has
  a light lobe and a dark one and the pane must be legible over both. The glass build's worst ground
  sampled `rgb(172, 159, 172)`; against it the stock `--muted-foreground` `rgb(104, 102, 94)`
  measures **2.28:1**, and solving from that number rather than guessing gave the ramp: `L ≤ 22.5%`
  for 4.5:1, `L ≤ 9.5%` for 7:1.
- **Sanity-check the instrument before you believe it.** Two signatures of a broken measurement,
  both seen: a ratio that is _identical_ for several visibly different colours (the script failed to
  resolve a custom property and scored the same fallback every time), and a ratio that contradicts
  what you can see (`1.03:1` on a surface that looks fine — or the reverse). **When a fix does not
  hold, suspect the diagnosis before re-applying the cure.** A custom property read with
  `getPropertyValue()` comes back as `initial`, as an unresolved `var()` chain, or as three bare
  numbers that are not a colour at all; a parser that accepts all three without complaint will
  report a number for every one of them.

### What to read next

- `docs/TOKEN-RESOLUTION.md` — §3 the freeze rule (why a knob is `initial` and its default lives at
  the call site), §5 the seven rules for anyone setting or adding a token.
- `docs/GLASSMORPHISM-STANDARD.md` — the worked case: the four signals of the style, the contrast
  rules, overlays, and why form fields are the hardest surface.
- `docs/THEME-API-COVERAGE.md` — how far the token API reaches today, per component, with the
  hard-coded declarations listed. Read it before you conclude a knob is missing.

---

## Artwork & third-party marks — where the token rule ends (gh#867)

Every section above assumes the colour arrives as CSS on an element this library renders. Artwork
is the case the rule does not state: **an SVG loaded through `<img src>` runs inside its own
document boundary and cannot see the page's custom properties.** No token reaches it, scoped or
otherwise — that is a browser fact, not a library omission, and no component API can change it. So
"brand colour enters only through scoped tokens" has one silent exception: artwork that arrives as
a file. Four techniques, and the boundary between them:

| the asset                                                   | the technique                                                    |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| a multi-colour brand mark                                   | **1 · two masters** — ship both variants, switch by scheme       |
| a single-colour glyph that should follow the text beside it | **2 · inline + `currentColor`**                                  |
| a single-colour glyph that should sit at a token colour     | **3 · `mask-image`** — shape from the asset, colour from a token |
| everything else — screenshots, illustrations, uploads       | **4 · do not recolour**                                          |

### 1 · Two masters, switched by colour scheme

What this library does for its own mark, and the right answer for any multi-colour brand: both
masters ship, and CSS shows one per scheme. `src/components/general/logo.tsx` renders the light
and dark artworks as siblings, and `src/styles/logo-layout.css` picks between them — an explicit
light choice, an explicit dark choice, and the un-stamped default where only the OS preference
separates them. The brand guidelines quoted in the component's comment (brand identity v2.3)
forbid all three shortcuts: no re-tinting the master to a module's colour, no inverting it with a
filter, and the correct sáng/tối variant rendered as-is.

Two properties of that implementation matter if you copy it:

- **The masters are different files and stay different files.** They arrive as separate assets in
  the brand kit and land verbatim in `src/brand/godx-artwork.generated.ts` — not one artwork whose
  token values get swapped per theme. `grep -c currentColor src/brand/` → `0`: the package's own
  brand artwork carries no token hooks at all. This technique involves no tokens on purpose.
- **Inlining is for fidelity and document validity, not tokenisation.** The markup is inlined
  (`dangerouslySetInnerHTML`) because 8 gradients, a clipPath and 10 paths must stay byte-exact,
  and because SVG ids are unique per document — two `<Logo>`s on one page would otherwise emit
  duplicate ids. Both comments in `logo.tsx` state this explicitly and claim no theming benefit.

The colours of a multi-colour mark ARE the brand; they do not follow `--primary` — which is exactly
why the generator keeps `--brand` / `--brand-foreground` independent of the action colour (gh#250).

### 2 · Inline the SVG and use `currentColor` — the single-colour glyph

For a single-colour glyph that should follow the text it sits beside. Inline the file and paint
the path with `currentColor`:

```css
/* your app's stylesheet — a role, not a literal, so scopes and dark mode reach it */
.ui-mark {
  color: hsl(var(--primary)); /* or --text-link, or whatever text role it accompanies */
}
```

```tsx
<svg className="ui-mark" viewBox="…" aria-hidden="true">
  <path fill="currentColor" d="…" />
</svg>
```

The glyph now follows `color` like any text: a `[data-tenant]` scope, a link's `--text-link`, dark
mode — anything that sets `color` above it re-tints the glyph with it. It is one colour by
construction; if the glyph needs two, this is the wrong technique — go back to 1.

### 3 · `mask-image` — shape from the asset, colour from a token

When the asset should sit at a token colour regardless of the text around it, take the shape from
the file and the colour from CSS:

```css
.ui-partner-mark {
  width: 1.25em;
  height: 1.25em;
  background: hsl(var(--primary)); /* the token does the colouring */
  mask-image: url("./partner-mark.svg"); /* the asset's transparency supplies the shape */
  mask-size: contain;
  mask-repeat: no-repeat;
}
```

The mask reads the asset's alpha as the shape; `background` supplies the only colour, so a token
change, a `[data-tenant]` scope and dark mode all reach it — the colour is ordinary CSS. It is
single-colour by construction: a mask has no way to carry a second colour.

Stated honestly, this library uses CSS masking in exactly **two** places — the Marquee's edge fade
(`src/styles/motion.css`) and the FloatButton (`src/styles/float-button-layout.css`). This is a
technique documented here, not a house pattern; reach for it for one-colour glyphs, not as the
default answer to "how do I theme an image".

### 4 · Do not recolour

`Thumbnail` (`src/components/data-display/thumbnail.tsx`) is a framed `<img>`, and `src` artwork
keeps its authored colours in every theme — it always has. Screenshots, illustrations, photos,
uploaded logos: they render exactly as authored, and that is the answer, not a gap and not a
roadmap item. If the artwork must read on both schemes, choose or commission artwork that does;
the frame and the surface around it are yours to theme — the pixels inside them are not.

### The caveat that is not a footnote

Techniques 1–3 inline SVG, and inlined SVG is markup in your document. An upload that lands as
markup is an XSS surface — `<script>`, event attributes, `javascript:` hrefs all execute. The
boundary `logo.tsx` states in its own comment — _"package-owned generated content, never user
input"_ — is the whole rule: **inlining is for artwork you generate**, at build time, from your
own kit. Anything a customer uploads either passes a real sanitiser before it is inlined, or goes
through `<img>` and stays unthemed — which is technique 4, and a legitimate outcome.
