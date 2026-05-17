---
title: "Separator"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Separator
status: stable
audience: [developer, agent]
lang: en
---

# Separator

> Visual divider backed by `@radix-ui/react-separator` with ARIA role semantics.

## Usage

```tsx
import { Separator } from "@godxjp/ui"

<Separator />
<Separator orientation="vertical" style={{ height: "1rem" }} />
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction |
| `decorative` | `boolean` | `false` | When `true`, uses `role="none"` — purely visual, not announced |
| `...rest` | `ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>` | — | All Radix Separator props |

## Accessibility

- Renders `role="separator"` by default — screen readers announce "separator".
- When the separator is purely decorative (for example, a thin line between list items that are already grouped semantically), set `decorative={true}` to suppress the ARIA announcement.
- `aria-orientation` is set automatically based on the `orientation` prop.

## Composition

```tsx
// Between sidebar sections
<div>
  <NavSection items={primaryItems} />
  <Separator decorative className="my-2" />
  <NavSection items={secondaryItems} />
</div>

// Vertical separator in a toolbar
<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
  <Button>Copy</Button>
  <Separator orientation="vertical" style={{ height: "1.25rem" }} />
  <Button>Paste</Button>
</div>
```

## See also

- [DropdownMenuSeparator](./DropdownMenu.md) — separator inside dropdown menus.
