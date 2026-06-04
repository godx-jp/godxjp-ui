# ADR: Prop Vocabulary and Token Consistency

## Status

Decided. Governing standard: PRAGMATIC-SHARED, hardened for 8.0.0.

## Context

The package already has `VOCABULARY_REGISTRY` and `COMPONENT_PROP_REGISTRY`, but the registry is not yet a reliable contract. It permits missing shared concepts (`DefaultValueProp`, `OnValueChangeProp`, `DefaultOpenProp`), duplicate aliases (`GapProp`/`StackGapProp`/`InlineGapProp`, `TitleProp`/`PageTitleProp`), empty component vocabulary arrays, and references to vocabulary entries that do not exist (`UseZodFormReturnProp`, `ZodSchemaProp`) (`src/props/registry.ts:24`, `src/props/registry.ts:79`, `src/props/registry.ts:164`, `src/props/registry.ts:169`, `src/props/registry.ts:233`, `src/props/registry.ts:320`, `src/props/registry.ts:622`).

The token surface also mixes concerns. Domain tokens `--tracking-internal`, `--tracking-seller`, and `--tracking-yamato` are defined in light and dark foundation tokens and exported through Tailwind (`src/tokens/foundation.css:33`, `src/tokens/foundation.css:148`, `src/styles/index.css:56`). Component tokens live under `src/tokens/primitives/`, while the Tailwind v4 `@theme` surface also exposes semantic roles, chart colors, wa-iro decorative tokens, and tracking tokens together (`src/styles/index.css:22`, `src/styles/index.css:50`, `src/styles/index.css:65`).

The decisive distinction is concept identity, not word identity. `gap`, `title`, and controlled state are shared concepts. `ButtonVariantProp`, `PageContainerVariantProp`, `UploadVariantProp`, and tab presentation are not one interchangeable enum (`src/props/vocabulary/interaction.prop.ts:7`, `src/props/vocabulary/layout.prop.ts:10`, `src/props/components/data-entry.prop.ts:294`, `src/props/components/navigation.prop.ts:83`). However, semantic status values such as `success`, `warning`, `destructive`, `info`, and `neutral` must be named as `tone`/status, not hidden inside `variant` (`src/props/vocabulary/interaction.prop.ts:30`, `src/props/components/data-display.prop.ts:45`).

## Options

STRICT-CANON: one canonical vocabulary and one global concept name for every repeated word; full controlled/open vocabulary; semantic-only public tokens; primitive -> semantic -> component tiers.

PRAGMATIC-SHARED: shared vocabulary for cross-cutting concepts; component-specific unions remain only when their values have different semantics; full controlled/open vocabulary; primitive -> semantic -> component token tiers with documented neutral public escape hatches.

STATUS-QUO+: keep most current names and token structure; fix only obvious defects such as `--tracking-*`, gap aliases, and registry truth.

## Decision

Adopt PRAGMATIC-SHARED for 8.0.0.

STRICT loses because one global `VariantProp` would erase real distinctions: button treatment, alert/status tone, confirm emphasis, page shell layout, upload mode, and tabs presentation are different concepts. The standard is: `variant` is a shared public prop concept meaning "visual treatment or presentation mode", but each component may define a per-component value union when the allowed values are not semantically interchangeable. Semantic color/status intent is a separate `ToneProp`.

The controlled vocabulary is adopted fully, not partially. Abstract controlled values use `value`, `defaultValue`, and `onValueChange`; disclosure state uses `open`, `defaultOpen`, and `onOpenChange`. Existing `onChange` value callbacks must be renamed in 8.0.0 where the payload is an abstract value rather than a DOM event. Migration cost is secondary because 7.0.0 has no external consumers.

Tokens use three tiers: primitive -> semantic -> component. This is the right level for Tailwind v4 + CSS variables because it separates raw scales, UI intent, and component internals without requiring a W3C JSON pipeline. Public Tailwind exports may include semantic roles, component tokens where useful, chart scales, and documented neutral decorative primitives such as `wa-*`; public domain tokens and undocumented raw ramps are not allowed.

