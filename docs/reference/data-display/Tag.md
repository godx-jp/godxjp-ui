---
title: "Tag"
description: "Label chip with preset semantic colours, custom CSS colour input, optional close button, and leading icon slot."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Tag

> Label chip — preset semantic hues or any CSS colour, with an optional close button and leading icon.

## When to use Tag vs Badge

| Need                                                        | Use       |
| ----------------------------------------------------------- | --------- |
| A status pill (one short word or a number)                  | **Badge** |
| Free-form labels, often many in a row, optionally removable | **Tag**   |

Tag tints both background and border from the resolved hue via `color-mix(in oklch, …)` — preset names (`success`, `warning`, …) snap to a semantic token; any other string is passed through as a custom CSS colour.

## Usage

```tsx
import { Tag } from "@godxjp/ui"
import { Star } from "lucide-react"

<Tag>渋谷本店</Tag>
<Tag icon={<Star size={12} aria-hidden />}>お気に入り</Tag>
<Tag color="primary">店長</Tag>
<Tag color="success">承認済</Tag>
```

## Props

### `Tag` (root)

| Prop       | Type                                                                                             | Default     | Description                                                               |
| ---------- | ------------------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------- |
| `color`    | `"default" \| "primary" \| "success" \| "warning" \| "destructive" \| "info" \| "attention" \| string` | `"default"` | Preset hue or any CSS colour string (`oklch(56% 0.15 240)`, `#3b82f6`, …). Aliased to `Exclude<ColorProp, "secondary">`. |
| `bordered` | `boolean`                                                                                        | `true`      | Show outline. `false` keeps the tinted background only                    |
| `closable` | `boolean`                                                                                        | `false`     | Render an × button after the label                                        |
| `onClose`  | `(e: MouseEvent<HTMLButtonElement>) => void`                                                     | —           | Called when the × button is clicked                                       |
| `icon`     | `ReactNode`                                                                                      | —           | Leading icon slot                                                         |
| `...rest`  | `Omit<ComponentProps<"span">, "color">`                                                          | —           | Standard `<span>` props                                                   |

## Accessibility

- Renders a native `<span>` so screen readers announce the label text in flow.
- The × button has `aria-label="Remove tag"` and a real `<button>` element — keyboard accessible by default.
- Colour is decorative — always include readable text content so users not relying on colour can identify the tag.
- WCAG 2.1 SC 1.4.3: preset hues maintain readable contrast against the tinted background via `color-mix(in oklch, …, transparent)`; check custom colours when you pass arbitrary strings.

## Composition

```tsx
function FilterChips() {
  const [tags, setTags] = useState(["渋谷本店", "新宿支店", "横浜支店"]);
  return (
    <Flex gap="small" align="center" wrap>
      {tags.map((t) => (
        <Tag
          key={t}
          closable
          onClose={() => setTags((rest) => rest.filter((x) => x !== t))}
        >
          {t}
        </Tag>
      ))}
    </Flex>
  );
}
```

## See also

- [Badge](./Badge.md) — single status pill alternative.
- [IconButton](./IconButton.md) — the × close button pattern when used outside Tag.
- Source: [`src/components/data-display/Tag.tsx`](../../../src/components/data-display/Tag.tsx)
