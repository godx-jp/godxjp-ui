# ADV-SQ Research: STATUS-QUO+

## Position

Keep the existing prop vocabulary and token model unless the defect is mechanically provable. The minimum unarguable fixes are:

1. Remove the domain `--tracking-*` tokens and Tailwind exports.
2. Merge the gap prop family into one axis-aware `GapProp`.
3. Make the registry truthful for already-existing props and imported vocabulary names.

## A. Vocabulary Problems And Fixes

### Missing props

1. `DefaultValueProp` is missing from shared vocabulary.
   Evidence: `defaultValue` is used by checkbox group, radio group, country select, time picker, upload, cascader, tree select, and tabs (`src/props/components/data-entry.prop.ts:71`, `src/props/components/data-entry.prop.ts:84`, `src/props/components/data-entry.prop.ts:134`, `src/props/components/data-entry.prop.ts:181`, `src/props/components/data-entry.prop.ts:306`, `src/props/components/data-entry.prop.ts:343`, `src/props/components/data-entry.prop.ts:366`, `src/props/components/navigation.prop.ts:81`), while shared vocabulary only defines `ValueProp` and `OnChangeProp` (`src/props/vocabulary/shared.prop.ts:49`, `src/props/vocabulary/shared.prop.ts:52`).
   Fix: add `DefaultValueProp<T = string> = T` to shared vocabulary and registry. Do not rename existing component props.

2. `OnValueChangeProp` is missing from shared vocabulary.
   Evidence: `onValueChange` is used by `RadioGroupProp`, `AutocompleteProp`, and `TabsProp` (`src/props/components/data-entry.prop.ts:85`, `src/props/components/data-entry.prop.ts:217`, `src/props/components/navigation.prop.ts:82`), but the vocabulary has only DOM `OnChangeProp` and panel `OnOpenChangeProp` (`src/props/vocabulary/shared.prop.ts:52`, `src/props/vocabulary/shared.prop.ts:19`).
   Fix: add `OnValueChangeProp<T = string> = (value: T) => void` and register it. Migrate type annotations opportunistically, not as a public rename.

3. `DefaultOpenProp` is absent.
   Evidence: `OpenProp` and `OnOpenChangeProp` exist (`src/props/vocabulary/shared.prop.ts:16`, `src/props/vocabulary/shared.prop.ts:19`), and `DialogConfirmProp` is controlled-only today (`src/props/components/feedback.prop.ts:21`, `src/props/components/feedback.prop.ts:22`).
   Fix: do not add unused `defaultOpen` solely for symmetry. Add `DefaultOpenProp` only when a component actually exposes uncontrolled open state. Radix commonly uses `open/defaultOpen/onOpenChange`, but STATUS-QUO+ should not create dead vocabulary.

4. Form registry entries reference prop concepts not present in `VOCABULARY_REGISTRY`.
   Evidence: `FormRootProp` registry lists `UseZodFormReturnProp` and `ZodSchemaProp` (`src/props/registry.ts:622`, `src/props/registry.ts:625`), and those types exist in component props (`src/props/components/form.prop.ts:8`, `src/props/components/form.prop.ts:17`), but the vocabulary registry section ends without those entries (`src/props/registry.ts:641`).
   Fix: either add form vocabulary records for `ZodSchemaProp`, `UseZodFormReturnProp`, `UseZodFormOptionsProp`, and `FieldErrorMessageProp`, or remove them from component vocabulary arrays if form internals are intentionally outside shared vocabulary. The lower-risk fix is to add registry entries.

5. Several component records have empty vocabulary arrays despite using existing shared concepts.
   Evidence: `SidebarItemProp` has `id`, `label`, `disabled`, and `children` (`src/props/components/layout.prop.ts:70`, `src/props/components/layout.prop.ts:71`, `src/props/components/layout.prop.ts:75`, `src/props/components/layout.prop.ts:77`), but its registry entry has `vocabulary: []` (`src/props/registry.ts:321`). `ChoiceOptionProp` has `label`, `value`, `disabled`, `description` (`src/props/components/data-entry.prop.ts:61`), but its registry entry is empty (`src/props/registry.ts:374`).
   Fix: fill registry arrays with existing vocabulary concepts where they apply. Do not force every field in data-shape types into shared vocabulary.

### Vague props

1. `ExtraProp` is acceptable but must stay scoped.
   Evidence: it is documented as top-right page action slot and explicitly cites Ant Design naming (`src/props/vocabulary/content.prop.ts:16`); `PageContainerProp.extra` uses it (`src/props/components/layout.prop.ts:22`).
   Fix: keep `ExtraProp`; forbid using `extra` outside page/header action slots unless documented.

