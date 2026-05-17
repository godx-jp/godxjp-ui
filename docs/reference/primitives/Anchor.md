---
title: "Anchor"
description: "In-page scroll-spy navigation — IntersectionObserver-based active-section detection with vertical or horizontal layout."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Anchor

In-page scroll-spy navigation. Renders a list of links pointing at `#fragment` targets within the page; uses `IntersectionObserver` to auto-detect the active section as the user scrolls. Compositional via `<AnchorLink>` children OR data-driven via `items`. Vocabulary per cardinal rule 23 §B: `orientation` (axis of stack); `sticky` (pin-on-scroll); `offset` (px for scroll-spy detection); `value` / `defaultValue` / `onValueChange` (active hash — mirrors Tabs/Select selection vocabulary).

## Import

```ts
import { Anchor, AnchorLink } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` | Axis of stack |
| `sticky` | `boolean` | `false` | Pin-on-scroll behaviour |
| `offset` | `number` | `0` | Pixel offset from viewport top for scroll-spy detection |
| `items` | `AnchorItem[]` | — | Data-driven items (`{ href, label }`) — omit when using children |
| `value` | `string` | — | Controlled active href (e.g. `#intro`) |
| `defaultValue` | `string` | — | Uncontrolled initial active href |
| `onValueChange` | `(href: string) => void` | — | Called when the active hash changes |

## Example

```tsx
<Anchor sticky offset={20}>
  <AnchorLink href="#intro">概要</AnchorLink>
  <AnchorLink href="#install">インストール</AnchorLink>
  <AnchorLink href="#api">API リファレンス</AnchorLink>
</Anchor>
```

## Related

- Story catalogue: [`Anchor` stories](../../../src/stories/navigation/Anchor.stories.tsx)
- Source: [`src/components/navigation/Anchor.tsx`](../../../src/components/navigation/Anchor.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
