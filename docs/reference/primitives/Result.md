---
title: "Result"
description: "Page-level outcome surface — success / warning / destructive / info screens after a multi-step flow completes or fails."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Result

Page-level outcome surface (Ant-Design `Result` shape). Use after a multi-step flow completes (success), when a fatal error blocks the page (destructive), when access is gated (warning), or when a section has no data yet (info). For inline notices see `<Alert>`. Ant's HTTP-status overload (`status="404"` etc.) is intentionally dropped — consumers wire their own icon when needed.

## Import

```ts
import { Result } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `"default" \| "info" \| "success" \| "warning" \| "destructive"` | `"info"` | Semantic role |
| `title` | `ReactNode` | — | Primary headline |
| `description` | `ReactNode` | — | Secondary body text |
| `icon` | `ReactNode` | auto by `color` | Leading visual |
| `extra` | `ReactNode` | — | Action area below the description (typically a Button group) |

## Example

```tsx
<Result
  color="success"
  title="ご注文が完了しました"
  description="番号 No. 2026-05-17-0042 でお手元に届きます。"
  extra={<Button variant="primary">注文履歴を見る</Button>}
/>
```

## Related

- Story catalogue: [`Result` stories](../../../src/stories/feedback/Result.stories.tsx)
- Source: [`src/components/feedback/Result.tsx`](../../../src/components/feedback/Result.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
