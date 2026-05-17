---
title: "LocaleTabs"
description: "Bare tab strip with per-locale status dots (translated / draft / missing)."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# LocaleTabs

Bare tab strip with status dots per locale. Header-only — the consumer wires the panel below. Each tab carries a coloured dot signalling translation status: `translated` (green), `draft` (amber, stale relative to base), or `missing` (red, no translation yet). The base locale carries a subtle "(基準)" suffix so reviewers see the fallback source. For the full input + panel composition see the `LocaleInput` composite.

## Import

```ts
import { LocaleTabs } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `locales *` | `LocaleTabItem[]` | — | `{ code, label?, status? }` per tab |
| `value` | `string` | — | Controlled active locale code |
| `defaultValue` | `string` | — | Uncontrolled initial locale code |
| `onChange` | `(next: string) => void` | — | Called when the active tab changes |
| `baseLocale` | `string` | `locales[0].code` | Locale labelled "(基準)" |
| `meta` | `ReactNode` | — | Right-side meta string (e.g. "3 / 4 翻訳済") |
| `onAdd` | `() => void` | — | When set, renders the "⊕ 追加" button |

## Example

```tsx
const [active, setActive] = useState("ja")

return (
  <LocaleTabs
    locales={[
      { code: "ja", label: "日本語", status: "translated" },
      { code: "en", label: "English", status: "translated" },
      { code: "vi", label: "Tiếng Việt", status: "draft" },
    ]}
    value={active}
    onChange={setActive}
    meta="3 / 3 編集中"
  />
)
```

## Related

- Story catalogue: [`LocaleTabs` stories](../../../src/stories/data-entry/LocaleTabs.stories.tsx)
- Source: [`src/components/data-entry/LocaleTabs.tsx`](../../../src/components/data-entry/LocaleTabs.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
