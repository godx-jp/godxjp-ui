# Glassmorphism — the standard, and what this library must support

Written because the first attempt (`docs/themes/glassmorphism.css`, `/showcase/glassmorphism`)
produced grey-purple slabs on a muddy backdrop with 2.2:1 text, and the owner's verdict was
correct: _"màu không tương phản, màu trông rất ghê"_. This page is the target to build against,
not a description of what we shipped.

Sources are listed at the bottom. Nothing here is invented.

---

## 1. The recipe — namethatui.com, verbatim

```css
background: rgba(255, 255, 255, 0.12);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.25);
border-radius: 16px;
```

Fallback where `backdrop-filter` is unsupported: `background: rgba(30, 30, 40, 0.85)`.

**Four defining signals**, and a surface that drops any one of them is not glass:

1. **Frosted translucent panels** — semi-transparent with a strong background blur; content behind is visible but softened.
2. **A vivid backdrop showing through** — a gradient, photo or aurora behind the glass, _"its color bleeds through every panel and IS most of the palette."_
3. **A thin light edge** — 1px semi-transparent white, often brighter on top, catching the rim and separating glass from glass.
4. **Layered floating depth** — panels float above the backdrop and above each other with soft wide shadows; the stack of sheets is part of the look.

### The number I got wrong, and it is the whole problem

**`0.12`.** The first build used **42–55% white**. At that opacity no backdrop colour bleeds through, so signal 2 is gone — and signal 2 is the one that says the palette comes from the backdrop. That is exactly why every pane came out the same grey no matter what else was tuned.

Going to `0.12` makes the contrast problem _harder_, not easier, which leads to the correction below.

### Glassmorphism is not Liquid Glass

Glassmorphism applies the frosted treatment as a **decorative skin to any surface** — content cards, dashboards, panels, buttons, inputs. Apple's Liquid Glass reserves glass for the **control layer only** (bars, buttons, navigation) floating above opaque app content, with an adaptive material that lenses and retints.

The practical consequence here: **buttons and form fields are in scope.** A solid-purple primary button and an opaque white outline button on a glass page are the Liquid-Glass split applied backwards — the content is glass and the controls are not.

## 2. The backdrop is part of the component

Glass is invisible on a flat colour. It needs something worth blurring: a photograph, or two or
three **saturated** colour blobs with room between them. A single dark-purple linear gradient —
what the first attempt used — gives the blur nothing to work with, which is why every pane came out
the same grey.

**Test for it:** if you replace the backdrop with a solid colour and the panes look the same, the
glass is doing nothing.

## 3. Contrast — the rule that outranks the aesthetic

WCAG 2.2: **4.5:1 for body text**, **3:1 for large text and UI components**. Transparency and blur
both _reduce_ contrast, so on glass this is where the design fails first — and it is a requirement,
not a preference.

Concretely, for this library:

- **One ink ramp for the whole theme.** Every text token on glass resolves to the same
  high-contrast family — near-white on dark glass, near-black on light glass. The owner's second
  note, _"màu sắc chữ phải tương phản và đồng bộ"_, is this: a card that uses three different
  greys for title, body and caption will have one that passes and two that fail.
- **The remedy is a SCRIM, not darker ink.** The source is explicit: _"measure text contrast against the worst backdrop region or add a translucent contrast scrim."_ My first fix darkened the ink ramp instead, which worked at 42% fill and will not survive `0.12` — at that opacity the text sits on whatever the backdrop is doing underneath, and a gradient has no single answer. A scrim behind the text block is the move that holds across the whole backdrop.
- **Measure against the WORST region the backdrop can produce**, not a convenient sample. A radial gradient has a light lobe and a dark one; the panel must be legible over both.
- **Muted/secondary text is the first casualty.** Our measurement: title 6.19:1 passed while five
  secondary strings on the same card measured **2.19–3.05:1**. On glass, "muted" cannot mean
  "lower contrast" — it must mean _smaller_ or _lighter weight_, at the same ratio.
