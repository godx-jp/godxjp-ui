---
title: "Switch"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Switch
status: stable
audience: [developer, agent]
lang: en
---

# Switch

> Boolean toggle backed by `@radix-ui/react-switch` with `role="switch"` semantics.

## Usage

```tsx
import { Switch, Label } from "@godxjp/ui";

<div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
  <Switch id="notifications" checked={enabled} onCheckedChange={setEnabled} />
  <Label htmlFor="notifications">Enable notifications</Label>
</div>;
```

## Props

| Prop              | Type                                                    | Default | Description                           |
| ----------------- | ------------------------------------------------------- | ------- | ------------------------------------- |
| `checked`         | `boolean`                                               | —       | Controlled on/off state               |
| `onCheckedChange` | `(checked: boolean) => void`                            | —       | Called when toggled                   |
| `defaultChecked`  | `boolean`                                               | `false` | Uncontrolled default state            |
| `disabled`        | `boolean`                                               | `false` | Disables the toggle                   |
| `name`            | `string`                                                | —       | Form field name                       |
| `value`           | `string`                                                | `"on"`  | Value submitted in forms when checked |
| `...rest`         | `ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>` | —       | All Radix Switch props                |

## Accessibility

- Renders `role="switch"` with `aria-checked` reflecting the current state.
- Space key toggles the switch.
- Always pair with a `<Label>` using `htmlFor` / `id` — the switch alone has no visible label.
- WCAG 2.1 SC 4.1.2 (Name, Role, Value): `role="switch"` and `aria-checked` satisfy name, role, and value for assistive technology.
- WCAG 2.1 SC 1.4.11 (Non-text Contrast): the track background meets 3:1 contrast in both checked and unchecked states.

## Composition

```tsx
// Inside a settings form
<fieldset>
  <legend>Notifications</legend>
  {settings.map((s) => (
    <div
      key={s.id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "0.5rem 0",
      }}
    >
      <Label htmlFor={s.id}>{s.label}</Label>
      <Switch
        id={s.id}
        checked={s.enabled}
        onCheckedChange={(v) => updateSetting(s.id, v)}
      />
    </div>
  ))}
</fieldset>
```

## See also

- [Checkbox](./Checkbox.md) — for items that are part of a list or group.
- [Label](./Label.md) — required pairing.
