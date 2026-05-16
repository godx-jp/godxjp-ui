---
diataxis: how-to
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer]
---

# How to migrate from @godxjp/ui v2.x to v3.0.0

**When to use:** You are upgrading an existing service from v2.x to v3.0.0.

**Prerequisites:** Your service compiles cleanly on the current v2.x version.

The complete migration guide is in [CHANGELOG.md](../../CHANGELOG.md) under `[3.0.0]`.
This how-to condenses it into actionable steps.

---

## Steps

### 1 — Update the package

```bash
pnpm add @godxjp/ui@3.0.0
```

### 2 — Add the Filipino locale (if using addResourceBundle for all locales)

v3 adds `fil` as a mandatory fourth locale. If your service calls `addResourceBundle` for each locale, add a `fil` bundle:

```tsx
i18n.addResourceBundle("fil", "my-svc", {
  title: "Aking Serbisyo",
  // …
})
```

Missing `fil` bundles produce a silent fallback to the base `fil` dictionary — no crash.

### 3 — Rename deprecated types (optional but recommended)

| v2 name | v3 name | v4 removal |
|---|---|---|
| `ForgeLocale` | `GodxLocale` | v4.0.0 |
| `FORGE_LOCALE_STORAGE_KEY` | `GODX_LOCALE_STORAGE_KEY` | v4.0.0 |

Both old names still compile in v3. Update at your own pace:

```bash
# Search-and-replace across the service frontend:
grep -r "ForgeLocale" services/<svc>/frontend/src/
grep -r "FORGE_LOCALE_STORAGE_KEY" services/<svc>/frontend/src/
```

### 4 — Expect a one-time user-visible localStorage reset

The v3 `useTweaks` hook stores state under `"godx.tweaks"` (was `"forge.tweaks"` in v2).
The v3 `initI18n` reads locale from `"godx.locale"` (was `"forge.locale"`).

On first page load after upgrade, returning users will see their stored density, theme,
and locale reset to defaults. They re-select once; the new keys persist from then on.
No user data is lost — old keys become orphan entries that browsers ignore.

### 5 — Adopt zero-config toolchain (recommended)

v3 ships toolchain presets. Use them to delete per-service boilerplate:

```bash
# eslint.config.js — replace existing content with:
echo 'export { default } from "@godxjp/ui/eslint-config"' > eslint.config.js

# .prettierrc (or .prettierrc.json) — replace with:
echo '"@godxjp/ui/prettier-config"' > .prettierrc

# tsconfig.json — add extends key:
# { "extends": "@godxjp/ui/tsconfig", "compilerOptions": { "paths": { … } } }
```

### 6 — Update ForgeProduct.tenant type guards

`ForgeProduct.tenant` changed from a closed literal union to `string`. If you narrowed
on the tenant type, add your own guard:

```ts
const KNOWN_TENANTS = ["godx", "kintai", "tempo", "betoya"] as const
type KnownTenant = (typeof KNOWN_TENANTS)[number]
function isKnownTenant(t: string): t is KnownTenant {
  return (KNOWN_TENANTS as readonly string[]).includes(t)
}
```

---

## What if it fails?

| Symptom | Cause | Fix |
|---|---|---|
| TypeScript error on `ForgeLocale` | Strict null checks see deprecated type | The type still exists in v3; only a lint warning. Update to `GodxLocale` to remove |
| User locale resets on first load | Expected v3 migration behavior | Document in release notes; behavior resolves after one re-selection |
| ESLint errors after adopting preset | Legacy rules conflict | Remove old `eslint.config.js` content before adding the one-liner |
| Tests fail after `pnpm type-check` | `tsconfig` extends changes | Run `pnpm tsc --noEmit` and fix any new strict errors |

---

## Related

- [CHANGELOG.md](../../CHANGELOG.md) — full v3.0.0 migration guide
- [Reference: i18n](../reference/i18n.md)
- [Reference: Hooks — useTweaks](../reference/hooks/useTweaks.md)
- [Reference: Types](../reference/types.md)