- **Status colours do not survive translucency.** Success/warning/error ink measured 2.37–3.05:1
  over glass. Either the chip gets a more opaque fill, or the status is carried by an icon plus
  text rather than by hue.
- **Measure the composited pixel, not the declared colour.** A `rgba()` fill over a busy backdrop
  is not the colour you wrote. Screenshot, sample the pixel under the text, compute the ratio.
- **A CLAMPED INK IS CLAMPED AGAINST ONE SURFACE, AND A DARK THEME MUST SAY WHICH.** The sharpest
  thing measurement taught here, and no source above says it. A generator that walks an ink until it
  clears 4.5:1 has to be told the ground: `tenantTheme(hex)` defaults to the package's LIGHT surface,
  so on a dark theme it walks the ink the WRONG WAY — measured on glass/citron it emitted
  rgb(124,103,0) over a #3b382b panel and read **2.09:1**, while the theme's own `--foreground` beside
  it was near-white. Worse, it emits the result as a literal in `style`, which outranks the
  `--text-link` the theme declared. Pass the theme's own surface (`options.surface`), and pass the
  LIGHTEST surface the ink lands on: ink walked away from a dark ground goes lighter, and lighter ink
  on a darker ground only gains contrast, so clearing the worst case clears all of them.

## 4. Overlays — where this matters most

Dropdown, modal and drawer are the hardest cases and the owner flagged them by name.

- **Each pane must blur the REAL page behind it**, not a smeared copy of its parent. A dropdown
  nested inside an already-blurred panel double-blurs and reads as dirty glass.
- **A modal's scrim is where the blur belongs**, not the dialog box. `backdrop-filter` on an
  element makes it the containing block for its fixed descendants — this library already documents
  that trap at `src/styles/shell-layout.css:1728`, where the app-launcher blur is deliberately on
  the scrim.
- **A drawer covers content that must stay unreadable-but-present.** Keep its fill at the opaque
  end of the range; a drawer you can read the page through is a drawer nobody can read.
- **A dropdown is small and sits over arbitrary content.** It needs the _most_ opaque fill of the
  three, because a 7-line menu over a photograph is unreadable at `0.12`.

## 4b. Form fields — where glassmorphism usually breaks

The owner asked for Input, Select and the rest to match. They are the hardest surface in the
system, and the literature is blunt about why: **a translucent input with a low-contrast border is
unusable.** An input has to read as a _place you can type_ before it reads as glass, and
translucency destroys exactly the two signals that say so — the boundary and the fill.

What a correct glass field has:

|                     | requirement                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **fill**            | frosted, but MORE opaque than the card it sits on. A field at the card's own alpha disappears into it.                   |
| **inner shadow**    | `inset 0 1px 2px rgba(0,0,0,.15)` — the depth cue that says "recessed", replacing the border the glass just weakened     |
| **border**          | ≥ **3:1** against the surface behind it. WCAG 2.2 SC 1.4.11 covers the field boundary as a UI component.                 |
| **focus ring**      | **2px, `:focus-visible`, and it must survive ANY backdrop.** A ring tinted to the glass is invisible over a light photo. |
| **placeholder**     | 4.5:1 like any other text. Placeholder grey on frosted glass is the single most common failure.                          |
| **filled vs empty** | both states checked. An empty field on glass often has no visible box at all.                                            |
| **label**           | a real `<label>`, never a placeholder standing in for one — translucency makes a vanished label unrecoverable.           |

For **Select** specifically the trigger and the listbox are two different problems: the trigger is a
field and follows this table; the **listbox is an overlay** and follows §4 — it needs the most
opaque fill of any surface, because a menu over arbitrary content is unreadable at a card's alpha.

In this library the field surface is `--control-surface-background` /
`--control-surface-border-color`, which Input, Select, Textarea, NumberInput and the pickers share.
That sharing is the opportunity — one pair retunes every field — and the risk: it also means a
field cannot currently differ from a card, which is the first thing this table asks for.

