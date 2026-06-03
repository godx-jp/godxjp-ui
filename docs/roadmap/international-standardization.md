# Roadmap — International standardization (i18n · a11y · API vocabulary)

> Audited 2026-06 by 4 parallel reviewers. Principle: **identifiers use ISO/IANA/BCP-47;
> formatting delegates to `Intl`/CLDR with the active locale; interaction follows WAI-ARIA
> APG + WCAG 2.2 AA; component APIs follow the controlled vocabulary.** ~45 findings.
> Each item carries file:line + the standard + the fix. Tracked as tasks #66–#79.

## Phase 1 — i18n / international formatting (non-breaking)

### #66 Number / currency / bytes → `Intl` with the active locale
- `src/lib/format.ts:71` `formatCurrency` hardcodes `Intl.NumberFormat("en-US")` → money renders
  in US conventions for every locale (ja sees `¥1,234` US-style, vi never gets `1.234.567 ₫`).
  Identifier is correct ISO 4217; formatting is not locale-delegated. **Fix:** thread the active
  BCP-47 locale; delete the hand-maintained `zeroDecimal` array (53-69) — `Intl.NumberFormat`
  already knows CLDR minor units (the array omits UGX/VUV/PYG — drift bug).
- `format.ts:42-48` `formatBytes` hand-builds `${(n/1024).toFixed(1)} KB` (hardcoded `.` +
  English units). **Fix:** `Intl.NumberFormat(locale,{style:"unit",unit:"kilobyte|megabyte|gigabyte",unitDisplay:"short"})`.

### #67 Pluralization + numeric interpolation (`Intl.PluralRules`)
- `src/i18n/translate.ts:28-34` only `replaceAll` → `{count}/{total}/{page}` via `String()` lose
  grouping; **no plural selection** → en `"selectedCount":"{count} selected"` yields "1 items".
  **Fix:** message values become category maps `{one,other}`, selected via
  `Intl.PluralRules(locale).select(count)`; numeric params formatted via `Intl.NumberFormat(locale)`.
  Update `selectedCount` / `pagination.total` / `pageSizeOption` in en/vi/ja.json.

### #68 Country recipe → `Intl.DisplayNames`, drop emoji flags
- `docs/data-entry/country-picker-recipe.tsx:14-25` uses emoji flags (`🇯🇵` — break on
  Windows/Linux) + hardcoded Japanese labels. Value is correct ISO 3166-1 alpha-2 but the name is
  neither standard-derived nor localized. **Fix:** keep the alpha-2 array; derive the label with
  `new Intl.DisplayNames([locale],{type:"region"}).of(code)`; drop emoji or use an SVG flag set.

### #69 RTL/bidi + hour-cycle
- No `dir`-awareness anywhere; 14 physical Tailwind utilities (`ml/mr/pr`, `right-0`, `rounded-l/r`)
  in date-picker, time-picker, cascader, tree-select, calendar, app-setting-picker break under RTL.
  **Fix:** swap to logical (`ms/me/pe`, `end-0`, `rounded-s/e`, `border-e`, `text-start`); have
  AppProvider set `dir` from locale.
- `messages/*.json` `common.next`/`pagination.next` bake a literal `→` (wrong in RTL) → render a
  mirror-able icon.
- `time-picker.tsx:118` always builds a 24-hour column, ignoring `timeFormat`/CLDR hour cycle.
- Optional: `Intl.Collator` (sort/search), `Intl.ListFormat`, migrate relative time to
  `Intl.RelativeTimeFormat`.

## Phase 2 — A11y / WAI-ARIA APG + WCAG 2.2 AA (mostly non-breaking)

- **#70 DataTable** — sortable `<th onClick>` → focusable `<button>` + `aria-sort`; `aria-busy`/
  `aria-live` on loading/empty; row-click keyboard equivalent; raw checkbox → Checkbox primitive.
- **#71 Nav composites** — Pagination `<a role=button href=#>` → real `<button>` + native disabled;
  Steps `aria-current="step"` + non-button when non-interactive; Sidebar/AppShell `<nav aria-label>`
  landmark; Carousel region/slide roles; Toolbar `role=toolbar`+roving or drop the name.
- **#72 Data-display** — Timeline `<ol>` + non-colour status text; TreeList list/tree semantics;
  Progress accessible name; Alert `role=status` for info/success (reserve `role=alert`).
- **#73 Combobox family** — SearchSelect editable-combobox semantics (role/aria-expanded/
  activedescendant + listbox/option); TreeSelect roving+arrow keyboard or drop `role=tree`; clear
  `<X>` controls → real `<button aria-label>`.
- **#74 Custom controls** — Rating roving-tabindex radiogroup + ≥24px; TagInput label + live region;
  TimePicker listbox columns; ColorPicker hex label; Upload file-input label + live status + remove
  names; Transfer group labelling; PasswordInput toggle keyboard; target-size pass (control.css).
- **#75 FormField + i18n aria sweep** — `aria-errormessage` + helper/error coexistence + single-child
  guard; UploadCropDialog `DialogDescription`; sweep hardcoded English aria-labels through `t()`.
- **#76 Infra** — add `vitest-axe` + `expectNoA11yViolations` helper + a render-and-axe test per
  composite; wire into CI.

## Phase 3 — API / naming vocabulary (mostly BREAKING)

- **#77** (non-breaking) extend `check-prop-vocabulary.mjs` to scan `src/components/**/*.tsx` for
  `export type *Props` (21 types invisible today); register the 12 uncatalogued components
  (Toggle, ToggleGroup, Rating, TagInput, PasswordInput, PasswordStrength, SplitPane, Timeline,
  TreeList, Progress, Breadcrumb, Card family).
- **#78** (BREAKING) Steps `current/initial/onChange`→`value/defaultValue/onValueChange`; Pagination
  `current/onChange`→triad; `size:"default"`→`"md"` (Switch/Steps/Select/Toggle/Card; Button excepted);
  StepItem `subTitle`→`subtitle`, `content`→`description`; SearchInput `onDebouncedChange`→
  `onSearchChange`; Tabs param `key`→`value`. Update docs + MCP + registry + internal usages +
  CHANGELOG; flag MF-app migration.
- **#79** (additive) AppSettingPicker forward `ref` + accept `name` + render disabled instead of
  throwing; DatePicker/DateRangePicker add `defaultValue` + `ValueProp<Date>`.

## Consumer ripple
Phase 3 breaking renames + the earlier SearchSelect→internal change require the MF app
(`resources/js`) to migrate on its next `@godxjp/ui` bump (Steps/Pagination props, size values,
SearchSelect→`Select loadOptions`).
