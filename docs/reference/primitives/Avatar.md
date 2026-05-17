---
title: "Avatar"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Avatar
status: stable
audience: [developer, agent]
lang: en
---

# Avatar

> Circular user avatar — displays a profile image or initials fallback.

## Usage

```tsx
import { Avatar } from "@godxjp/ui"

<Avatar src="/users/satoshi.jpg" alt="Satoshi F" />
<Avatar initials="SF" aria-label="Satoshi F" />
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | — | Image URL. If absent or fails to load, shows `initials` |
| `alt` | `string` | — | Alt text for the image — required when `src` is set |
| `initials` | `string` | — | 1–2 characters shown when image is absent |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Controls width and height |
| `aria-label` | `string` | — | Label for screen readers when no visible text is adjacent |
| `...rest` | `ComponentProps<"div">` | — | Standard div props |

## Sizes

| Size | Diameter |
|---|---|
| `sm` | 24 px |
| `md` | 32 px |
| `lg` | 40 px |

## Accessibility

- When `src` is set, the `<img>` element uses the `alt` prop — always provide a descriptive alt text.
- When showing initials only (no `src`), provide `aria-label` on the Avatar container so screen readers announce the user identity.
- WCAG 2.1 SC 1.1.1 (Non-text Content): avatar images require alt text.
- The `.avatar` CSS class uses `overflow: hidden` and `border-radius: 50%` from tokens.

## Composition

```tsx
// Avatar with username next to it
<div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
  <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
  <span>{user.name}</span>
</div>

// Fallback initials when image fails
<Avatar initials="SK" aria-label="Satoshi Kodama" size="md" />
```

## See also

- [Badge](./Badge.md) — combine for status-augmented avatars.
