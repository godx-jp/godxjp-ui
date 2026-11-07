# Exemplar CSS: the product-map sign-in surface

The one stylesheet for the `auth-brand-surface` pattern (`get_pattern auth-brand-surface`, or
`agent/patterns/auth-brand-surface.json`). Everything is scoped to `.brand-surface`; nothing
outside it changes. Colour is the kit's own tokens re-set on the surface root, plus a handful of
`--brand-surface-*` HSL triplets for the picture. Those are app tokens in the app's stylesheet,
not kit tokens. The HSL values below are a neutral green-grey night board: replace them with your
brand's. Keep the contrast pairs (listed after the CSS) when you do.

What it does:

- Desktop: a two-column grid. The picture on the start side (`7fr`) carries the wordmark at the
  top and the value line at the foot. The form side (`5fr`, at least `26rem`) holds the panel.
- The board stays dark in both themes. A board of hardware reads as night in either theme, and
  that gives the product one recognisable face. The form side follows the theme: in light it keeps
  the app's tokens, and in dark the surface re-sets them to sit beside the board.
- A fade at the foot of the board keeps routes from running under the value line.
- Below `60rem` the board becomes a band of about a third of the screen, with the wordmark and
  the value line. The form sits below it, top-aligned. This is a designed phone layout, not the
  desktop one squeezed.
- `--primary` and `--ring` are never touched, so the buttons and the focus ring stay the
  product's brand colour.

