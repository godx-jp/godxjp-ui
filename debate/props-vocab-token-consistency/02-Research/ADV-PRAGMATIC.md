# ADV-PRAGMATIC research

## Position

Adopt PRAGMATIC-SHARED: shared vocabulary is mandatory for cross-cutting concepts, but component-specific enums stay component-named when their value sets mean different things. Tokens should move to primitive -> semantic -> component layers, with escape hatches that are documented, neutral, and auditable.

## Vocab problems and fixes

1. Controlled value vocabulary is incomplete.
   - Evidence: shared vocabulary has `ValueProp = string` and `OnChangeProp = React.ChangeEventHandler<HTMLInputElement>` only (src/props/vocabulary/shared.prop.ts:49, src/props/vocabulary/shared.prop.ts:53). Components already use `defaultValue` and `onValueChange` shapes in CheckboxGroup and RadioGroup (src/props/components/data-entry.prop.ts:69-73, src/props/components/data-entry.prop.ts:82-86), and Autocomplete uses `onValueChange` (src/props/components/data-entry.prop.ts:214-218).
   - Fix: add generic `ValueProp<T = string>`, `DefaultValueProp<T = string>`, and `OnValueChangeProp<T = string> = (value: T) => void`. Reserve DOM-event `OnChangeProp` for native input/textarea wrappers only.

2. Controlled open vocabulary is missing `DefaultOpenProp`.
   - Evidence: `OpenProp` and `OnOpenChangeProp` exist (src/props/vocabulary/shared.prop.ts:16-20), and DialogConfirm consumes those (src/props/components/feedback.prop.ts:20-23), but no `DefaultOpenProp` exists.
   - Fix: add `DefaultOpenProp = boolean`; require controlled/uncontrolled state prop triples to use `open/defaultOpen/onOpenChange`.

3. `gap` is split into component names even though the public prop concept is the same.
   - Evidence: `StackGapProp` and `InlineGapProp` are separate unions (src/props/vocabulary/layout.prop.ts:12-16), while `GapProp` is already a deprecated alias of `StackGapProp` (src/props/vocabulary/layout.prop.ts:24-25). Stack and Inline both expose the same prop name `gap` (src/props/components/layout.prop.ts:33-41).
   - Fix: create one canonical `GapProp = "xs" | "sm" | "md" | "lg" | "xl"` for the public prop name. If Inline cannot support `xl`, use `InlineGapProp = Exclude<GapProp, "xl">` as a documented component constraint, not a second concept.

4. Title aliases duplicate one content concept.
   - Evidence: `TitleProp` is "Primary heading text" (src/props/vocabulary/content.prop.ts:7-8); `PageTitleProp` is "Same as TitleProp" (src/props/vocabulary/navigation.prop.ts:18-19), and the registry describes it as an alias (src/props/registry.ts:233-237).
   - Fix: use `TitleProp` in component surfaces. Keep `PageTitleProp` only as a deprecated compatibility alias outside the active registry.

5. Semantic status is inconsistently named as `tone`, `variant`, and inline unions.
   - Evidence: `StatusToneProp` is a badge/status color mapping key (src/props/vocabulary/interaction.prop.ts:29-30), `AlertVariantProp` contains semantic states (src/props/vocabulary/interaction.prop.ts:32-33), and `BadgeProp` bypasses `StatusToneProp` with an inline `variant` union containing status values (src/props/components/data-display.prop.ts:43-49).
   - Fix: values like `success`, `warning`, `destructive`, `info`, and `muted` are `ToneProp`/`StatusToneProp`, not `variant`. Change Badge to `tone?: StatusToneProp | "info" | "neutral"` or extend `StatusToneProp`; change Alert to `tone`/`severity` unless the prop controls visual treatment such as `filled`/`outlined`.

