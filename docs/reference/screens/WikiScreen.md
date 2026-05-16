---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: WikiScreen
status: stable
audience: [developer, agent]
---

# WikiScreen

> Documentation viewer with table of contents sidebar and prose content area.

## Usage

```tsx
import { WikiScreen } from "@godxjp/ui/components/screens"

<WikiScreen onOpenPage={(slug) => navigate(`/wiki/${slug}`)} />
```

## Required props / data shape

| Prop | Type | Description |
|---|---|---|
| `onOpenPage` | `(slug: string) => void` | Called when a TOC entry is clicked |

The screen renders fixture wiki pages. Each page has:

```ts
interface WikiPage {
  slug: string
  title: string
  section: string
  updatedAt: string
  author: string
  excerpt: string
}
```

## Layout

```
[page-header: "Wiki" + "+ New page" button]
[2-col layout]
  [wiki-toc: section groups with page links] [prose: page content area]
```

## CSS classes

The screen uses the `.wiki-layout`, `.wiki-toc`, and `.prose` CSS classes from `tokens-ext.css`. These provide the two-column layout and prose typography scale.

## See also

- [tokens.md](../tokens.md) — `.prose` typography tokens.
