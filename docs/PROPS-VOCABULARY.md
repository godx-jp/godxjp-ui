# Props Vocabulary

Atomic prop types live in `src/props/vocabulary/`. Every type name ends with **`Prop`**.

Import: `import type { TitleProp, GapProp } from "@godxjp/ui/props/vocabulary"`

---

## Shared

| Type               | Value                         | Used for                  |
| ------------------ | ----------------------------- | ------------------------- |
| `ClassNameProp`    | `string`                      | Root class override       |
| `ChildrenProp`     | `ReactNode`                   | Child slot                |
| `IdProp`           | `string`                      | DOM / form id             |
| `OpenProp`         | `boolean`                     | Dialog/Sheet/Popover open |
| `OnOpenChangeProp` | `(open: boolean) => void`     | Panel open state change   |
| `HandlerProp`      | `() => void \| Promise<void>` | Confirm / retry callbacks |
| `PendingProp`      | `boolean`                     | Loading / in-flight       |
| `RequiredProp`     | `boolean`                     | Required field            |
| `DisabledProp`     | `boolean`                     | Disabled control          |
| `LabelProp`        | `ReactNode`                   | Generic label             |
| `HelperProp`       | `ReactNode`                   | Input hint text           |
| `ErrorProp`        | `ReactNode`                   | Validation error          |
| `PlaceholderProp`  | `string`                      | Input placeholder         |
| `AsChildProp`      | `boolean`                     | Radix polymorphism        |

## Content slots

| Type               | Semantics                            | Do NOT confuse with |
| ------------------ | ------------------------------------ | ------------------- |
| `TitleProp`        | Primary heading                      | —                   |
| `SubtitleProp`     | Line under title on **pages**        | `DescriptionProp`   |
| `DescriptionProp`  | Body copy in dialogs / empty states  | `SubtitleProp`      |
| `ExtraProp`        | Top-right page actions (Ant `extra`) | `ActionsProp`       |
| `FooterProp`       | Bottom page action bar               | —                   |
| `ActionProp`       | Empty state CTA                      | `ExtraProp`         |
| `ActionsProp`      | Toolbar button group                 | `ExtraProp`         |
| `IconProp`         | `LucideIcon` component               | —                   |
| `ConfirmLabelProp` | Dialog confirm button text           | —                   |
| `CancelLabelProp`  | Dialog cancel button text            | —                   |

## Layout & density

| Type               | Values                              | Scope                                                |
| ------------------ | ----------------------------------- | ---------------------------------------------------- |
| `PageDensityProp`  | `compact \| default \| comfortable` | **PageContainer** subtree                            |
| `GapProp`          | `xs \| sm \| md \| lg \| xl`        | `<Stack gap>`, `<Inline gap>` (Inline excludes `xl`) |
| `TableDensityProp` | `compact \| comfortable`            | **DataTable** rows only                              |

> **Critical:** `PageDensityProp` ≠ `TableDensityProp`. Never use bare `density` in new APIs.

## Interaction variants

| Type                 | Values                                                                     |
| -------------------- | -------------------------------------------------------------------------- |
| `ButtonVariantProp`  | `default \| destructive \| outline \| secondary \| ghost \| link`          |
| `ButtonSizeProp`     | `default \| sm \| lg \| icon`                                              |
| `ConfirmVariantProp` | `default \| destructive`                                                   |
| `ToneProp`           | `default \| success \| warning \| destructive \| info \| muted \| neutral` |
| `SortDirectionProp`  | `asc \| desc`                                                              |
| `ColumnAlignProp`    | `left \| center \| right`                                                  |
| `SortStateProp`      | `{ key: string; direction: SortDirectionProp }`                            |

## Navigation

| Type                 | Shape                               |
| -------------------- | ----------------------------------- |
| `BreadcrumbItemProp` | `{ label: LabelProp; to?: string }` |
| `BreadcrumbProp`     | `BreadcrumbItemProp[]`              |
| `TitleProp`          | primary heading text                |

## Data collections

| Type                       | Purpose                 |
| -------------------------- | ----------------------- |
| `ColumnDefProp<T>`         | DataTable column        |
| `GetRowIdProp<T>`          | Row ID extractor        |
| `OnRowClickProp<T>`        | Row navigation          |
| `SelectedIdsProp`          | `Set<string>` selection |
| `OnSelectChangeProp`       | Selection handler       |
| `OnTableDensityChangeProp` | Table density handler   |
| `OnSortChangeProp`         | Sort handler            |
| `OnSearchChangeProp`       | Debounced search        |
| `OnClearFiltersProp`       | FilterBar clear         |
| `HasActiveFiltersProp`     | Show clear button       |

## Forbidden aliases

See `PROP_ALIASES_FORBIDDEN` in `@godxjp/ui/props/registry`:

| Don't use                     | Use instead                                        |
| ----------------------------- | -------------------------------------------------- |
| bare `description` on pages   | `SubtitleProp`                                     |
| bare `description` in dialogs | `DescriptionProp`                                  |
| `actions` on page header      | `ExtraProp`                                        |
| bare `density`                | `PageDensityProp` or `TableDensityProp`            |
| component-specific gap unions | `GapProp` or documented `Extract`/`Exclude` subset |
| `onClear`                     | `OnClearFiltersProp`                               |
| `loading` on buttons          | `PendingProp`                                      |
