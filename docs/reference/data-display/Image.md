---
title: "Image"
description: "`<img>` element with optional click-to-preview lightbox; tracks load / error state and swaps in placeholder / fallback slots."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Image

> `<img>` with click-to-preview lightbox and built-in loading / error fallbacks.

Default behaviour: clicking the image opens a fullscreen overlay; Esc, clicking outside the photo, or the corner × button all close it. The wrapper element carries `data-status="loading" | "loaded" | "error"` so CSS and probes can react to load state.

## When to use Image vs raw `<img>`

| Need                                                       | Use                                   |
| ---------------------------------------------------------- | ------------------------------------- |
| Loaded inline, no click interaction, no fallback           | Raw `<img>`                           |
| Click to zoom (lightbox), or display loading / error state | **Image**                             |
| Multiple images in a swipeable deck                        | [Carousel](./Carousel.md)             |
| Decorative repeating texture / watermark                   | [Watermark](../feedback/Watermark.md) |

## Usage

```tsx
import { Image } from "@godxjp/ui";

<Image src="/photo.jpg" alt="サンプル画像" style={{ width: 320 }} />;
```

## Props

| Prop           | Type                                                       | Default   | Description                                                           |
| -------------- | ---------------------------------------------------------- | --------- | --------------------------------------------------------------------- |
| `src`          | `string`                                                   | required  | Image URL                                                             |
| `alt`          | `string`                                                   | required  | Accessible alt text (also used as `aria-label` on the preview dialog) |
| `preview`      | `boolean`                                                  | `true`    | Click → fullscreen preview overlay                                    |
| `placeholder`  | `ReactNode`                                                | —         | Loading placeholder slot (rendered while the browser fetches)         |
| `fallback`     | `ReactNode`                                                | —         | Fallback slot when `src` fails to load                                |
| `loadStrategy` | `"eager" \| "lazy"`                                        | `"lazy"`  | Maps to the native `<img loading>` attribute                          |
| `fit`          | `"cover" \| "contain" \| "fill" \| "none" \| "scale-down"` | `"cover"` | CSS `object-fit` value                                                |
| `className`    | `string`                                                   | —         | Merged onto the `.image-wrap` span                                    |
| `style`        | `CSSProperties`                                            | —         | Merged onto the `.image-wrap` span                                    |
| `...rest`      | `Omit<ComponentProps<"img">, "loading">`                   | —         | Standard `<img>` props (e.g. `width`, `height`, `srcSet`)             |

## Accessibility

- The `alt` text is required and reused as the preview dialog's `aria-label` so screen readers announce the same name on click.
- The preview overlay renders as `<div role="dialog" aria-modal="true">` and traps Esc to close. The close button has `aria-label="Close preview"`.
- Clicking the preview image itself does not close the overlay — only the background and the × button do — so screen-reader users can reach the photo without dismissing it on focus.
- WCAG 2.1 SC 1.1.1 (Non-text Content): always pass meaningful `alt`. Use `alt=""` (empty string) explicitly when the image is purely decorative and a sibling caption already conveys the meaning.

## Composition

```tsx
// Explicit preview (default) — click to zoom
<Image src={PHOTO_TALL} alt="縦長サンプル" preview style={{ width: 240 }} />

// Object-fit variants inside a fixed-size container
<div style={{ width: 240, height: 180, background: "var(--muted)" }}>
  <Image src={PHOTO_TALL} alt="cover" fit="cover" style={{ width: 240, height: 180 }} />
</div>
<div style={{ width: 240, height: 180, background: "var(--muted)" }}>
  <Image src={PHOTO_TALL} alt="contain" fit="contain" style={{ width: 240, height: 180 }} />
</div>

// Broken src → fallback shows
<Image
  src="https://invalid.local/missing.jpg"
  alt="壊れた画像"
  fallback={<span>画像を読み込めませんでした</span>}
  style={{ width: 240, height: 180 }}
/>
```

## See also

- [Carousel](./Carousel.md) — multiple images in a slide deck.
- [Avatar](./Avatar.md) — small profile-photo variant with name fallback.
- [Skeleton](../feedback/Skeleton.md) — drop-in loading placeholder for the `placeholder` slot.
- Source: [`src/components/data-display/Image.tsx`](../../../src/components/data-display/Image.tsx)
