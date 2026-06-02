# ADV-STRICT research

## Assumptions

- Public component props are part of the design-system contract; internal helper types may exist, but exported component prop names must be traceable to `VOCABULARY_REGISTRY`.
- A "canonical vocabulary" means one prop name per concept and one concept per prop name. Component-specific implementation detail may live behind that prop, but the public prop concept does not fork.
- Token public surface means CSS variables and Tailwind `@theme` variables that downstream apps can consume after importing `@godxjp/ui/styles`.
- External facts used here: Radix Themes exposes consistent prop names such as `size`, `variant`, `color`, `asChild`, and common margin props on components; Radix spacing uses a 9-step scale and Theme `scaling`; MUI System maps `sx` system keys to theme entries; W3C DTCG defines a standard exchange format for design tokens and token aliases; Style Dictionary is forward-compatible with DTCG and historically organizes token paths by category/type/item.

## VOCAB problems and fixes

1. Missing controlled/uncontrolled vocabulary.
   Evidence: `ValueProp` and `OnChangeProp` exist, and `OpenProp`/`OnOpenChangeProp` exist, but no `DefaultValueProp`, `OnValueChangeProp`, or `DefaultOpenProp` exists in `VOCABULARY_REGISTRY` (`src/props/registry.ts:24`, `src/props/registry.ts:29`, `src/props/registry.ts:79`, `src/props/registry.ts:80`). Real component props already use `defaultValue` and `onValueChange` locally (`src/props/components/data-entry.prop.ts:71`, `src/props/components/data-entry.prop.ts:85`, `src/props/components/navigation.prop.ts:81`, `src/props/components/navigation.prop.ts:82`).
   Fix: add generic `DefaultValueProp<T>`, `OnValueChangeProp<T>`, and `DefaultOpenProp`; migrate controlled inputs/selectors/tabs to `value`/`defaultValue`/`onValueChange` and overlays to `open`/`defaultOpen`/`onOpenChange`.

2. Duplicate gap concepts.
   Evidence: registry has `StackGapProp` and `InlineGapProp` as separate concepts (`src/props/registry.ts:164`, `src/props/registry.ts:169`), while `layout.prop.ts` also keeps deprecated `GapProp = StackGapProp` (`src/props/vocabulary/layout.prop.ts:24`). `StackProp` and `InlineProp` both expose the same public prop name `gap` (`src/props/components/layout.prop.ts:35`, `src/props/components/layout.prop.ts:40`).
   Fix: make one generic `GapProp = "xs" | "sm" | "md" | "lg" | "xl"` and use it for every `gap?:` prop. Direction belongs to component layout, not vocabulary.

3. Duplicate density concepts.
   Evidence: `PageDensityProp`, `TableDensityProp`, and deprecated `DensityProp` coexist (`src/props/vocabulary/layout.prop.ts:7`, `src/props/vocabulary/layout.prop.ts:19`, `src/props/vocabulary/layout.prop.ts:21`). The registry says table density is "NOT PageDensityProp" (`src/props/registry.ts:174`), but density classes retune both controls and tables together (`src/styles/density.css:7`, `src/styles/density.css:10`, `src/styles/density.css:27`, `src/styles/density.css:34`).
   Fix: make one `DensityProp = "compact" | "default" | "comfortable"` and use it anywhere density is public. Component internals may map unsupported values, but the vocabulary cannot fork.

4. Duplicate variant/tone concepts.
   Evidence: `ButtonVariantProp`, `ConfirmVariantProp`, `AlertVariantProp`, `PageContainerVariantProp`, `UploadVariantProp`, and inline `variant?:` unions exist (`src/props/vocabulary/interaction.prop.ts:7`, `src/props/vocabulary/interaction.prop.ts:27`, `src/props/vocabulary/interaction.prop.ts:33`, `src/props/vocabulary/layout.prop.ts:10`, `src/props/components/data-entry.prop.ts:294`, `src/props/components/data-display.prop.ts:45`, `src/props/components/navigation.prop.ts:83`). `StatusToneProp` is separate from alert/button variants even though its values overlap semantic intent (`src/props/vocabulary/interaction.prop.ts:30`).
   Fix: add generic `VariantProp` for visual treatment and generic `ToneProp` for semantic color intent. Rename component-specific `*VariantProp` to either `VariantProp` or `ToneProp` based on meaning. Badge `variant` with `success/warning/destructive/info/neutral` must become `tone?: ToneProp` plus `variant?: VariantProp`.

