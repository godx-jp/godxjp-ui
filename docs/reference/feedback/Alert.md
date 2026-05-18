---
title: "Alert"
description: "Banner-style in-page notice with semantic colour role, optional description, actions, and × close button."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Alert

> Banner-style in-page notice — semantic colour role, optional description, footer actions, and an optional × close button.

## When to use Alert vs Toaster vs AlertDialog

| Need                                                   | Use             |
| ------------------------------------------------------ | --------------- |
| Persistent in-page status, deadline, or reminder       | **Alert**       |
| Ephemeral feedback after an action ("saved", "copied") | **Toaster**     |
| Blocking confirmation that requires a user decision    | **AlertDialog** |

## Usage

```tsx
import { Alert } from "@godxjp/ui";

<Alert
  color="info"
  title="5月度の締めは 5/31 (土) 23:59 です"
  description="期限後の修正には承認が必要になります。"
/>;
```

## Props

### `Alert` (root)

| Prop          | Type                                                             | Default         | Description                                   |
| ------------- | ---------------------------------------------------------------- | --------------- | --------------------------------------------- |
| `color`       | `"default" \| "info" \| "success" \| "warning" \| "destructive"` | `"default"`     | Semantic role                                 |
| `variant`     | `"outlined" \| "banner"`                                         | `"outlined"`    | Outlined card or full-width banner            |
| `title`       | `ReactNode`                                                      | —               | Primary message                               |
| `description` | `ReactNode`                                                      | —               | Secondary body text                           |
| `icon`        | `ReactNode`                                                      | auto by `color` | Leading icon. Pass `null` to suppress         |
| `actions`     | `ReactNode`                                                      | —               | Footer action slot (typically a Button group) |
| `closable`    | `boolean`                                                        | `false`         | Render an × close button                      |
| `onClose`     | `() => void`                                                     | —               | Called when × is clicked                      |
| `...rest`     | `Omit<ComponentProps<"div">, "color" \| "title">`                | —               | Standard `<div>` props                        |

Concept-first vocabulary per cardinal rule 23 §B: Ant's `type` becomes `color` (semantic role); `banner` becomes `variant="banner"`; `message` becomes `title`; `action` becomes `actions` (plural — matches Card).

## Accessibility

- Renders `role="alert"` on the root — assistive tech announces the title + description when the element appears in the DOM.
- The × close button has `aria-label="Close"` and renders a real `<button>`; focus follows tab order.
- Each semantic `color` carries an auto-picked Lucide icon with `aria-hidden="true"` so the icon is decorative; pair with text content per WCAG 2.1 SC 1.4.1 (Use of Color).
- For dismissible system messages, manage focus explicitly after `onClose` — the alert removal should not orphan the user's keyboard position.

## Composition

```tsx
// With actions
<Alert
  color="warning"
  title="3 件の打刻漏れがあります"
  description="本日中に確認してください。"
  actions={
    <>
      <Button size="small" variant="primary">確認する</Button>
      <Button size="small" variant="ghost">後で</Button>
    </>
  }
/>

// Banner variant — full-width edge-to-edge
<Alert
  variant="banner"
  color="info"
  title="5/20 (火) 22:00 〜 23:00 にメンテナンスを実施します。"
/>

// Custom icon
<Alert
  color="info"
  icon={<Megaphone aria-hidden="true" width={16} height={16} />}
  title="新機能リリースのお知らせ"
  description="勤怠ダッシュボードに月次サマリーが追加されました。"
/>
```

## See also

- [Toaster](./Toaster.md) — ephemeral feedback.
- [AlertDialog](./AlertDialog.md) — blocking confirmation.
- [Card](../data-display/Card.md) — shares the `actions` slot vocabulary.
- Source: [`src/components/feedback/Alert.tsx`](../../../src/components/feedback/Alert.tsx)
