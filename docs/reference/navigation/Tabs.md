---
title: "Tabs"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Tabs
status: stable
audience: [developer, agent]
lang: en
---

# Tabs

> Radix-backed tab strip with keyboard navigation and ARIA tablist semantics.

## Usage

```tsx
import { Tabs, Tabs, Tabs, Tabs } from "@godxjp/ui";

<Tabs defaultValue="open">
  <Tabs>
    <Tabs value="open">Open</Tabs>
    <Tabs value="closed">Closed</Tabs>
    <Tabs value="merged">Merged</Tabs>
  </Tabs>
  <Tabs value="open">{/* open issues */}</Tabs>
  <Tabs value="closed">{/* closed issues */}</Tabs>
  <Tabs value="merged">{/* merged PRs */}</Tabs>
</Tabs>;
```

## Exports

| Export        | Description                                            |
| ------------- | ------------------------------------------------------ |
| `Tabs`        | Root — re-export of `@radix-ui/react-tabs` Root        |
| `Tabs`    | Container for triggers — renders the `.tabs` CSS class |
| `Tabs` | Individual tab button — renders the `.tab` CSS class   |
| `Tabs` | Panel — re-export of `@radix-ui/react-tabs` Content    |

## Props — Tabs (root)

| Prop            | Type                         | Default        | Description                                |
| --------------- | ---------------------------- | -------------- | ------------------------------------------ |
| `defaultValue`  | `string`                     | —              | Uncontrolled: initially active tab value   |
| `value`         | `string`                     | —              | Controlled: active tab value               |
| `onValueChange` | `(value: string) => void`    | —              | Controlled: called when active tab changes |
| `orientation`   | `"horizontal" \| "vertical"` | `"horizontal"` | Orientation for keyboard navigation        |

## Props — Tabs

| Prop       | Type      | Default  | Description                                  |
| ---------- | --------- | -------- | -------------------------------------------- |
| `value`    | `string`  | required | Tab value — must match a `Tabs` value |
| `disabled` | `boolean` | `false`  | Disables the tab                             |

## Accessibility

- `Tabs` renders `role="tablist"`.
- `Tabs` renders `role="tab"` with `aria-selected` and `aria-controls` wired automatically by Radix.
- `Tabs` renders `role="tabpanel"` with `aria-labelledby` wired automatically.
- Keyboard: Arrow Left / Right moves between tabs. Home goes to the first tab. End goes to the last.
- Roving tabindex: only the active tab is in the tab sequence; Arrow keys move focus without triggering navigation.
- WCAG 2.1 AA: active tab indicator (`.tab[data-state="active"]`) meets 3:1 non-text contrast ratio.

## Composition

```tsx
// Controlled tabs with URL state
const [tab, setTab] = useState("open")

<Tabs value={tab} onValueChange={setTab}>
  <Tabs>
    <Tabs value="open">Open (12)</Tabs>
    <Tabs value="closed">Closed</Tabs>
  </Tabs>
  <Tabs value="open"><IssueList status="open" /></Tabs>
  <Tabs value="closed"><IssueList status="closed" /></Tabs>
</Tabs>
```

## See also

- [DropdownMenu](./DropdownMenu.md) — alternative for action grouping.
