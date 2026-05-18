---
title: "Anchor"
description: "In-page scroll-spy navigation — IntersectionObserver-based active-section detection with vertical or horizontal layout."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Anchor

> In-page scroll-spy navigation — links into `#fragment` targets with auto-detected active section.

## Usage

```tsx
import { Anchor, Anchor } from "@godxjp/ui";

<Anchor sticky offset={20}>
  <Anchor href="#intro">概要</Anchor>
  <Anchor href="#install">インストール</Anchor>
  <Anchor href="#api">API リファレンス</Anchor>
  <Anchor href="#examples">使用例</Anchor>
  <Anchor href="#faq">よくある質問</Anchor>
</Anchor>;
```

Data-driven equivalent:

```tsx
<Anchor
  items={[
    { href: "#intro", label: "概要" },
    { href: "#install", label: "インストール" },
    { href: "#api", label: "API リファレンス" },
  ]}
/>
```

## Props

### `Anchor` (root)

| Prop            | Type                                                        | Default      | Description                                                                     |
| --------------- | ----------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| `orientation`   | `"horizontal" \| "vertical"`                                | `"vertical"` | Axis of stack                                                                   |
| `sticky`        | `boolean`                                                   | `false`      | Pin-on-scroll behaviour (`position: sticky`)                                    |
| `offset`        | `number`                                                    | `0`          | Pixel offset from viewport top for scroll-spy detection and target scroll       |
| `items`         | `AnchorItem[]`                                              | —            | Data-driven items (`{ href, label }`) — omit when using `<Anchor>` children |
| `value`         | `string`                                                    | —            | Controlled active href (e.g. `#intro`)                                          |
| `defaultValue`  | `string`                                                    | —            | Uncontrolled initial active href                                                |
| `onValueChange` | `(href: string) => void`                                    | —            | Called when the active hash changes                                             |
| `...rest`       | `Omit<ComponentProps<"nav">, "defaultValue" \| "onChange">` | —            | Standard `<nav>` props                                                          |

### `Anchor`

| Prop      | Type                  | Default  | Description                                                   |
| --------- | --------------------- | -------- | ------------------------------------------------------------- |
| `href`    | `string`              | required | Target hash (`#intro`)                                        |
| `active`  | `boolean`             | —        | Override active state. Defaults to parent Anchor's scroll-spy |
| `...rest` | `ComponentProps<"a">` | —        | Standard `<a>` props                                          |

Vocabulary per cardinal rule 23 §B: `orientation` (axis of stack), `sticky` (pin-on-scroll), `offset` (pixel offset), `value` / `defaultValue` / `onValueChange` (Radix-style selection vocabulary mirroring Tabs / Select).

## Accessibility

- Root is a `<nav>` with `aria-orientation` set from `orientation`.
- The active link sets `aria-current="location"` — assistive tech announces the current section as the user scrolls.
- Smooth scrolling on click uses `window.scrollTo({ behavior: "smooth" })`; browsers that honour `prefers-reduced-motion` will reduce or disable the animation.
- The scroll-spy effect uses `IntersectionObserver`; on first paint with no intersecting section, no link is active — controlled `value` lets the consumer pick a default.

## Composition

```tsx
// Sidebar layout with content
<div style={{ display: "flex", gap: "var(--spacing-6)", padding: "var(--spacing-6)", alignItems: "flex-start" }}>
  <Anchor sticky offset={20} style={{ flexShrink: 0, width: 200, top: 20 }}>
    <Anchor href="#intro">概要</Anchor>
    <Anchor href="#install">インストール</Anchor>
    <Anchor href="#api">API リファレンス</Anchor>
  </Anchor>
  <div style={{ flex: 1, minWidth: 0 }}>
    <section id="intro">…</section>
    <section id="install">…</section>
    <section id="api">…</section>
  </div>
</div>

// Horizontal top-bar style
<Anchor orientation="horizontal" sticky offset={0}>
  <Anchor href="#overview">概要</Anchor>
  <Anchor href="#features">機能</Anchor>
  <Anchor href="#pricing">プラン</Anchor>
</Anchor>
```

## See also

- [Tabs](./Tabs.md) — when each section drives a panel rather than scrolling.
- [Breadcrumb](./Breadcrumb.md) — for hierarchical location instead of in-page scroll.
- Source: [`src/components/navigation/Anchor.tsx`](../../../src/components/navigation/Anchor.tsx)
