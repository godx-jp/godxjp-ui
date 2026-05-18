---
title: "Tour"
description: "Multi-step product walkthrough — overlays the viewport, highlights a target with a popover callout, advances step-by-step."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Tour

> Multi-step product walkthrough. Overlays the viewport, spotlights a target, advances step-by-step.

Tour uses an SVG mask cutout so the active target remains undimmed while the rest of the viewport is subdued. The callout positions near the target's bounding rect (or page-centre when `placement="center"`). Scroll / resize triggers a `requestAnimationFrame`-throttled recompute so the callout sticks to a moving target. Esc closes the tour (`onClose` fires).

Vocabulary follows cardinal rule 23 §B: `open` / `defaultOpen` / `onOpenChange` (Radix overlay state), `current` / `defaultCurrent` / `onCurrentChange` (active step), `placement` (callout anchor).

## When to use Tour vs Tooltip

| Need                                                        | Use                                     |
| ----------------------------------------------------------- | --------------------------------------- |
| Onboarding flow — sequence of N hints to introduce features | **Tour**                                |
| One short hint surfacing on hover / focus                   | [Tooltip](./Tooltip.md)                 |
| Rich content with title + body + actions, anchored on click | [Popover](./Popover.md)                 |
| Single high-stakes confirmation in flow                     | [Popconfirm](../feedback/Popconfirm.md) |

Tour is a _guided sequence_ — Tooltip / Popover surface a single hint at user request. If you find yourself rendering three Tooltips one after another, reach for Tour.

## Usage

```tsx
import { Tour } from "@godxjp/ui";

<Tour
  defaultOpen
  steps={[
    {
      target: "#new-btn",
      title: "新規作成",
      description: "ここから新しいレコードを作成できます。",
    },
    {
      target: "#filter-btn",
      title: "絞り込み",
      description: "条件を指定して一覧を絞り込みます。",
    },
    {
      target: "#settings-btn",
      title: "設定",
      description: "個人設定とテーマを変更できます。",
    },
  ]}
/>;
```

## Props

### `Tour`

| Prop              | Type                      | Default                                                          | Description                                         |
| ----------------- | ------------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| `steps`           | `TourStep[]`              | required                                                         | Ordered list of steps                               |
| `open`            | `boolean`                 | —                                                                | Controlled visibility                               |
| `defaultOpen`     | `boolean`                 | `false`                                                          | Uncontrolled initial visibility                     |
| `onOpenChange`    | `(open: boolean) => void` | —                                                                | Called when visibility changes                      |
| `current`         | `number`                  | —                                                                | Controlled active step index (0-based)              |
| `defaultCurrent`  | `number`                  | `0`                                                              | Uncontrolled initial step                           |
| `onCurrentChange` | `(step: number) => void`  | —                                                                | Called when the step changes                        |
| `onFinish`        | `() => void`              | —                                                                | Called when the user clicks Finish on the last step |
| `onClose`         | `() => void`              | —                                                                | Called when the user dismisses (Skip / Esc)         |
| `labels`          | `TourLabels`              | `{ prev: "Back", next: "Next", finish: "Finish", skip: "Skip" }` | Override button strings                             |
| `className`       | `string`                  | —                                                                | Merged onto `.tour-overlay`                         |

### `TourStep`

| Field         | Type                                                 | Description                                                         |
| ------------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| `target`      | `string \| RefObject<HTMLElement \| null>`           | CSS selector or ref. Omit / `null` for a centred (modal-style) step |
| `title`       | `ReactNode`                                          | Step headline                                                       |
| `description` | `ReactNode`                                          | Optional body                                                       |
| `placement`   | `"top" \| "right" \| "bottom" \| "left" \| "center"` | Callout anchor relative to the target. Default `"bottom"`           |

### `TourLabels`

| Field    | Type     | Default    | Description             |
| -------- | -------- | ---------- | ----------------------- |
| `prev`   | `string` | `"Back"`   | Back button label       |
| `next`   | `string` | `"Next"`   | Next button label       |
| `finish` | `string` | `"Finish"` | Last-step confirm label |
| `skip`   | `string` | `"Skip"`   | Dismiss label           |

## Accessibility

- The overlay renders as `<div role="dialog" aria-modal="true" aria-labelledby="tour-callout-title">` and portals to `document.body`.
- Esc closes (fires `onClose`); the corner Skip button does the same so keyboard and pointer paths match.
- Targets that cannot be resolved (selector returns null, ref is unset) fall back to a centred callout — the tour does not throw and does not crash the page.
- WCAG 2.1 SC 2.4.3 (Focus Order): place the Tour AFTER the targets in the React tree so the dialog's focus trap doesn't disrupt the surrounding flow when closed.
- WCAG 2.1 SC 2.1.2 (No Keyboard Trap): the dialog focus trap is intentional; Esc / Skip both close. Don't disable both buttons simultaneously.

## Composition

```tsx
// Controlled — parent owns step + open
function ControlledTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  return (
    <>
      <Button
        onClick={() => {
          setStep(0);
          setOpen(true);
        }}
      >
        ツアー開始
      </Button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        current={step}
        onCurrentChange={setStep}
        onFinish={() => setOpen(false)}
        steps={[
          { target: "#step-a", title: "ステップ A の説明" },
          { target: "#step-b", title: "ステップ B の説明" },
        ]}
      />
    </>
  );
}

// Centred (no target) — welcome / completion modal
<Tour
  defaultOpen
  labels={{ next: "次へ", prev: "戻る", finish: "始める", skip: "スキップ" }}
  steps={[
    {
      title: "ようこそ",
      description: "簡単な紹介をお見せします。",
      placement: "center",
    },
    {
      title: "ダッシュボード",
      description: "重要な指標がひと目で分かります。",
      placement: "center",
    },
    {
      title: "準備完了",
      description: "それでは始めましょう。",
      placement: "center",
    },
  ]}
/>;
```

## See also

- [Tooltip](./Tooltip.md) — single-hint surface on hover / focus.
- [Popover](./Popover.md) — anchored content with rich body.
- [Dialog](../feedback/Dialog.md) / [AlertDialog](../feedback/AlertDialog.md) — modal alternative when the flow demands confirmation, not introduction.
- Source: [`src/components/data-display/Tour.tsx`](../../../src/components/data-display/Tour.tsx)
