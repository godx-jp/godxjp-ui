---
title: "Alert"
description: "Banner-style in-page notice with semantic colour role, optional description, actions, and × close button."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Alert

Banner-style notice for in-page status, deadlines, and reminders. For ephemeral feedback see `<Toaster>`; for blocking confirmation see `<AlertDialog>`. Concept-first vocabulary per cardinal rule 23 §B: Ant's `type` becomes `color` (semantic role); `banner` becomes `variant="banner"`; `message` becomes `title`; `action` becomes `actions` (plural — matches Card).

## Import

```ts
import { Alert } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `"default" \| "info" \| "success" \| "warning" \| "destructive"` | `"default"` | Semantic role |
| `variant` | `"outlined" \| "banner"` | `"outlined"` | Outlined card or full-width banner |
| `title` | `ReactNode` | — | Primary message |
| `description` | `ReactNode` | — | Secondary body text |
| `icon` | `ReactNode` | auto by `color` | Leading icon |
| `actions` | `ReactNode` | — | Footer action slot (typically a Button group) |
| `closable` | `boolean` | `false` | Render an × close button |
| `onClose` | `() => void` | — | Called when × is clicked |

## Example

```tsx
<Alert
  color="info"
  title="5月度の締めは 5/31 (土) 23:59 です"
  description="期限後の修正には承認が必要になります。"
/>
```

## Related

- Story catalogue: [`Alert` stories](../../../src/stories/feedback/Alert.stories.tsx)
- Source: [`src/components/feedback/Alert.tsx`](../../../src/components/feedback/Alert.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