6. Component-specific variants are legitimate when the meaning differs.
   - Evidence: Button variants describe action treatment (`default`, `outline`, `ghost`, `link`) (src/props/vocabulary/interaction.prop.ts:6-13); PageContainer variants describe page shell layout (`default`, `narrow`, `flush`, `ghost`) (src/props/vocabulary/layout.prop.ts:9-10); Upload variants describe different upload UI modes (src/props/components/data-entry.prop.ts:293-304). These are not one concept.
   - Fix: keep `ButtonVariantProp`, `PageContainerVariantProp`, and `UploadVariantProp`. Require every component-specific enum to have a registry entry, a doc sentence explaining why shared vocab is not sufficient, and no overlap with a shared concept unless intentionally mapped.

7. Registry coverage is not enforceable yet.
   - Evidence: several component registry entries have empty vocabulary arrays (`SidebarProductProp`, `SidebarItemProp`, etc.) despite using reusable concepts like `name`, `label`, `disabled`, `children`, and `footer` (src/props/registry.ts:320-326; src/props/components/layout.prop.ts:63-96). Data-entry component props use many unregistered concepts such as `orientation`, `defaultValue`, `onValueChange`, `allowClear`, `showSearch`, `multiple`, and `fieldNames` (src/props/components/data-entry.prop.ts:69-91, src/props/components/data-entry.prop.ts:340-380).
   - Fix: add registry entries for all cross-cutting concepts; for one-off component internals, annotate as `local: true` with a reason.

8. Vague slot names need either convention or replacement.
   - Evidence: `ExtraProp` is described as "Top-right action slot" and cites Ant `extra` (src/props/vocabulary/content.prop.ts:16-17), while legacy PageHeader used `actions` for the same role (src/props/components/layout.prop.ts:131-137).
   - Fix: standardize on either `extra` as an Ant-compatible slot or `actions` as the design-system slot. Do not keep both active names for the same slot.

## Token problems and fixes

1. Domain tokens violate domain-neutral package rules.
   - Evidence: `--tracking-internal`, `--tracking-seller`, and `--tracking-yamato` exist in light and dark foundation tokens (src/tokens/foundation.css:33-35, src/tokens/foundation.css:148-150), and Tailwind exposes them as public utilities (src/styles/index.css:56-58).
   - Fix: remove the tracking tokens from package foundation and public Tailwind theme. If an app needs them, put them in the app theme override as app-owned aliases to semantic or primitive tokens.

2. Foundation mixes primitive, semantic, decorative, and domain layers.
   - Evidence: semantic colors (`--primary`, `--success`) sit beside decorative wa-iro palette tokens (`--wa-*`), raw ramps (`--gray-*`, `--blue-*`), spacing, typography, ratio, and domain tracking tokens in one file (src/tokens/foundation.css:3-117).
   - Fix: split into `primitive` palette/ramp/spacing/typography, `semantic` roles, and `component` tokens. Keep wa-iro as primitive/decorative palette only; semantic aliases may reference it.

3. Public Tailwind theme exposes primitive/decorative tokens without a clear contract.
   - Evidence: `@theme` maps semantic colors, chart colors, wa-iro colors, and tracking colors together (src/styles/index.css:22-86).
   - Fix: public utilities should expose semantic roles and approved data-viz/chart scales. Decorative primitives require a `decorative` namespace and docs saying they are not semantic UI colors.

4. Component tokens exist but naming is inconsistent.
   - Evidence: badge uses `--space-badge-*` and `--code-badge-*` (src/tokens/primitives/badge.css:4-12); table mixes `--table-*` and `--space-table-cell-x` (src/tokens/primitives/table.css:4-9); card uses `--card-space-*` (src/tokens/primitives/card.css:4-8).
   - Fix: component tokens use `--component-part-property-state` or `--component-property-scale` consistently, for example `--badge-space-gap`, `--table-cell-space-x`, `--card-space-inset`. No component-specific token may start with a global category prefix unless it is a shared semantic token.

5. Palette ramps are incomplete as primitives.
   - Evidence: gray has 50-900 but blue has only 50, 100, 500, 600, 700 (src/tokens/foundation.css:54-69).
   - Fix: either complete primitive ramps or delete partial ramps from the public package. Semantic tokens should not depend on undocumented one-off ramp gaps.