2. `HandlerProp` is too broad for naming, but useful for no-argument actions.
   Evidence: it is defined as `() => void | Promise<void>` (`src/props/vocabulary/shared.prop.ts:22`) and used for confirm/retry/refetch-style actions (`src/props/registry.ts:546`, `src/props/registry.ts:550`, `src/props/registry.ts:566`).
   Fix: keep it for no-argument command callbacks. Do not replace typed handlers like `OnSortChangeProp` or `OnSelectChangeProp`.

### Duplicate names

1. `GapProp`, `StackGapProp`, and `InlineGapProp`.
   Evidence: `StackGapProp` and `InlineGapProp` are both `gap` values separated by axis (`src/props/vocabulary/layout.prop.ts:12`, `src/props/vocabulary/layout.prop.ts:15`); `GapProp` is a deprecated alias to `StackGapProp` (`src/props/vocabulary/layout.prop.ts:24`); component props expose the same prop name `gap` (`src/props/components/layout.prop.ts:35`, `src/props/components/layout.prop.ts:40`).
   Fix: define one `GapProp = "xs" | "sm" | "md" | "lg" | "xl"` and let Stack/Inline constrain by component docs or use `gap?: Exclude<GapProp, "xl">` for Inline if `xl` remains unsupported. Remove `StackGapProp`/`InlineGapProp` from canonical registry or mark them compatibility aliases.

2. `PageTitleProp` and `TitleProp`.
   Evidence: `PageTitleProp` is a direct alias of `TitleProp` (`src/props/vocabulary/navigation.prop.ts:18`, `src/props/vocabulary/navigation.prop.ts:19`), and the registry says it is an alias (`src/props/registry.ts:233`, `src/props/registry.ts:236`).
   Fix: not urgent. Keep `PageTitleProp` as a context alias because it is public and self-documenting, but mark `TitleProp` as the canonical concept in the registry. This is not in the minimum breaking cleanup.

### Duplicate concepts

1. Component variants are not one global concept.
   Evidence: `ButtonVariantProp` is visual style (`src/props/vocabulary/interaction.prop.ts:6`), `ConfirmVariantProp` is confirm emphasis (`src/props/vocabulary/interaction.prop.ts:26`), `AlertVariantProp` is alert banner tone (`src/props/vocabulary/interaction.prop.ts:32`), and `PageContainerVariantProp` is page shell layout (`src/props/vocabulary/layout.prop.ts:9`).
   Fix: keep component-specific variant props. A global `VariantProp` would erase distinct meanings.

2. Density is not one global concept.
   Evidence: `PageDensityProp` affects page padding/control heights (`src/props/vocabulary/layout.prop.ts:6`), while `TableDensityProp` is row density and explicitly not the same (`src/props/vocabulary/layout.prop.ts:18`).
   Fix: keep `PageDensityProp` and `TableDensityProp`; keep `DensityProp` deprecated as `PageDensityProp` only for compatibility (`src/props/vocabulary/layout.prop.ts:21`).

3. Tone vs variant is mixed but not automatically wrong.
   Evidence: `StatusToneProp` is badge/status pill color mapping (`src/props/vocabulary/interaction.prop.ts:29`); `AlertVariantProp` uses a `variant` prop for alert tone (`src/props/vocabulary/interaction.prop.ts:32`, `src/props/components/feedback.prop.ts:44`).
   Fix: keep existing public names. New status-like color props should use `tone`; new multi-style recipes should use `variant`.

## B. Token Problems And Fixes

### Domain leaks

1. `--tracking-internal`, `--tracking-seller`, and `--tracking-yamato` leak product/domain vocabulary.
   Evidence: defined in light theme (`src/tokens/foundation.css:33`, `src/tokens/foundation.css:34`, `src/tokens/foundation.css:35`), redefined in dark theme (`src/tokens/foundation.css:148`, `src/tokens/foundation.css:149`, `src/tokens/foundation.css:150`), and exported as Tailwind colors (`src/styles/index.css:56`, `src/styles/index.css:57`, `src/styles/index.css:58`).
   Fix: delete the token definitions and Tailwind exports. If equivalent colors are needed, map usage to semantic/chart/wa tokens.

2. `--code-badge-*` may be stale component-domain residue.
   Evidence: badge primitives still define `--code-badge-height`, `--code-badge-gap`, `--code-badge-padding-x`, and alpha tokens (`src/tokens/primitives/badge.css:7`, `src/tokens/primitives/badge.css:8`, `src/tokens/primitives/badge.css:9`, `src/tokens/primitives/badge.css:10`).
   Fix: verify whether a CodeBadge component still exists before deletion. If absent, rename to neutral badge subcomponent tokens or remove. This is not as unarguable as `--tracking-*`.