5. Duplicate title concepts.
   Evidence: `TitleProp` is "Primary heading text" (`src/props/vocabulary/content.prop.ts:7`), while `PageTitleProp` is registered as "Alias of TitleProp in page context" (`src/props/registry.ts:233`). `PageContainerProp.title` uses `PageTitleProp` (`src/props/components/layout.prop.ts:20`).
   Fix: delete `PageTitleProp` from public vocabulary; use `TitleProp` for every primary heading.

6. Vague `HandlerProp`.
   Evidence: `HandlerProp` is a void async/sync callback (`src/props/vocabulary/shared.prop.ts:22`) and is used for unrelated events: confirm, retry, query feedback (`src/props/registry.ts:546`, `src/props/registry.ts:550`, `src/props/registry.ts:566`). This loses event semantics.
   Fix: keep `HandlerProp` only as an internal helper or replace public use with event-specific canonical props: `OnConfirmProp`, `OnRetryProp`, `OnDismissProp`, or generic `OnActionProp` where the concept is actually an action.

7. Registry incompleteness: component prop registry references vocabulary names that are not in the vocabulary registry.
   Evidence: `FormRootProp` lists `UseZodFormReturnProp` and `ZodSchemaProp` in component vocabulary (`src/props/registry.ts:622`, `src/props/registry.ts:625`), but `VOCABULARY_REGISTRY` ends without defining either name (`src/props/registry.ts:290`). The types exist only under components (`src/props/components/form.prop.ts:8`, `src/props/components/form.prop.ts:17`).
   Fix: move exported form vocabulary concepts into `src/props/vocabulary/` and register them, or remove them from component vocabulary if they are component-local implementation types. The registry must be internally consistent.

8. Registry incompleteness: many exported component prop names have empty vocabulary arrays.
   Evidence: layout shell props are registered with empty vocabulary (`src/props/registry.ts:320`, `src/props/registry.ts:326`), several data-entry props are empty (`src/props/registry.ts:374`, `src/props/registry.ts:400`, `src/props/registry.ts:487`), and navigation item/status props are empty (`src/props/registry.ts:614`, `src/props/registry.ts:615`, `src/props/registry.ts:621`). Their source contains reusable names like `label`, `value`, `disabled`, `children`, `size`, and `variant` (`src/props/components/navigation.prop.ts:45`, `src/props/components/navigation.prop.ts:63`, `src/props/components/navigation.prop.ts:71`, `src/props/components/navigation.prop.ts:83`).
   Fix: audit every exported `*Prop`; every public property must map to a vocabulary prop or be explicitly marked internal/private with a reason.

9. Size vocabulary is not generic.
   Evidence: only `ButtonSizeProp` is registered (`src/props/registry.ts:186`), but `SwitchProp` has `size?: "sm" | "default"` and `StepsProp` has `size?: "default" | "small"` (`src/props/components/data-entry.prop.ts:99`, `src/props/components/navigation.prop.ts:63`).
   Fix: add `SizeProp` with canonical values and aliases policy (`sm`, not `small`, or vice versa; pick one). Components may constrain allowed values with `Extract<SizeProp, ...>`, but not invent public size words.

10. Ad-hoc `onChange` semantics collide.
    Evidence: `OnChangeProp` is a React input event handler (`src/props/vocabulary/shared.prop.ts:52`), while checkbox groups, date pickers, uploads, cascaders, transfer, pagination, and app settings use `onChange` for value changes of different payloads (`src/props/components/data-entry.prop.ts:72`, `src/props/components/data-entry.prop.ts:151`, `src/props/components/data-entry.prop.ts:307`, `src/props/components/navigation.prop.ts:38`, `src/props/components/app.prop.ts:51`).
    Fix: reserve `OnChangeProp` for native event handlers; controlled component state must use `OnValueChangeProp<T>`. Domain-setting controls use `onValueChange` unless they are form-native event pass-throughs.

## TOKEN problems and fixes