## Rubric

| Option           |                                                                                    Consistency /30 |                                                                    Completeness /20 |                                                                                 Standards /20 |                                                 Enforceability /15 |                                                             Migration /15 | Total |
| ---------------- | -------------------------------------------------------------------------------------------------: | ----------------------------------------------------------------------------------: | --------------------------------------------------------------------------------------------: | -----------------------------------------------------------------: | ------------------------------------------------------------------------: | ----: |
| STRICT-CANON     |                          24: strong one-name rule, but false-merges real component enum semantics. |                                         18: catches nearly all registry/token gaps. | 15: aligns with token layering, but overstates W3C/Tailwind as semantic-only public surfaces. | 14: easiest to lint, but some checks would enforce wrong concepts. |              8: broad renames and enum collapse create unnecessary churn. |    79 |
| PRAGMATIC-SHARED |             28: canonizes true shared concepts while preserving meaningful component distinctions. | 19: requires missing controlled/open vocab, registry completion, and token cleanup. |                            19: matches MUI/Ant/Radix practice plus DTCG-style alias layering. |             13: enforceable with documented local-enum exceptions. | 12: breaking where correctness requires it, but avoids false-merge churn. |    91 |
| STATUS-QUO+      | 20: fixes exact aliases but leaves overloaded `variant`, density/title drift, and ad hoc handlers. |                      14: under-scopes missing vocabulary and empty registry arrays. |                        16: rightly resists global enums, but token structure remains blurred. |               9: registry remains advisory without stronger rules. |                                                          15: least churn. |    74 |

Winner: PRAGMATIC-SHARED by 12 points over STRICT-CANON.

## Consequences

8.0.0 is one consolidated breaking release for vocabulary and token cleanup. No compatibility aliases are required for external consumers, but internal deprecated aliases may exist briefly inside implementation files only if they are not exported or registered as canonical vocabulary.

The registry becomes normative. An exported component prop type with public fields must either map each field to vocabulary or mark the field as local with a registry reason. Duplicate aliases without deprecation metadata fail CI.

Token files must be reorganized by tier. CSS variables and Tailwind `@theme` exports are public API; they must be domain-neutral and backed by registered token metadata or a documented token namespace.

## RULES

1. Prop vocabulary: every exported `*Prop` type in `src/props/components/` MUST have exactly one `COMPONENT_PROP_REGISTRY` entry.
2. Prop vocabulary: every public property in an exported component prop type MUST map to one `VOCABULARY_REGISTRY` entry or to a `local: true` registry record with a non-empty `reason`.
3. Prop vocabulary: every vocabulary name referenced by `COMPONENT_PROP_REGISTRY[*].vocabulary` MUST exist in `VOCABULARY_REGISTRY`.
4. Prop vocabulary: the same prop spelling, value kind, and semantic role used by two or more components MUST use one shared vocabulary entry.
5. Prop vocabulary: `gap` MUST use `GapProp`; `StackGapProp` and `InlineGapProp` MUST NOT be canonical registry entries.
6. Prop vocabulary: primary heading text MUST use `TitleProp`; `PageTitleProp` MUST NOT be a canonical registry entry.
7. Prop vocabulary: abstract controlled values MUST use `value?: ValueProp<T>`, `defaultValue?: DefaultValueProp<T>`, and `onValueChange?: OnValueChangeProp<T>`; `onChange` MAY be used only for DOM event handlers or explicitly local compatibility wrappers.
8. Prop vocabulary: disclosure/open state MUST use `open?: OpenProp`, `defaultOpen?: DefaultOpenProp`, and `onOpenChange?: OnOpenChangeProp`.
9. Prop vocabulary: semantic color/status intent MUST use `tone` with `ToneProp` or a documented status-specific subtype; `variant` MUST NOT include status-only values such as `success`, `warning`, `info`, or `neutral`.
10. Prop vocabulary: `variant` MAY be component-specific only when its registry entry documents the component semantics and allowed values; one global `VariantProp` MUST NOT be used to collapse non-interchangeable value unions.
11. Prop vocabulary: public `size` values MUST use shared `SizeProp` names or a documented component-specific subset; aliases such as `small` MUST be renamed to the canonical shared value.
12. Prop vocabulary: public density MUST use `DensityProp` when the component participates in page/subtree density; component-specific density subsets MUST be documented with a registry reason.
13. Prop vocabulary: no new public `HandlerProp` use is allowed for named user events; command callbacks MUST have event-specific names such as `onConfirm`, `onRetry`, `onDismiss`, or `onValueChange`.
14. Design tokens: package tokens MUST be organized into primitive, semantic, and component tiers.
15. Design tokens: primitive tokens MUST define raw scales or palettes only; semantic tokens MUST alias primitives by UI role; component tokens MUST alias semantic or primitive tokens by component part/state.
16. Design tokens: package CSS custom properties and Tailwind `@theme` exports MUST NOT contain app, customer, or business-domain nouns.
17. Design tokens: `--tracking-*` and `--color-tracking-*` are forbidden in package source.
18. Design tokens: component-scoped tokens MUST live in the component tier and use `--{component}-{part}-{property}` or `--{component}-{property}-{state}` naming consistently.
19. Design tokens: Tailwind `@theme` color exports MUST reference package tokens; literal colors are allowed only when first registered as primitive or semantic tokens.
20. Design tokens: public raw/decorative primitive exports are allowed only under documented neutral namespaces such as `wa-*` or `chart-*`; undocumented raw ramps such as public `gray-*`/`blue-*` exports are forbidden.
21. Design tokens: dark mode MUST override semantic tokens by role; component-token dark overrides require a documented component contrast reason.
22. Design tokens: density CSS MUST select token aliases and MUST NOT introduce new raw component dimensions when a token tier can hold the value.

