---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Tabs
status: stable
audience: [developer, agent]
---

# Tabs

> Radix-backed tab strip with keyboard navigation and ARIA tablist semantics.

## Usage

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@godxjp/ui"

<Tabs defaultValue="open">
  <TabsList>
    <TabsTrigger value="open">Open</TabsTrigger>
    <TabsTrigger value="closed">Closed</TabsTrigger>
    <TabsTrigger value="merged">Merged</TabsTrigger>
  </TabsList>
  <TabsContent value="open">{/* open issues */}</TabsContent>
  <TabsContent value="closed">{/* closed issues */}</TabsContent>
  <TabsContent value="merged">{/* merged PRs */}</TabsContent>
</Tabs>
```

## Exports

| Export | Description |
|---|---|
| `Tabs` | Root — re-export of `@radix-ui/react-tabs` Root |
| `TabsList` | Container for triggers — renders the `.tabs` CSS class |
| `TabsTrigger` | Individual tab button — renders the `.tab` CSS class |
| `TabsContent` | Panel — re-export of `@radix-ui/react-tabs` Content |

## Props — Tabs (root)

| Prop | Type | Default | Description |
|---|---|---|---|
| `defaultValue` | `string` | — | Uncontrolled: initially active tab value |
| `value` | `string` | — | Controlled: active tab value |
| `onValueChange` | `(value: string) => void` | — | Controlled: called when active tab changes |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Orientation for keyboard navigation |

## Props — TabsTrigger

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | Tab value — must match a `TabsContent` value |
| `disabled` | `boolean` | `false` | Disables the tab |

## Accessibility

- `TabsList` renders `role="tablist"`.
- `TabsTrigger` renders `role="tab"` with `aria-selected` and `aria-controls` wired automatically by Radix.
- `TabsContent` renders `role="tabpanel"` with `aria-labelledby` wired automatically.
- Keyboard: Arrow Left / Right moves between tabs. Home goes to the first tab. End goes to the last.
- Roving tabindex: only the active tab is in the tab sequence; Arrow keys move focus without triggering navigation.
- WCAG 2.1 AA: active tab indicator (`.tab[data-state="active"]`) meets 3:1 non-text contrast ratio.

## Composition

```tsx
// Controlled tabs with URL state
const [tab, setTab] = useState("open")

<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="open">Open (12)</TabsTrigger>
    <TabsTrigger value="closed">Closed</TabsTrigger>
  </TabsList>
  <TabsContent value="open"><IssueList status="open" /></TabsContent>
  <TabsContent value="closed"><IssueList status="closed" /></TabsContent>
</Tabs>
```

## See also

- [DropdownMenu](./DropdownMenu.md) — alternative for action grouping.
