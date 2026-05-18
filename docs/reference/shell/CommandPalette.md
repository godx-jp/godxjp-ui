---
title: "CommandPalette"
description: "Keyboard command dialog backed by cmdk."
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: CommandPalette
status: stable
audience: [developer, agent]
last-updated: 2026-05-18
lang: en
---

# CommandPalette

> ⌘K command dialog backed by cmdk — provides a keyboard-driven command surface for any GoDX service.

## Usage

```tsx
import { CommandPalette } from "@godxjp/ui/components/shell"
import type { CommandItem } from "@godxjp/ui/components/shell"

const COMMANDS: CommandItem[] = [
  { id: "new-issue",    label: "New issue",    group: "Create",     onSelect: () => openNewIssue() },
  { id: "go-plans",     label: "Go to Plans",  group: "Navigation", onSelect: () => navigate("/plans"), hint: "P" },
  { id: "go-wiki",      label: "Go to Wiki",   group: "Navigation", onSelect: () => navigate("/wiki"),  hint: "W" },
]

<CommandPalette
  open={paletteOpen}
  onOpenChange={setPaletteOpen}
  commands={COMMANDS}
/>
```

## Props

| Prop           | Type                      | Default  | Description                    |
| -------------- | ------------------------- | -------- | ------------------------------ |
| `open`         | `boolean`                 | required | Controlled open state          |
| `onOpenChange` | `(open: boolean) => void` | required | Called when open state changes |
| `commands`     | `CommandItem[]`           | required | List of available commands     |

## Types

### CommandItem

```ts
interface CommandItem {
  id: string;
  label: string;
  group?: string; // Groups items under a section heading
  hint?: string; // Keyboard hint shown on the right (e.g. "⌘K", "P")
  onSelect: () => void; // Called when the command is selected
}
```

## Default behavior

- Mounts a global `keydown` listener for ⌘K (macOS) / Ctrl+K (Windows/Linux) when the component is in the DOM.
- Escape closes the palette.
- Commands are grouped by `group` — groups render with a small uppercase heading.
- Items without a `group` render in the default (ungrouped) section.
- The input is auto-focused on open.
- Selecting an item calls `onSelect()` then closes the palette.

## Accessibility

- The dialog renders `role="dialog"` with an SR-only Radix title (`t("common.search")`).
- `cmdk` Command handles `role="listbox"` and `role="option"` with `aria-selected`.
- Keyboard: Arrow Down / Up moves between items. Enter activates. Escape closes.
- Focus returns to the trigger (or last focused element) on close.

## See also

- [Topbar](./Topbar.md) — the search button that triggers `onSearchOpen`.
- [Tutorial 03: Shell composition](../../tutorials/03-shell-composition.md).