6. Density is implemented in tokens but prop vocabulary does not align.
   - Evidence: `PageDensityProp` has compact/default/comfortable (src/props/vocabulary/layout.prop.ts:6-7), `TableDensityProp` has compact/comfortable only (src/props/vocabulary/layout.prop.ts:18-19), while token layers include default table row height and density CSS writes default values (src/tokens/primitives/table.css:4-7; src/styles/density.css:8-41).
   - Fix: define shared `DensityProp = "compact" | "default" | "comfortable"`; allow `TableDensityProp = Exclude<DensityProp, "default">` only if documented as a component restriction, or add `default` to table for parity.

7. Escape hatches exist but are only implied.
   - Evidence: token manifest says app-specific overrides live in app theme.css after importing the package (src/tokens/base.css:1-4).
   - Fix: document escape hatches: app overrides may alias semantic tokens; apps may add domain tokens only in app styles; package CSS may not reference app-domain tokens.

## Peer and standards facts

1. MUI keeps per-component prop semantics: Button has `variant="text" | "contained" | "outlined"` and uses shared-looking `color` and `size` props; Alert has `severity="error" | "info" | "success" | "warning"` and a separate `variant="filled" | "outlined" | "standard"`. Sources: https://mui.com/material-ui/react-button/ and https://mui.com/material-ui/api/alert/
2. Ant Design keeps per-component style vocabularies: Button uses `type` for primary/default/dashed/text/link plus `size`; Alert uses `type` for status and `variant` for outlined/filled. Sources: https://ant.design/components/button/ and https://ant.design/components/alert/
3. W3C DTCG separates token identity from arbitrary grouping: a token is identified by `$value`, `$type` constrains valid value shape, and groups are arbitrary categories that tools should not use to infer token type. Source: https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/
4. Style Dictionary supports structured token paths and aliasing; CTI-style category/type/item structure is useful for transforms but token metadata and paths remain explicit. Source: https://styledictionary.com/info/tokens/

## Draft ruleset

1. Every exported component prop type must be listed in `COMPONENT_PROP_REGISTRY`; every reused prop concept must be listed in `VOCABULARY_REGISTRY`.
2. A prop concept used by two or more components must use shared vocabulary unless an entry documents why the component-specific meaning differs.
3. Controlled state must use `value/defaultValue/onValueChange` for abstract values and `open/defaultOpen/onOpenChange` for disclosure state.
4. `onChange` is reserved for native DOM event handlers or compatibility wrappers. New abstract-value callbacks use `onValueChange`.
5. `variant` means visual treatment or structural presentation. Semantic state values use `tone`, `severity`, or a narrower status prop, not `variant`.
6. Component-specific enums are allowed only when their values cannot be interpreted under a shared enum without losing meaning. The enum name must include the component name.
7. Public layout spacing prop names use `gap`; the type is shared `GapProp` unless a component has a documented subset.
8. Alias prop types (`PageTitleProp`, `DensityProp`, old gap aliases) must be marked deprecated and excluded from new registry entries after one migration window.
9. Token files must follow primitive -> semantic -> component layering. Primitive tokens define raw values, semantic tokens define intent, and component tokens alias semantic/primitive tokens for component internals.
10. Package tokens and styles may not contain domain nouns from consuming apps or historical products.
11. Public Tailwind `@theme` exports must be semantic roles, approved chart scales, or documented decorative primitives. No domain tokens in `@theme`.
12. Component token names must start with the component namespace and then the part/property/state, consistently across files.
13. Escape hatches are allowed only as documented app-layer overrides after importing package styles; package source must not depend on app-layer tokens.
14. A vocabulary/token audit must fail CI when a new exported prop or CSS custom property is not registered, is a duplicate alias without deprecation metadata, or violates the domain-neutral naming rule.

## Assumptions

1. The goal is a professional public library API, not only internal app convenience.
2. Breaking changes are acceptable when they remove ambiguity, but migration cost still matters.
3. Current component source outside `src/props`, `src/tokens`, and `src/styles` was intentionally not inspected under the blind rules.

## Confidence

88/100
