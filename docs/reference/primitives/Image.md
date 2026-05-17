---
title: "Image"
description: "`<img>` element with optional click-to-preview lightbox; tracks load / error state and swaps in placeholder / fallback slots."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Image

`<img>` element with optional click-to-preview lightbox. Default opens a fullscreen overlay on click; Esc + outside-click + the corner × button all close it. Loading / error states render via the `placeholder` / `fallback` slots (skeleton-styled by default through the canonical `.image-wrap` class chain).

## Import

```ts
import { Image } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `src *` | `string` | — | Image URL |
| `alt *` | `string` | — | Accessible alt text |
| `preview` | `boolean` | `true` | Click → fullscreen preview overlay |
| `placeholder` | `ReactNode` | skeleton block | Loading placeholder |
| `fallback` | `ReactNode` | — | Fallback when `src` fails to load |
| `loadStrategy` | `"eager" \| "lazy"` | `"lazy"` | Native loading attribute |
| `fit` | `"cover" \| "contain" \| "fill" \| "none" \| "scale-down"` | `"cover"` | CSS object-fit |

## Example

```tsx
<Image src="/photo.jpg" alt="Sunset" fit="cover" preview />
```

## Related

- Story catalogue: [`Image` stories](../../../src/stories/data-display/Image.stories.tsx)
- Source: [`src/components/data-display/Image.tsx`](../../../src/components/data-display/Image.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
