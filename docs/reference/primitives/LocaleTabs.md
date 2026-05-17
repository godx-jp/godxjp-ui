---
title: "LocaleTabs"
description: "Bare tab strip with per-locale status dots (translated / draft / missing) and base-locale suffix."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# LocaleTabs

> Bare tab strip for translation-status switching. Each tab carries a coloured dot (`translated` / `draft` / `missing`) and the base locale gets a "(基準)" suffix so reviewers see the fallback source at a glance.

This primitive is the header-only subset of the locale-switching surface — the consumer wires the panel below. For the full input + panel composition see the `LocaleInput` composite under [`src/components/composites/locale-input/`](../../../src/components/composites/locale-input/).

## Usage

```tsx
import { useState } from "react"
import { LocaleTabs } from "@godxjp/ui"

function CopyEditor() {
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
}
```

## Props

### `LocaleTabs` (root)

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onChange">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `locales` | `LocaleTabItem[]` | required | Tab definitions |
| `value` | `string` | — | Controlled active locale code |
| `defaultValue` | `string` | `locales[0].code` | Uncontrolled initial code |
| `onChange` | `(code: string) => void` | — | Fires when a tab is clicked |
| `baseLocale` | `string` | `locales[0].code` | Locale labelled "(基準)" in its tab |
| `baseLabel` | `ReactNode` | `"(基準)"` | Custom suffix for the base-locale tab |
| `meta` | `ReactNode` | — | Right-side meta string (e.g. `"3 / 4 翻訳済"`) |
| `onAdd` | `() => void` | — | Click handler for the "⊕ 追加" button — when omitted, no button renders |
| `addLabel` | `ReactNode` | `"⊕ 追加"` | Custom add-button label |

### `LocaleTabItem`

| Field | Type | Description |
|---|---|---|
| `code` | `string` | BCP-47 code (or any string identifier) — committed via `onChange` |
| `label` | `ReactNode` | Display content — defaults to `code.toUpperCase()` |
| `status` | `LocaleTabStatus` | `"translated"` / `"draft"` / `"missing"` — drives the dot colour |

## Accessibility

- Root renders as `<div role="tablist">`; each tab is `<button role="tab" aria-selected={…}>`.
- Status dots are decorative; the status itself should also be communicated through copy when it matters for completion (the framework's locale-aware composites pair dots with the `meta` counter).
- WCAG 2.1 SC 1.4.1 (Use of Color): pair status dots with the `meta` text (e.g. "2 / 4 翻訳済") so users not relying on colour can read overall progress.
- Keyboard activation falls through to the native `<button>` element — `Tab` to focus, `Enter` / `Space` to activate.

## Composition

```tsx
// All three status states
<LocaleTabs
  defaultValue="ja"
  locales={[
    { code: "ja", label: "日本語", status: "translated" },
    { code: "en", label: "English", status: "translated" },
    { code: "vi", label: "Tiếng Việt", status: "draft" },
    { code: "zh", label: "简体中文", status: "missing" },
  ]}
  meta="2 / 4 翻訳済"
/>

// Header + textarea panel composition
function CopyPanel() {
  const [active, setActive] = useState("ja")
  const copy: Record<string, string> = {
    ja: "渋谷本店のシフトを公開しました。",
    en: "Shibuya HQ shift schedule is now published.",
    vi: "",
  }
  return (
    <Flex vertical gap="small" style={{ maxWidth: 480 }}>
      <LocaleTabs
        locales={[
          { code: "ja", label: "日本語", status: "translated" },
          { code: "en", label: "English", status: "translated" },
          { code: "vi", label: "Tiếng Việt", status: "missing" },
        ]}
        value={active}
        onChange={setActive}
        meta="2 / 3 翻訳済"
      />
      <Textarea rows={4} value={copy[active]} placeholder="未翻訳" readOnly />
    </Flex>
  )
}

// With "⊕ 追加" button
<LocaleTabs
  locales={[
    { code: "ja", label: "日本語", status: "translated" },
    { code: "en", label: "English", status: "translated" },
  ]}
  meta="2 / 4 翻訳済"
  onAdd={() => openAddLocalePicker()}
/>
```

## See also

- [Tabs](./Tabs.md) — generic Radix-backed tab primitive.
- [Field](./Field.md) — pair the tabs with a label + help group for form contexts.
- Source: [`src/components/data-entry/LocaleTabs.tsx`](../../../src/components/data-entry/LocaleTabs.tsx)