### Palette-vs-semantic layering

1. Raw palettes are present but not a defect by themselves.
   Evidence: semantic HSL role tokens exist first (`src/tokens/foundation.css:6`, `src/tokens/foundation.css:12`, `src/tokens/foundation.css:20`, `src/tokens/foundation.css:25`, `src/tokens/foundation.css:27`, `src/tokens/foundation.css:29`), while `--wa-*`, `--gray-*`, and `--blue-*` are explicitly decorative/data-viz/fine shading primitives (`src/tokens/foundation.css:37`, `src/tokens/foundation.css:54`). Tailwind itself exposes named color palettes, Radix Themes exposes color scales, and W3C DTCG allows grouped tokens with `$type`/`$value`; none requires semantic-only public tokens.
   Fix: keep primitive palettes public but document that component CSS must prefer semantic/component tokens for UI roles.

2. Tailwind chart colors use hard-coded hex values.
   Evidence: `--color-chart-1` through `--color-chart-6` are literal hex exports (`src/styles/index.css:50`, `src/styles/index.css:55`) while equivalent palette tokens exist (`src/tokens/foundation.css:44`, `src/tokens/foundation.css:46`, `src/tokens/foundation.css:48`, `src/tokens/foundation.css:41`, `src/tokens/foundation.css:47`).
   Fix: map chart exports to existing wa/semantic tokens. This is hygiene, not a required STATUS-QUO+ blocker.

### Missing scales

1. Inline spacing lacks `xl`, while stack spacing has `xl`.
   Evidence: `--space-stack-xl` exists (`src/tokens/primitives/layout.css:11`), but inline stops at `--space-inline-lg` (`src/tokens/primitives/layout.css:12`, `src/tokens/primitives/layout.css:15`); prop types mirror that (`src/props/vocabulary/layout.prop.ts:13`, `src/props/vocabulary/layout.prop.ts:16`).
   Fix: either add `--space-inline-xl` and allow `GapProp` `xl` everywhere, or explicitly document that Inline excludes `xl`. For minimum churn, document the exception.

2. Radius/shadow scales are small but coherent enough.
   Evidence: base radius and three shadows exist (`src/tokens/foundation.css:72`, `src/tokens/foundation.css:73`, `src/tokens/foundation.css:74`, `src/tokens/foundation.css:75`); Tailwind theme maps radius variants from `--radius` (`src/styles/index.css:59`, `src/styles/index.css:60`, `src/styles/index.css:61`).
   Fix: no required action.

## C. Draft Ruleset

1. Every exported component prop type must have a `COMPONENT_PROP_REGISTRY` entry.

2. Every name listed in a component registry `vocabulary` array must exist in `VOCABULARY_REGISTRY`.

3. Registry arrays must include existing shared concepts used directly by the component prop type: `id`, `className`, `children`, `disabled`, `label`, `value`, `defaultValue`, `onValueChange`, `open`, and `onOpenChange`.

4. Do not create a new vocabulary name when an existing name has the same prop spelling, value kind, and semantic role.

5. Do not collapse component-specific variants into a global `VariantProp` unless the value set and meaning are the same across components.

6. Use `variant` for mutually exclusive recipe/layout/style modes; use `tone` for semantic color intent; keep existing public names until a major-version migration plan exists.

7. Use `PageDensityProp` for page/subtree density and `TableDensityProp` for table row density. Do not introduce a generic `DensityProp` except as a deprecated compatibility alias.

8. Use one canonical `GapProp` concept for the public `gap` prop. Components may constrain supported values, but the registry should not treat stack and inline gaps as separate concepts.

9. Context aliases such as `PageTitleProp` may exist only if they are direct aliases and the registry names the canonical concept.

10. Controlled/uncontrolled vocabulary should be registered when used: `ValueProp`, `DefaultValueProp`, and `OnValueChangeProp`; `OpenProp`, `DefaultOpenProp`, and `OnOpenChangeProp`.

11. Package tokens must be domain-neutral. Token names may describe UI roles, primitives, components, or decorative palettes, but not app/customer/domain entities.

12. Component CSS should use semantic or component tokens for UI roles. Raw palette tokens are allowed for charts, tags, data visualization, and documented decorative accents.

13. Tailwind `@theme` exports must reference package tokens where equivalent tokens exist; literal color exports are allowed only for deliberate one-off constants with comments.

14. Token layers remain foundation -> primitive/component -> styles. Do not require a breaking W3C JSON migration unless a tooling pipeline needs it.

15. Add an audit that checks registry references, forbidden token prefixes (`--tracking-*`), and duplicate alias declarations. Do not block on broad public prop renames.

## Confidence

82/100.
