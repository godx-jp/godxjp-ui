---
title: "SegmentedControl"
description: "Single-choice toggle group with no tab-panel — view pickers, density toggles, day/week/month switches."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# SegmentedControl

> Single-choice toggle group with no tab-panel — for view pickers, density toggles, and similar toolbars where the choice drives a value only.

## When to use SegmentedControl vs Tabs

| Need | Use |
|---|---|
| The choice swaps panel content | **Tabs** |
| The choice just sets a value (view picker, day/week/month, density) | **SegmentedControl** |

Two variants:

- **`bar`** (default) — connected button row with hairline dividers. Matches the canonical `.seg` strip from `comp-pageheader.html`.
- **`pill`** — rounded background; the active item lifts onto `--background` with a soft shadow.

## Usage

```tsx
import { SegmentedControl } from "@godxjp/ui"

<SegmentedControl
  items={[
    { value: "day", label: "日" },
    { value: "week", label: "週" },
    { value: "month", label: "月" },
  ]}
  defaultValue="month"
  aria-label="表示単位"
/>
```

## Props

### `SegmentedControl<V>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `SegmentedControlItem<V>[]` | required | `{ value, label, icon?, disabled? }` per item |
| `value` | `V` | — | Controlled selection |
| `defaultValue` | `V` | first item's value | Uncontrolled initial selection |
| `onChange` | `(next: V) => void` | — | Called when selection changes |
| `variant` | `"bar" \| "pill"` | `"bar"` | Visual treatment |
| `size` | `"sm" \| "default"` | `"default"` | Dimensional scale |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Axis of the radiogroup. Controls which Arrow keys roam between items (Left/Right for horizontal, Up/Down for vertical) and the value of `aria-orientation`. |
| `aria-label` | `string` | — | Accessible name for the radiogroup |
| `...rest` | `Omit<HTMLAttributes<HTMLDivElement>, "onChange" \| "defaultValue">` | — | Standard `<div>` props |

### `SegmentedControlItem<V>`

| Field | Type | Description |
|---|---|---|
| `value` | `V` (string) | Item key |
| `label` | `ReactNode` | Visible label |
| `icon` | `ReactNode` | Optional leading icon |
| `disabled` | `boolean` | Disable interaction for this item |

### `SegmentedControlButton`

Escape-hatch for composing items manually instead of passing the `items` array. Accepts `ButtonHTMLAttributes<HTMLButtonElement>` plus `active?: boolean`.

## Accessibility

- Root renders `role="radiogroup"` with `aria-orientation` reflecting the `orientation` prop; each item renders `role="radio"` with `aria-checked`. This mirrors the [WAI-ARIA APG radiogroup pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).
- Always pass `aria-label` on the group — screen readers need a discoverable name for the choice set.
- **Keyboard — roving tabindex** (APG-compliant):
  - Tab enters the group at the currently-checked item (it carries `tabIndex={0}`); every other item carries `tabIndex={-1}`. Tab again leaves the group.
  - Within the group, **Arrow keys move focus + selection** between items: Left/Right when `orientation="horizontal"` (default), Up/Down when `orientation="vertical"`.
  - **Home** jumps to the first enabled item; **End** to the last.
  - **Space** / **Enter** on an item re-asserts the selection (useful when the consumer's `onChange` is the only signal).
  - Disabled items are skipped automatically by Arrow / Home / End navigation.
- Active state is announced via `aria-checked="true"`; do not duplicate with `aria-selected` or `aria-current`.
- For form fields where the choice persists into a submitted value, prefer `<RadioGroup>` from `@radix-ui/react-radio-group`; `<SegmentedControl>` is the toolbar / view-picker equivalent.

## Composition

```tsx
// With icons + controlled state
<SegmentedControl
  value={view}
  onChange={setView}
  variant="pill"
  items={[
    { value: "grid", label: "Grid", icon: <LayoutGrid size={13} /> },
    { value: "list", label: "List", icon: <List size={13} /> },
  ]}
  aria-label="表示形式"
/>

// Small size — toolbar density
<SegmentedControl
  size="sm"
  items={[
    { value: "compact", label: "Compact" },
    { value: "default", label: "Default" },
    { value: "comfortable", label: "Comfortable" },
  ]}
  defaultValue="default"
  aria-label="密度"
/>

// Inside a PageHeader actions slot
<PageHeader
  title="従業員シフト · カレンダー"
  actions={
    <SegmentedControl
      items={[
        { value: "day", label: "日" },
        { value: "week", label: "週" },
        { value: "month", label: "月" },
      ]}
      defaultValue="month"
      aria-label="表示単位"
    />
  }
/>
```

## See also

- [Tabs](./Tabs.md) — when the choice drives panel content.
- [Radio](./Radio.md) — when the choice is logically a form field.
- [PageHeader](./PageHeader.md) — typical host for view pickers.
- Source: [`src/components/data-display/SegmentedControl.tsx`](../../../src/components/data-display/SegmentedControl.tsx)
