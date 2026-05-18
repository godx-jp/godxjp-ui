# 06 — Prop vocabulary audit

**Status:** Snapshot, 2026-05-19. Inventories every value-union type
declared under `src/components/**`, cross-references it against the
shared types in `src/props/`, and lists the inconsistencies that the
centralised vocabulary surfaced.

Pairs with [04 — Shared prop vocabulary](./04-prop-vocabulary.md) (the
rules) and [`src/props/`](../../src/props/) (the types). When you spot
a new mismatch while working in this repo, add a row to the
"Findings" table below and either fix it in the same PR (preferred for
non-API-breaking aliasing) or open a follow-up.

---

## Executive summary

The framework already aligns to the shared vocabulary on most axes —
`SizeProp`, `StatusProp`, `OrientationProp`, `HelpToneProp`,
`SideProp`, `PlacementProp`, `PaddingProp`, `AlignProp`, `ColorProp`,
`FeedbackColorProp`, `LoadingProp` all have ≥ 1 primitive matching
their exact shape.

**The shared types caught 9 concrete inconsistencies**, ordered
roughly by impact:

1. **Badge.variant is colour-in-disguise** — uses `"error"` (Tag's old
   bug), mixes `"outline"` between `variant` and `appearance`. Should
   be `color: ColorProp` + `appearance: "soft" | "solid" | "outline"`.
2. **IconButton.size uses `sm | default | lg`** — neither shared
   shape. Should be `IconSizeProp` (`sm | md | lg`) to match
   Spinner, or `SizeProp` to match Button.
3. **SegmentedControl.size uses `sm | default`** — same mismatch.
4. **Space.size uses Ant Design's `"middle"`** instead of `"default"`.
5. **PageContent.padding uses density vocab** (`compact | comfortable`)
   while Card / PageHeader use `tight | cozy`. Pick one.
6. **TableDensity is a 2-step subset** (`default | compact`) of the
   3-step `DensityProp`. Document or extend.
7. **PaginationJustify abbreviates to `"between"`** while FlexJustify
   spells out `"space-between"`. Drift.
8. **SpinnerTone has `"muted"`** which isn't in `ColorProp`. Either
   add `"muted"` to `ColorProp` or alias as `ColorProp | "muted"`.
9. **TagPresetColor and TimelineColor are identical** — both =
   `Exclude<ColorProp, "secondary">`. Could share via a single alias.

None are breaking changes if migrated as type aliases that resolve to
the same set of literals (the runtime behavior is unaffected — just
the named home of the union moves).

---

## Findings by category

### Size

| Type                  | Body                                                        | Status                                           |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `InputSize`           | `"small" \| "default" \| "large"`                           | ✅ matches `SizeProp`                            |
| `CheckboxGroupSize`   | `"small" \| "default" \| "large"`                           | ✅ matches `SizeProp`                            |
| `ColorPickerSize`     | `"small" \| "default" \| "large"`                           | ✅ matches `SizeProp`                            |
| `MediaUploadSize`     | `"small" \| "default" \| "large"`                           | ✅ matches `SizeProp`                            |
| `ProgressSize`        | `"small" \| "default" \| "large"`                           | ✅ matches `SizeProp`                            |
| `RadioGroupSize`      | `"small" \| "default" \| "large"`                           | ✅ matches `SizeProp`                            |
| `RateSize`            | `"small" \| "default" \| "large"`                           | ✅ matches `SizeProp`                            |
| `TransferSize`        | `"small" \| "default" \| "large"`                           | ✅ matches `SizeProp`                            |
| `ButtonSize`          | `"x-small" \| "small" \| "default" \| "large"`              | ✅ matches `SizeWithXSProp`                      |
| `SpinnerSize`         | `"sm" \| "md" \| "lg"`                                      | ✅ matches `IconSizeProp`                        |
| `IconButtonSize`      | `"sm" \| "default" \| "lg"`                                 | ⚠️ neither shape — mixes shorthand + spelled-out |
| `SegmentedControlSize`| `"sm" \| "default"`                                         | ⚠️ truncated mismatch                            |
| `PaginationSize`      | `"small" \| "default"`                                      | ⚠️ subset (no `"large"`)                         |
| `SpaceSize`           | `number \| "small" \| "middle" \| "large"`                  | ⚠️ Ant `"middle"` instead of `"default"`         |
| `AvatarSize`          | `AvatarSizeToken \| number`                                 | ✅ intentionally unique (numeric pixel sizes)    |
| `TitleSize`           | `1 \| 2 \| 3 \| 4 \| 5`                                     | ✅ intentionally unique (h-levels)               |
| `AllDayChipSize`      | `"compact" \| "month" \| "pill"`                            | ✅ intentionally unique (calendar variants)      |

### Status / Tone

