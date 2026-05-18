---
title: "Result"
description: "Page-level outcome surface — success / warning / destructive / info screens after a multi-step flow completes or fails."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Result

> Page-level outcome surface. Use after a multi-step flow completes (success), when a fatal error blocks the page (destructive), when access is gated (warning), or when a section has no data yet (info).

## When to use

| Need                                       | Use                               |
| ------------------------------------------ | --------------------------------- |
| Full-page outcome screen after a flow      | **Result**                        |
| Inline status notice within a page section | [Alert](./Alert.md)               |
| Empty-state placeholder for a list / table | [Empty](../data-display/Empty.md) |
| Toast-style transient notification         | [Toaster](./Toaster.md)           |

## Usage

```tsx
import { Result, Button } from "@godxjp/ui";

<Result
  color="success"
  title="ご注文が完了しました"
  description="番号 No. 2026-05-17-0042 でお手元に届きます。"
  extra={<Button variant="primary">注文履歴を見る</Button>}
/>;
```

## Props

### `Result` (root)

Extends `Omit<ComponentProps<"div">, "color" | "title">`.

| Prop          | Type                                                             | Default          | Description                                                                          |
| ------------- | ---------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `color`       | `"default" \| "info" \| "success" \| "warning" \| "destructive"` | `"info"`         | Semantic role — drives default icon + accent                                         |
| `title`       | `ReactNode`                                                      | —                | Primary headline                                                                     |
| `description` | `ReactNode`                                                      | —                | Secondary body text — matches `Alert.description` vocabulary, NEVER Ant's `subTitle` |
| `icon`        | `ReactNode`                                                      | semantic default | Leading visual — omit to auto-pick a 64×64 icon for the color                        |
| `extra`       | `ReactNode`                                                      | —                | Action area below the description (typically a Button group)                         |
| `children`    | `ReactNode`                                                      | —                | Optional body slot rendered between description and extra                            |

Concept mapping per cardinal rule 23 §B: Ant Design's HTTP-status `status` prop is dropped — consumers wire their own semantic icon when `403` / `404` / `500` differentiation matters. The visual role is `color`.

## Accessibility

- Root carries `role="status"` so assistive tech announces the outcome when the surface mounts.
- Default icons are rendered with `aria-hidden="true"` because the title + description carry the meaning.
- Use a distinct, action-oriented `title` (e.g. "ご注文が完了しました") and follow up with `description` that adds detail — avoid duplicating copy.
- WCAG 2.1 SC 1.4.1 (Use of Color): the semantic icon AND the text content both convey the outcome, so colour is not the only channel.

## Composition

```tsx
// Server error (was Ant status=500)
<Result
  color="destructive"
  title="サーバーエラー"
  description="しばらくしてから再度お試しください。サポートチームに通知済みです。"
  extra={
    <>
      <Button variant="primary">もう一度試す</Button>
      <Button variant="outline">サポートに連絡</Button>
    </>
  }
/>

// Access denied (was Ant status=403)
<Result
  color="warning"
  title="アクセス権限がありません"
  description="この画面を見るには管理者権限が必要です。"
  extra={<Button variant="outline">管理者に依頼</Button>}
/>

// Empty section with CTA
<Result
  color="info"
  title="まだデータがありません"
  description="従業員を追加するとここに表示されます。"
  extra={<Button variant="primary">従業員を追加</Button>}
/>

// Custom icon
<Result
  color="success"
  icon={<Sparkles aria-hidden="true" width={64} height={64} />}
  title="完了!"
  description="今月の目標を達成しました。引き続きよろしくお願いします。"
/>
```

## See also

- [Alert](./Alert.md) — inline notice variant.
- [Empty](../data-display/Empty.md) — empty-state placeholder for lists / tables.
- [Toaster](./Toaster.md) — transient toast-style notification.
- Source: [`src/components/feedback/Result.tsx`](../../../src/components/feedback/Result.tsx)