1. Domain tokens leak into the public surface.
   Evidence: `--tracking-internal`, `--tracking-seller`, and `--tracking-yamato` are defined in light and dark foundation tokens (`src/tokens/foundation.css:33`, `src/tokens/foundation.css:34`, `src/tokens/foundation.css:35`, `src/tokens/foundation.css:148`, `src/tokens/foundation.css:149`, `src/tokens/foundation.css:150`) and exported as Tailwind theme colors (`src/styles/index.css:56`, `src/styles/index.css:57`, `src/styles/index.css:58`).
   Fix: delete all tracking/domain tokens. Replace with semantic roles such as `--status-info`, `--status-muted`, `--status-attention` or component tokens under `--badge-*` if they are for badges.

2. Raw palette tokens are public beside semantic tokens.
   Evidence: semantic HSL roles exist (`--primary`, `--success`, `--warning`, `--info`, `--attention`) (`src/tokens/foundation.css:12`, `src/tokens/foundation.css:25`, `src/tokens/foundation.css:27`, `src/tokens/foundation.css:29`, `src/tokens/foundation.css:31`), but raw `--gray-*`, `--blue-*`, and decorative `--wa-*` tokens are also public (`src/tokens/foundation.css:40`, `src/tokens/foundation.css:55`, `src/tokens/foundation.css:65`) and exposed via Tailwind theme for wa colors (`src/styles/index.css:65`).
   Fix: keep primitive palettes in a private primitive layer, publish only semantic aliases and documented chart tokens. No consumer-facing `bg-wa-*`, `text-wa-*`, `gray-*`, or `blue-*` unless classified as primitive-private.

3. Three-tier layering is named incorrectly and blurred.
   Evidence: files under `src/tokens/primitives/` contain component tokens like `--card-*`, `--table-*`, `--badge-*`, `--pagination-*`, and `--filter-*` (`src/tokens/primitives/card.css:4`, `src/tokens/primitives/table.css:4`, `src/tokens/primitives/badge.css:4`, `src/tokens/primitives/navigation.css:4`, `src/tokens/primitives/navigation.css:8`).
   Fix: split into `primitive/`, `semantic/`, and `component/`. Component tokens must reference semantic/primitive tokens and be named by component, not stored under `primitives`.

4. Component tokens sometimes reference raw foundation directly instead of semantic aliases.
   Evidence: `--card-background` points to `--card`, `--card-foreground-token` to `--card-foreground`, `--card-border-token` to `--border` (`src/tokens/primitives/card.css:14`, `src/tokens/primitives/card.css:15`, `src/tokens/primitives/card.css:16`). That is a partial semantic indirection, but the naming `*-token` is inconsistent and not a DTCG-like path.
   Fix: introduce semantic names such as `--color-surface-card`, `--color-content-primary`, `--color-border-default`; then component tokens reference those: `--component-card-bg: var(--color-surface-card)`.

5. Chart tokens use hard-coded hex in `@theme`.
   Evidence: `--color-chart-1` through `--color-chart-6` are literal hex values in Tailwind theme, not references to design tokens (`src/styles/index.css:50`, `src/styles/index.css:55`).
   Fix: define chart semantic tokens in `src/tokens/semantic/color.css`, then export `--color-chart-*` as references only.

6. Missing canonical scales.
   Evidence: spacing has `--space-0` through `--space-12` with gaps (`src/tokens/foundation.css:97`, `src/tokens/foundation.css:107`), typography has only `xs` through `2xl` (`src/tokens/foundation.css:83`, `src/tokens/foundation.css:88`), and radius is a single base plus derived Tailwind values (`src/tokens/foundation.css:72`, `src/styles/index.css:59`, `src/styles/index.css:61`).
   Fix: define complete primitive scales for color, space, size, radius, shadow, font-size, line-height, and duration. Semantic and component layers may use a subset, but the primitive layer must be normalized.

7. Density overrides contain raw component values outside token files.
   Evidence: density classes assign raw checkbox/switch dimensions directly (`src/styles/density.css:12`, `src/styles/density.css:13`, `src/styles/density.css:36`, `src/styles/density.css:37`).
   Fix: move density step values into component tokens (`--component-switch-width-compact`, etc.) and make classes only select aliases.

8. Legacy/deleted component tokens remain.
   Evidence: `badge.css` still defines `--code-badge-*` tokens (`src/tokens/primitives/badge.css:7`, `src/tokens/primitives/badge.css:13`) while snapshot flags them as leftovers from removed CodeBadge (`debate/props-vocab-token-consistency/context/snapshot.md:19`).
   Fix: delete `--code-badge-*` unless a current exported component consumes them; if consumed, rename to neutral `--badge-*` component tokens.

