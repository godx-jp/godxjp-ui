---
title: "Versioning policy"
diataxis: explanation
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer]
lang: en
status: published
---

# Versioning policy

`@godxjp/ui` follows [SemVer 2.0.0](https://semver.org/) and documents every
release-worthy change in `CHANGELOG.md` under the
[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) format.

---

## Version number semantics

```
MAJOR.MINOR.PATCH
```

| Segment | Incremented when |
|---|---|
| MAJOR | A breaking change ships (see below). |
| MINOR | A backwards-compatible addition ships. |
| PATCH | A backwards-compatible bug fix ships. |

`0.y.z` development ranges are not used. The library has been at `1.x` or
above since its first stable release.

---

## Breaking-change criteria

A change is breaking — and therefore requires a MAJOR bump — when it
removes or restricts the public surface that a caller depends on:

| Change | Breaking? |
|---|---|
| Export removed from any `package.json` exports entry | Yes |
| Required prop added to an existing component | Yes |
| Default value of an existing prop changed | Yes |
| TypeScript type narrowed (union member removed, `string` → literal) | Yes |
| CSS custom property (token) removed | Yes |
| `localStorage` key renamed without migration shim | Yes |
| i18n namespace or key renamed without fallback | Yes |
| Minimum peer version raised (React, TypeScript, Tailwind) | Yes |
| New optional prop added to an existing component | No — minor |
| New CSS custom property (token) added | No — minor |
| New primitive or shell component added | No — minor |
| New i18n key added to existing namespace | No — minor |
| New locale added to `SUPPORTED_LOCALES` | No — minor |
| Bug fix that changes observable behavior within spec | No — patch |
| Internal refactor with no surface change | No — patch |

---

## Deprecation policy

A public export scheduled for removal follows a two-phase cycle:

1. **Deprecation in MINOR**: the export is tagged with a `@deprecated` JSDoc
   comment that names the replacement and the target MAJOR version for
   removal. Both the old and new exports are available.
2. **Removal in MAJOR**: the deprecated export is removed.

The deprecation window spans at least one full MAJOR version.

Example: `ForgeLocale` was deprecated in v3.0.0 (replaced by `GodxLocale`)
and will be removed in v4.0.0. During v3.x both names are importable from
`@godxjp/ui/i18n`.

---

## Pre-release labels

| Label | Meaning |
|---|---|
| `x.y.z-alpha.N` | Internal experimentation; API surface may change daily. |
| `x.y.z-beta.N` | Feature-complete; integration testing in progress. |
| `x.y.z-rc.N` | Release candidate; no planned breaking changes. |

Pre-releases are published to npm under the `next` dist-tag. Stable releases
use `latest`.

---

## CHANGELOG conventions

Every PR that changes the library surface adds an entry under
`## [Unreleased]` in `CHANGELOG.md`:

```markdown
## [Unreleased]

### Added
- `TimeInput` component with `HH:mm` normalization and `aria-invalid` binding.

### Changed
- `useTweaks` storage key renamed from `"forge.tweaks"` to `"godx.tweaks"`.

### Deprecated
- `ForgeLocale` type — use `GodxLocale` instead. Removed in v4.

### Fixed
- `Skeleton` now respects `prefers-reduced-motion` in Safari 17.

### Breaking
- `tenant` field of `ForgeProduct` is now `string` instead of a closed union.
```

The release automation promotes `[Unreleased]` to the version heading and
stamps the date.

---

## Tooling

### Storybook (deferred to v3.1.0)

Storybook is the planned visual regression and a11y testing surface for
`@godxjp/ui`. The previous subagent who shipped v3.0.0 deferred Storybook
because of outstanding CI registry integration work. The decision is tracked
and will ship in v3.1.0.

When Storybook lands:

- Every primitive, shell composition, and screen will have a
  `stories/<kind>/<Name>.stories.tsx` file.
- Stories cover every variant and state (default, hover, active, focused,
  disabled, loading, error) on both `[data-theme="light"]` and
  `[data-theme="dark"]`.
- CI will run `@storybook/addon-a11y` on every story as an axe-core gate.
- A component diff without a paired story diff will be rejected at review.

Until Storybook lands, primitives are documented through inline `tsx` code
blocks in `docs/reference/<group>/<Name>.md`, and a11y coverage is
provided by `jest-axe` / `vitest-axe` assertions in the component test suite.

### Zero-config presets

`@godxjp/ui` ships four tooling presets that any consumer can adopt without
local configuration:

| Preset | Import path |
|---|---|
| ESLint flat config | `@godxjp/ui/eslint-config` |
| Prettier config | `@godxjp/ui/prettier-config` |
| TypeScript base tsconfig | `@godxjp/ui/tsconfig` |
| Vitest preset | `@godxjp/ui/vitest-config` |

Presets are versioned alongside the library. Breaking changes to preset output
follow the same deprecation policy as the component surface.

---

## See also

- [`CHANGELOG.md`](../../CHANGELOG.md) — full version history.
- [Explanation: Compatibility](./compatibility.md) — browser and framework
  support matrix.
- [`CHANGELOG.md`](../../CHANGELOG.md) `[3.0.0]` section — v2 → v3
  migration notes.