## CLEANUP

Prop renames and merges for 8.0.0:

1. `StackGapProp -> GapProp`; `InlineGapProp -> GapProp` with optional component subset via `Extract`/`Exclude`. Update `src/props/vocabulary/layout.prop.ts`, `src/props/components/layout.prop.ts`, and `src/props/registry.ts`.
2. `PageTitleProp -> TitleProp`. Update `PageContainerProp.title` and any `PageHeaderProp` registry entries in `src/props/components/layout.prop.ts`, `src/props/vocabulary/navigation.prop.ts`, and `src/props/registry.ts`.
3. `StatusToneProp -> ToneProp` or `StatusToneProp extends ToneProp` with one canonical status vocabulary. Update `src/props/vocabulary/interaction.prop.ts` and registry descriptions.
4. `BadgeProp.variant` status values `success|warning|destructive|info|neutral` -> `BadgeProp.tone`. Keep `variant` only for visual treatments such as `default|secondary|outline`, or split to `variant?: BadgeVariantProp` plus `tone?: ToneProp`. Update `src/props/components/data-display.prop.ts`.
5. `AlertProp.variant` status values -> `AlertProp.tone` unless a separate visual recipe is added. Update `src/props/components/feedback.prop.ts` and `AlertVariantProp`.
6. `CheckboxGroupProp.onChange -> onValueChange`; `UploadProp.onChange -> onValueChange`; `CascaderProp.onChange -> onValueChange`; `TreeSelectProp.onChange -> onValueChange`; any pagination/transfer/settings abstract value callbacks likewise become `onValueChange` or a more specific `onXChange` only when the concept is not "value". File hints: `src/props/components/data-entry.prop.ts`, `src/props/components/navigation.prop.ts`, `src/props/components/app.prop.ts`.
7. `StepsProp.size: "small" -> "sm"` and any other public size alias to canonical `SizeProp`. File hint: `src/props/components/navigation.prop.ts`.
8. `ButtonSizeProp -> SizeProp` only for shared non-icon sizes; icon-only sizes may remain a documented `ButtonSizeProp` subset. Update `src/props/vocabulary/interaction.prop.ts` and registry.
9. `DensityProp` becomes canonical for shared page/subtree density. `PageDensityProp` may become an internal alias; `TableDensityProp` must either add `"default"` and use `DensityProp`, or remain a documented local subset with registry reason. Update `src/props/vocabulary/layout.prop.ts`, `src/props/registry.ts`, and density docs.
10. `HandlerProp` remains an internal callback shape only; remove it from public vocabulary references where named events are clearer. Update `DialogConfirmProp.onConfirm`, `AlertQueryErrorProp.onRetry`, and `AlertProp.onDismiss` registry mappings in `src/props/components/feedback.prop.ts` and `src/props/registry.ts`.