```css
/* Fonts are bundled (no font CDN: an on-premise install has no internet). One display face per
   script: a Latin display face usually has no kana and no Vietnamese tone marks. */
@import "@fontsource-variable/host-grotesk/wght.css";
@import "@fontsource-variable/jetbrains-mono/wght.css";
@import "@fontsource/m-plus-2/700.css";

.brand-surface {
  --brand-surface-gutter: clamp(1rem, 0.4rem + 2.6vw, 3.5rem);
  --brand-surface-display: "Host Grotesk Variable", "M PLUS 2", var(--font-family-sans);
  --brand-surface-mono: "JetBrains Mono Variable", var(--font-family-mono);
  --brand-surface-panel-width: 23.5rem;
  /* The picture: a night board in BOTH themes. */
  --brand-surface-stage: 162 24% 9%;
  --brand-surface-ink: 150 16% 93%;
  --brand-surface-muted: 156 10% 68%;
  --brand-surface-line: 162 16% 24%;
  --brand-surface-dot: 160 14% 22%;
  --brand-surface-box: 162 20% 12%;
  --brand-surface-box-edge: 160 14% 36%;
  --brand-surface-signal: 158 76% 60%;
  /* The kit's Logo reads these; the wordmark takes the display face and the board's ink. */
  --logo-wordmark-font-family: var(--brand-surface-display);
  --logo-wordmark-letter-spacing: -0.02em;
  --logo-wordmark-color: var(--brand-surface-ink);
}

/* Dark: the form side re-sets the kit's surface tokens to sit beside the board.
   --primary and --ring are left alone. */
:root[data-theme="dark"] .brand-surface,
.dark .brand-surface {
  --brand-surface-stage: 165 26% 6%;
  --brand-surface-line: 162 16% 19%;
  --brand-surface-dot: 160 14% 16%;
  --brand-surface-box: 162 22% 9%;
  --background: 165 10% 9%;
  --card: 165 10% 11%;
  --border: 165 8% 18%;
}

/* Vietnamese: the Latin display face lacks the tone marks. */
html[lang="vi"] .brand-surface {
  --brand-surface-display: "M PLUS 2", var(--font-family-sans);
}

.brand-surface-main {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(26rem, 5fr);
  grid-template-areas: "stage panel";
  min-block-size: 100dvh;
  isolation: isolate;
  overflow: hidden;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.brand-surface-stage {
  position: relative;
  grid-area: stage;
  overflow: hidden;
  pointer-events: none;
  background: hsl(var(--brand-surface-stage));
}

/* The fade at the foot: routes never run under the value line. */
.brand-surface-stage::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  block-size: 58%;
  background: linear-gradient(
    to top,
    hsl(var(--brand-surface-stage)) 38%,
    hsl(var(--brand-surface-stage) / 0)
  );
}

.brand-surface-art {
  position: absolute;
  inset: 0;
  display: block;
  inline-size: 100%;
  block-size: 100%;
}

.brand-surface-brand {
  position: relative;
  z-index: 1;
  grid-area: stage;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-inline-size: 0;
  padding: var(--brand-surface-gutter);
}

.brand-surface-value {
  margin: 0;
  margin-block-start: auto;
  max-inline-size: 15em;
  font-family: var(--brand-surface-display);
  font-size: clamp(2rem, 1rem + 2.4vw, 3.25rem);
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -0.035em;
  color: hsl(var(--brand-surface-ink));
  text-wrap: balance;
}

/* Japanese: a wider measure in characters, heavier, more leading, no negative tracking. */
html[lang="ja"] .brand-surface-value {
  max-inline-size: 13em;
  font-size: clamp(1.75rem, 0.9rem + 2vw, 2.75rem);
  font-weight: 700;
  line-height: 1.32;
  letter-spacing: -0.01em;
}

.brand-surface-facts {
  margin: 0;
  font-family: var(--brand-surface-mono);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: hsl(var(--brand-surface-muted));
}

.brand-surface-panel {
  position: relative;
  z-index: 1;
  grid-area: panel;
  display: grid;
  place-items: center;
  min-inline-size: 0;
  padding: var(--brand-surface-gutter);
  border-inline-start: 1px solid hsl(var(--border));
}

.brand-surface-panel-in {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  inline-size: min(var(--brand-surface-panel-width), 100%);
}

.brand-surface-title {
  margin: 0;
  font-family: var(--brand-surface-display);
  font-size: 1.625rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

/* The pause control sits on the picture it stops, not among the form's settings. */
.brand-surface-motion {
  position: absolute;
  z-index: 2;
  grid-area: stage;
  inset-block-start: 0.75rem;
  inset-inline-end: 0.75rem;
  color: hsl(var(--brand-surface-muted));
}

@media (prefers-reduced-motion: reduce) {
  .brand-surface-motion {
    display: none;
  }
}

/* The picture's parts. */
.brand-surface-dot {
  fill: hsl(var(--brand-surface-dot));
}

.brand-surface-route {
  fill: none;
  stroke: hsl(var(--brand-surface-line));
  stroke-width: 1.5;
  stroke-linejoin: round;
}

.brand-surface-packet {
  fill: none;
  stroke: hsl(var(--brand-surface-signal));
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.brand-surface-packets {
  filter: drop-shadow(0 0 4px hsl(var(--brand-surface-signal) / 0.8));
}

.brand-surface-box {
  fill: hsl(var(--brand-surface-box));
  stroke: hsl(var(--brand-surface-box-edge));
  stroke-width: 1;
}

.brand-surface-led,
.brand-surface-core {
  fill: hsl(var(--brand-surface-signal));
}

.brand-surface-ring {
  fill: hsl(var(--brand-surface-stage));
  stroke: hsl(var(--brand-surface-signal) / 0.7);
  stroke-width: 1.5;
}

.brand-surface-label {
  font-family: var(--brand-surface-mono);
  font-size: 11px;
  fill: hsl(var(--brand-surface-muted));
  opacity: 0.8;
}

/* Phone and narrow tablet: the board becomes a band, the form sits below it. */
@media (max-width: 59.99rem) {
  .brand-surface-main {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1fr;
    grid-template-areas: "stage" "panel";
  }

  .brand-surface-stage,
  .brand-surface-brand {
    min-block-size: clamp(15rem, 34dvh, 20rem);
  }

  .brand-surface-stage::after {
    block-size: 64%;
  }

  .brand-surface-brand {
    gap: 0.5rem;
    padding: 1.25rem 1rem;
  }

  .brand-surface-value {
    font-size: clamp(1.625rem, 1rem + 2.4vw, 2.25rem);
  }

  html[lang="ja"] .brand-surface-value {
    font-size: clamp(1.375rem, 0.9rem + 2vw, 1.875rem);
  }

  .brand-surface-panel {
    place-items: start center;
    padding: 1.75rem 1rem 2rem;
    border-inline-start: 0;
  }
}
```

## Contrast pairs to keep when you change the colours

Measure them after every palette change. Do not estimate them by eye.

| Text                                      | On                               | Needs                                                       |
| ----------------------------------------- | -------------------------------- | ----------------------------------------------------------- |
| value line (`--brand-surface-ink`)        | `--brand-surface-stage`          | 3:1 (large text, 24px and up); aim for 7:1                  |
| fact line (`--brand-surface-muted`, 12px) | `--brand-surface-stage`          | 4.5:1                                                       |
| wordmark (`--brand-surface-ink`)          | `--brand-surface-stage`          | 4.5:1                                                       |
| pause icon (`--brand-surface-muted`)      | `--brand-surface-stage`          | 3:1 (WCAG 1.4.11)                                           |
| everything on the form side               | re-set `--background` / `--card` | the kit's own pairs, unchanged in light; re-measure in dark |

The SVG labels are decoration (`aria-hidden`), so no ratio applies to them. Keep them quiet
enough that nobody tries to read them.