9. Public semantic naming is inconsistent.
   Evidence: foreground pairs use `--primary-foreground`, but card uses `--card` and `--card-foreground`, while component aliases introduce `--card-foreground-token` (`src/tokens/foundation.css:12`, `src/tokens/foundation.css:13`, `src/tokens/foundation.css:8`, `src/tokens/foundation.css:9`, `src/tokens/primitives/card.css:15`).
   Fix: standardize semantic naming: `--color-bg-*`, `--color-fg-*`, `--color-border-*`, `--color-action-*`, `--color-status-*`; component layer uses `--component-{name}-{part}-{property}`.

## Draft RULESET

1. Every exported component prop type must be present in `COMPONENT_PROP_REGISTRY`.
2. Every public property inside an exported component prop type must map to exactly one entry in `VOCABULARY_REGISTRY`; empty vocabulary arrays are audit failures unless the component prop type has no public properties.
3. One concept gets one vocabulary name. Forbidden: `PageTitleProp` when `TitleProp` exists, `StackGapProp`/`InlineGapProp` when `GapProp` exists, and component-prefixed `*VariantProp` for the generic visual-treatment concept.
4. One vocabulary name gets one concept. Forbidden: `variant` carrying semantic tone values such as `success` or `warning`; those must be `tone`.
5. Controlled inputs and selection controls must use `value`, `defaultValue`, and `onValueChange`; native input event pass-through may use `onChange` only when the payload is a DOM event.
6. Open/closed components must use `open`, `defaultOpen`, and `onOpenChange`.
7. Public size uses `SizeProp`; public density uses `DensityProp`; public gap uses `GapProp`; public visual treatment uses `VariantProp`; public semantic color intent uses `ToneProp`.
8. Component-specific prop names are allowed only for domain-neutral concepts not shared anywhere else; once a second component needs the concept, it must move to vocabulary.
9. `PROP_ALIASES_FORBIDDEN` must map aliases to the canonical concept, not require disambiguation between duplicate concepts. "Disambiguate" entries are failures because the canonical vocabulary did not collapse the concept.
10. Registry audit must fail CI on: unregistered exported `*Prop`, vocabulary names referenced but absent from `VOCABULARY_REGISTRY`, duplicate concept aliases, and public props not traceable to vocabulary.
11. Tokens must be organized as primitive -> semantic -> component. Primitive tokens are raw scales; semantic tokens alias primitives by role; component tokens alias semantic tokens by component part/state.
12. Downstream public CSS/Tailwind theme exports must be semantic or component tokens only. Primitive palettes are private implementation detail unless explicitly documented as low-level escape hatches.
13. No domain nouns in package tokens. Forbidden examples: seller, yamato, internal, client app entity names, business workflow names.
14. Component CSS may not introduce raw hex, raw rem/px sizing, or raw shadows when an existing token scale can express the value; new values must first be added to the correct token tier.
15. Dark mode must override semantic tokens, not component tokens directly, except where component-specific contrast requires a documented component semantic.
16. Token audit must fail CI on public raw palette exports, domain token names, component tokens stored in primitive files, and literal chart/theme colors not backed by token references.

## External standards evidence

- Radix Themes Button exposes consistent public concepts: `asChild`, `size`, `variant`, `color`, `radius`, and `loading`, and the docs state the component supports common margin props: https://www.radix-ui.com/themes/docs/components/button
- Radix Themes spacing uses one 9-step space scale for spacing props and a Theme `scaling` setting for layout-affecting values: https://www.radix-ui.com/themes/docs/theme/spacing
- MUI System `sx` is a theme-aware superset of CSS, and system keys map to theme values such as `theme.spacing(value)`: https://mui.com/system/getting-started/the-sx-prop/ and https://mui.com/system/properties/
- W3C Design Tokens Community Group states its goal is standards for sharing design-system stylistic pieces at scale; the DTCG format includes token aliases/references: https://www.w3.org/groups/cg/design-tokens and https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/
- Style Dictionary says it is forward-compatible with the DTCG spec and documents category/type/item token organization: https://styledictionary.com/info/tokens/

## Confidence

91/100. The repository evidence is direct for the main conclusion. Confidence is not 100 because I did not read outside the permitted paths, so component implementation usage outside `src/props`, `src/tokens`, and `src/styles` may add more cleanup items.
