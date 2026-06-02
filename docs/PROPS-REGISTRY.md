# Props Registry

Source of truth: `src/props/registry.ts`

```ts
import {
  VOCABULARY_REGISTRY,
  COMPONENT_PROP_REGISTRY,
  PROP_ALIASES_FORBIDDEN,
} from "@godxjp/ui/props/registry";
```

## Vocabulary props (atomic)

<!-- Generated from registry — update registry.ts when adding types -->

| Name                | Category    | File                | Description                             |
| ------------------- | ----------- | ------------------- | --------------------------------------- |
| `TitleProp`         | content     | content.prop.ts     | Primary heading                         |
| `SubtitleProp`      | content     | content.prop.ts     | Page secondary line                     |
| `DescriptionProp`   | content     | content.prop.ts     | Dialog/empty body                       |
| `ExtraProp`         | content     | content.prop.ts     | Page top-right actions                  |
| `FooterProp`        | content     | content.prop.ts     | Page bottom bar                         |
| `PageDensityProp`   | layout      | layout.prop.ts      | Page spacing scale                      |
| `TableDensityProp`  | layout      | layout.prop.ts      | Table row height                        |
| `GapProp`           | layout      | layout.prop.ts      | Shared layout gap                       |
| `ButtonVariantProp` | interaction | interaction.prop.ts | Button style                            |
| `ButtonSizeProp`    | interaction | interaction.prop.ts | Button size                             |
| `BreadcrumbProp`    | navigation  | navigation.prop.ts  | Breadcrumb trail                        |
| `ColumnDefProp`     | data        | data.prop.ts        | Table column def                        |
| …                   |             |                     | See `VOCABULARY_REGISTRY` for full list |

## Component props (composite)

| Name                | Group        | Vocabulary used                                                                     |
| ------------------- | ------------ | ----------------------------------------------------------------------------------- |
| `PageContainerProp` | layout       | TitleProp, SubtitleProp, ExtraProp, FooterProp, BreadcrumbProp, DensityProp |
| `ButtonProp`        | general      | ButtonVariantProp, ButtonSizeProp, AsChildProp                                      |
| `DataTableProp`     | data-display | ColumnDefProp, TableDensityProp, SortStateProp                                      |
| `DialogConfirmProp` | feedback     | OpenProp, TitleProp, DescriptionProp, HandlerProp, PendingProp                      |
| `EmptyStateProp`    | data-display | IconProp, TitleProp, DescriptionProp, ActionProp                                    |
| …                   |              | See `COMPONENT_PROP_REGISTRY`                                                       |

## Before adding a new prop

1. Search this file and `PROPS-VOCABULARY.md`
2. Run `grep -r "YourConcept" packages/ui/src/props/`
3. Reuse vocabulary type if concept exists
4. If new: add to vocabulary → component prop → registry → docs → story

## Forbidden duplicates

| Informal name                    | Canonical                               |
| -------------------------------- | --------------------------------------- |
| `description` (pages)            | `subtitle` → `SubtitleProp`             |
| `description` (dialogs)          | `DescriptionProp`                       |
| `actions` (header)               | `extra` → `ExtraProp`                   |
| `density` (ambiguous)            | `PageDensityProp` or `TableDensityProp` |
| `gap` (component subset)         | `GapProp` with documented subset        |
| `onClear`                        | `OnClearFiltersProp`                    |
| `loading` / `pending` on actions | `PendingProp`                           |