## 5. The fallbacks that make it shippable

- **`@supports not (backdrop-filter: blur(1px))`** → a solid fill. Without it the panel is a
  washed-out rectangle on any engine that lacks support.
- **`prefers-reduced-transparency`** → solid fills. This is an OS accessibility setting; honouring
  it is not optional.
- **`prefers-reduced-motion`** for any animated backdrop.
- Backdrop blur is GPU-expensive. Blur the _few_ surfaces that define depth — shell chrome and
  overlays — not every card, row and chip.

## 6. What this library must expose for any of it to be reachable

Measured on the first attempt: **1 of 19 surfaces** could take a blur (Topbar), **3 of 19** a
gradient. **Measured now, token-only, on `/showcase/theme-lab?theme=glass`: 12 of 25 surfaces carry
a backdrop blur, 19 of 25 are translucent, 9 of 25 shadowed, and contrast is 557–558 of 559 strings
at every one of the five seeds** (the remainder is one badge on a hovered table row at 4.43:1).

Items 3, 5 and 6 below are CLOSED — kept with their measurements because each names a shape of
defect worth recognising again, not because it is still open:

- **3 — Dialog and Sheet fills** are knobs now (`--dialog-surface-background`,
  `--sheet-surface-background`, `src/tokens/components/feedback.css`), both `initial` and resolved at
  the call site.
- **5 — Card's gradient** is a real two-stop ramp; `card-layout.css` no longer names one variable
  twice.
- **6 — Nested control surfaces** have knobs: `--tabs-list-background` and
  `--tabs-trigger-active-background` exist and are read (`navigation-layout.css:268`).

The gaps that REMAIN, in priority order:

1. **A backdrop-blur knob on every surface that can float** — Card, Dialog, Sheet, Popover,
   DropdownMenu, Select listbox, Tooltip, Toast, Sidebar, Table surface. Today only
   `--topbar-backdrop-blur-size` and `--app-launcher-launchpad-backdrop-blur-size` exist.
2. **A saturate companion** to each, or one shared `--surface-backdrop-saturate`. Blur without
   saturate is the grey mush.
3. **Dialog and Sheet fills are dead ends** — `dialog-layout.css:56` hard-codes
   `hsl(var(--background))`; Sheet bakes `bg-background` into its className.
4. **`--background` cannot take an alpha** — it is already composed with one, so a second `/` is
   invalid CSS. Any surface that reads it cannot be made translucent.
5. **Card cannot take a real gradient** — `card-layout.css:49` writes
   `linear-gradient(var(--card-tint), var(--card-tint))`, the same variable twice, so a two-colour
   value degenerates into a hard split.
6. **Nested control surfaces have no knobs** — `--tabs-list-background` and
   `--tabs-trigger-active-background` do not exist, so a glass card's Tabs stay opaque `--muted`
   while the card around them is translucent. This is the "các card này có đồng bộ đéo đâu"
   defect: the container is glass and everything inside it is not.
7. **The `--*-shadow` mirrors are frozen at `:root`**, so setting `--shadow-color` alone moves
   nothing for Card, Sheet, Popover, Tooltip or Segmented.

## Sources

- [namethatui — Glassmorphism](https://namethatui.com/styles/glassmorphism) — the recipe and the four signals quoted above
- [Axess Lab — Glassmorphism Meets Accessibility](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [Superdesign — Glassmorphism CSS recipe and when not to use it](https://www.superdesign.dev/styles/glassmorphism)
- [CSS Studio — The Complete Guide to Frosted Glass Effects](https://css-studio.com/blog/glassmorphism-css-guide)
- [IxDF — What Is Glassmorphism](https://ixdf.org/literature/topics/glassmorphism)
- [CodeFronts — Glassmorphic dropdown & mega menu](https://codefronts.com/navigation/css-glassmorphic-navbars/glassmorphic-dropdown-mega-menu/)
