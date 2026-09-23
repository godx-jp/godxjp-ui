# Glassmorphism — the standard, and what this library must support

Written because the first attempt (`docs/themes/glassmorphism.css`, `/showcase/glassmorphism`)
produced grey-purple slabs on a muddy backdrop with 2.2:1 text, and the owner's verdict was
correct: _"màu không tương phản, màu trông rất ghê"_. This page is the target to build against,
not a description of what we shipped.

Sources are listed at the bottom. Nothing here is invented.

---

## 1. The recipe

Glass is **four properties together**. Any three of them without the fourth is not glass:

|                   | value                                                                                         | why                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **fill**          | `rgba(255,255,255, .10–.18)` on a dark backdrop · `rgba(255,255,255, .55–.70)` on a light one | translucency, not opacity                                                                               |
| **backdrop blur** | `blur(12px) saturate(160%)`                                                                   | **the saturate is not optional** — blur alone desaturates and produces exactly the grey mush we shipped |
| **edge**          | `1px solid rgba(255,255,255, .25–.30)`                                                        | the highlight that reads as a glass rim; without it the panel has no edge and melts into the backdrop   |
| **depth**         | `0 8px 32px rgba(0,0,0,.25)`                                                                  | separates the pane from what it floats over                                                             |

Blur range **8–24px**; avoid **≥20px** — past that it stops reading as glass and becomes fog, and
it costs the most GPU.

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
- **Muted/secondary text is the first casualty.** Our measurement: title 6.19:1 passed while five
  secondary strings on the same card measured **2.19–3.05:1**. On glass, "muted" cannot mean
  "lower contrast" — it must mean _smaller_ or _lighter weight_, at the same ratio.
- **Status colours do not survive translucency.** Success/warning/error ink measured 2.37–3.05:1
  over glass. Either the chip gets a more opaque fill, or the status is carried by an icon plus
  text rather than by hue.
- **Measure the composited pixel, not the declared colour.** A `rgba()` fill over a busy backdrop
  is not the colour you wrote. Screenshot, sample the pixel under the text, compute the ratio.

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
gradient. The theme API cannot currently express this standard. The gaps, in priority order:

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

- [Axess Lab — Glassmorphism Meets Accessibility](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [Superdesign — Glassmorphism CSS recipe and when not to use it](https://www.superdesign.dev/styles/glassmorphism)
- [CSS Studio — The Complete Guide to Frosted Glass Effects](https://css-studio.com/blog/glassmorphism-css-guide)
- [IxDF — What Is Glassmorphism](https://ixdf.org/literature/topics/glassmorphism)
- [CodeFronts — Glassmorphic dropdown & mega menu](https://codefronts.com/navigation/css-glassmorphic-navbars/glassmorphic-dropdown-mega-menu/)