| Type             | Body                                                                     | Status                                           |
| ---------------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
| `InputStatus`    | `"default" \| "error" \| "warning" \| "success"`                         | ✅ matches `StatusProp`                          |
| `FieldHelpTone`  | `"default" \| "info" \| "warn" \| "error" \| "success"`                  | ✅ matches `HelpToneProp`                        |
| `CardTone`       | `"default" \| "muted" \| "outline-only"`                                 | ✅ intentionally unique (surface treatment)      |
| `SpinnerTone`    | `"info" \| "muted" \| "primary" \| "success" \| "warning" \| "destructive"` | ⚠️ ≈ ColorProp + `"muted"`, missing `"default"` |
| `LocaleStatus`   | `"filled" \| "draft" \| "empty"`                                         | ✅ domain lifecycle, intentional                 |
| `LocaleTabStatus`| `"translated" \| "draft" \| "missing"`                                   | ✅ domain lifecycle, intentional                 |
| `ProjectStatus`  | `"active" \| "review" \| "planning" \| "archived"`                       | ✅ shell domain lifecycle                        |
| `UploadStatus`   | `"pending" \| "uploading" \| "success" \| "error" \| "removed"`          | ✅ upload lifecycle                              |

### Color / Variant

| Type             | Body                                                                                              | Status                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `AlertColor`     | `"default" \| "info" \| "success" \| "warning" \| "destructive"`                                  | ✅ matches `FeedbackColorProp` — could alias                                            |
| `ResultColor`    | same as AlertColor                                                                                | ✅ matches `FeedbackColorProp` — could alias                                            |
| `ProgressColor`  | same as AlertColor                                                                                | ✅ matches `FeedbackColorProp` — could alias                                            |
| `TagPresetColor` | `Exclude<ColorProp, "secondary">`                                                                 | ✅ already aliased (PR #60)                                                             |
| `TimelineColor`  | `"default" \| "primary" \| "success" \| "warning" \| "destructive" \| "info" \| "attention"`      | ✅ identical to `TagPresetColor` — collapse                                             |
| `TypographyColor`| `"default" \| "secondary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive"`    | ⚠️ unique subset (uses `secondary` for text dimming, no `primary`)                      |
| `ButtonVariant`  | `"primary" \| "secondary" \| "outline" \| "ghost" \| "destructive" \| "link"`                     | ✅ action-vocabulary, intentionally unique                                              |
| `IconButtonVariant` | `"secondary" \| "ghost" \| "primary"`                                                          | ✅ subset of Button — intentional                                                       |
| `BadgeVariant`   | `"primary" \| "success" \| "warning" \| "info" \| "error" \| "attention" \| "neutral" \| "outline"` | 🛑 colour-in-disguise + uses `"error"` (Tag's old bug) + collides with `BadgeAppearance` |
| `AlertVariant`   | `"outlined" \| "banner"`                                                                          | ✅ surface treatment, intentional                                                       |
| `TabsVariant`    | `"line" \| "pills"`                                                                               | ✅ visual style, intentional                                                            |
| `PaginationVariant` | `"default" \| "simple" \| "embedded"`                                                          | ✅ feature mode, intentional                                                            |
| `PageHeaderVariant` | `"compact" \| "overflow" \| "stacked"`                                                         | ✅ layout variant                                                                       |
| `ProgressVariant` | `"line" \| "circle"`                                                                             | ✅ shape variant                                                                        |
| `SegmentedControlVariant` | `"bar" \| "pill"`                                                                        | ✅ shape variant                                                                        |
| `TimelineVariant` | `"list" \| "branching" \| "feed"`                                                                | ✅ layout variant                                                                       |
| `EventBlockVariant` | `"solid" \| "tint" \| "tentative" \| "focus"`                                                  | ✅ calendar-specific                                                                    |

### Orientation / Side / Placement

| Type                          | Body                                                | Status                       |
| ----------------------------- | --------------------------------------------------- | ---------------------------- |
| `AnchorOrientation`           | `"horizontal" \| "vertical"`                        | ✅ matches `OrientationProp` |
| `CheckboxGroupOrientation`    | `"horizontal" \| "vertical"`                        | ✅ matches `OrientationProp` |
| `MenuOrientation`             | `"horizontal" \| "vertical"`                        | ✅ matches `OrientationProp` |
| `RadioGroupOrientation`       | `"horizontal" \| "vertical"`                        | ✅ matches `OrientationProp` |
| `SegmentedControlOrientation` | `"horizontal" \| "vertical"`                        | ✅ matches `OrientationProp` |
| `StepsOrientation`            | `"horizontal" \| "vertical"`                        | ✅ matches `OrientationProp` |
| `TabsOrientation`             | `"horizontal" \| "vertical"`                        | ✅ matches `OrientationProp` |
| `SheetSide`                   | `"top" \| "right" \| "bottom" \| "left"`            | ✅ matches `SideProp`        |
| `TabsPlacement`               | `"top" \| "right" \| "bottom" \| "left"`            | ✅ matches `SideProp`        |
| `TourPlacement`               | `"top" \| "right" \| "bottom" \| "left" \| "center"`| ✅ matches `PlacementProp`   |
| `TableStickySide`             | `"left" \| "right"`                                 | ✅ horizontal-only subset    |

### Justify / Align

| Type                | Body                                                              | Status                                              |
| ------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| `FlexJustify`       | `"start" \| "end" \| "center" \| "space-between" \| "space-around" \| "space-evenly"` | ✅ standard CSS                  |
| `FlexAlign`         | `"start" \| "end" \| "center" \| "stretch" \| "baseline"`         | ✅ matches `AlignProp`                              |
| `IconRowAlign`      | `"top" \| "center"`                                               | ✅ vertical-only subset                             |
| `PaginationJustify` | `"start" \| "center" \| "end" \| "between"`                       | ⚠️ uses `"between"` shortform vs FlexJustify spelled-out |

### Padding / Density / Shape

| Type                 | Body                                                | Status                                                |
| -------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| `CardPadding`        | `"tight" \| "default" \| "cozy" \| "none"`          | ✅ matches `PaddingProp`                              |
| `PageHeaderPadding`  | `"tight" \| "default" \| "cozy" \| "none"`          | ✅ matches `PaddingProp`                              |
| `PageContentPadding` | `"compact" \| "default" \| "comfortable" \| "none"` | ⚠️ uses density words instead of padding words        |
| `TreeDensity`        | `"compact" \| "default" \| "comfortable"`           | ✅ matches `DensityProp`                              |
| `TableDensity`       | `"default" \| "compact"`                            | ⚠️ subset (only 2 of 3 DensityProp values)            |
| `AvatarShape`        | `"circle" \| "square"`                              | ✅ intentional binary                                 |
| `MediaUploadShape`   | `"square" \| "circle" \| "card"`                    | ✅ adds `"card"` for thumbnail tile                   |

### Accent / Band (Card-only)

| Type         | Body                                                                                                | Status                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `CardAccent` | `"primary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive" \| "featured"`       | ✅ ≈ `Exclude<ColorProp, "default" \| "secondary">` + `"featured"`     |
| `CardBand`   | `"primary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive" \| "gradient" \| "dotted"` | ✅ same colour set + `"gradient" \| "dotted"` decorators           |

---

## Recommended migrations (priority order)

| # | Change | Type of change | API break?   |
| - | ------ | -------------- | ------------ |
| 1 | Badge: split `variant` → `color: ColorProp` + keep `appearance`. Drop `"outline"` from variant, drop `"error"`. | Refactor + rename | ✅ breaking — needs a deprecation cycle |
| 2 | IconButton: rename `IconButtonSize` to `IconSizeProp` (= `sm \| md \| lg`) OR switch to `SizeProp` (`small \| default \| large`). | Vocabulary realignment | ⚠️ breaking |
| 3 | SegmentedControl: same call as IconButton. | Same | ⚠️ breaking |
| 4 | Space: rename `"middle"` → `"default"`. Drop Ant compat. | Rename | ⚠️ breaking |
| 5 | PageContent: rename `PageContentPadding` values to `PaddingProp` vocabulary OR rename the prop to `density`. | Vocabulary realignment | ⚠️ breaking |
| 6 | Pagination: rename `"between"` → `"space-between"` to match FlexJustify. | Rename | ⚠️ breaking |
| 7 | TimelineColor: alias to `Exclude<ColorProp, "secondary">` (same shape as `TagPresetColor`). | Internal alias | ✅ no break |
| 8 | AlertColor / ResultColor / ProgressColor: alias each to `FeedbackColorProp`. | Internal alias | ✅ no break |
| 9 | SpinnerTone: extend with `"default"`, alias as `ColorProp \| "muted"`. | Internal alias | ✅ no break |

The four ✅-marked rows can ship in a single non-breaking refactor.
The five ⚠️-marked rows need a deprecation cycle (keep the old union as
a `@deprecated` alias for a major version, then drop) — schedule when
the next major bump is on the table.

---

## Tracking command

To see which primitives consume each shared prop type today:

```sh
# Every primitive importing a shared prop type
grep -rln '"../../props"' src/components/

# Specific type, e.g. SizeProp
grep -rln "SizeProp\b" src/components/

# Find local size-y unions still NOT pointed at SizeProp
grep -rhE "^export type \w+Size\b" src/components/ \
  | grep -v "= SizeProp\|SizeWithXSProp\|IconSizeProp"
```

Run the second snippet after each migration PR to watch the local
aliases collapse onto the shared shape.