Missing vocabulary to add:

1. Add generic `ValueProp<T = string>`, `DefaultValueProp<T = string>`, and `OnValueChangeProp<T = string>`.
2. Add `DefaultOpenProp = boolean`.
3. Add `SizeProp` with canonical values including `xs|sm|md|lg` plus documented component subsets.
4. Add `ToneProp` for semantic status/color intent: at minimum `default|success|warning|destructive|info|muted|neutral`.
5. Add or localize registry entries for `UseZodFormReturnProp`, `ZodSchemaProp`, `UseZodFormOptionsProp`, and `FieldErrorMessageProp`. File hints: `src/props/components/form.prop.ts`, `src/props/registry.ts`.
6. Fill empty registry arrays for `SidebarProductProp`, `SidebarItemProp`, `SidebarSectionProp`, `SidebarProp`, `Topbar*`, `ChoiceOptionProp`, `StepItemProp`, `TabItemProp`, and `TabsProp` with existing vocabulary or local records. File hints: `src/props/registry.ts`, `src/props/components/layout.prop.ts`, `src/props/components/data-entry.prop.ts`, `src/props/components/navigation.prop.ts`.

Token cleanup:

1. Remove `--tracking-internal`, `--tracking-seller`, and `--tracking-yamato` from `src/tokens/foundation.css` light and dark blocks.
2. Remove `--color-tracking-internal`, `--color-tracking-seller`, and `--color-tracking-yamato` from `src/styles/index.css`.
3. Replace any package usage of tracking colors with `--info`, `--muted`, `--attention`, `--chart-*`, or component tokens. App-specific tracking colors belong in app theme overrides, not this package.
4. Move component token files out of `src/tokens/primitives/` into a component tier, including `badge.css`, `card.css`, `control.css`, `feedback.css`, `layout.css` where component-specific, `navigation.css`, and `table.css`.
5. Rename component tokens for consistency: `--space-badge-* -> --badge-space-*`; `--space-table-cell-x -> --table-cell-space-x`; `--card-foreground-token -> --card-foreground`; `--card-border-token -> --card-border`.
6. Remove or rename stale `--code-badge-*` tokens in `src/tokens/primitives/badge.css`; if the current component is `Badge`, use neutral `--badge-*` component tokens only.
7. Register chart tokens in the token layer, then change `--color-chart-1` through `--color-chart-6` in `src/styles/index.css` from literal hex to token references.
8. Keep `--wa-*` only as documented neutral decorative primitives for chart/tag/decoration use; do not map consuming-app semantics onto wa names.
9. Either complete the `--blue-*` primitive ramp or remove it from public exports; raw `gray-*`/`blue-*` utilities are not public unless documented as primitive escape hatches.
10. Move density raw dimensions from `src/styles/density.css` into component or semantic density tokens; density classes should assign aliases, not introduce new raw sizes.

## Dissent

STRICT dissent: the winning standard still risks policy drift because local enum exceptions are harder to audit than one global canonical name. This is a real risk; the mitigation is a required registry reason for every component-specific enum and CI failure for undocumented local concepts.

STATUS-QUO+ dissent: the decision spends breaking-change budget on renames before external consumers exist. The dissent is rejected because 7.0.0 has no external consumers, and 8.0.0 is the correct moment to remove overloaded `variant`, incomplete controlled vocabulary, and advisory registry gaps before they become public debt.

SKEPTIC dissent: three token tiers can become ceremony if the package lacks tooling. The dissent is partly accepted: this ADR requires CSS-variable tiers and CI checks, not a W3C JSON token pipeline.
