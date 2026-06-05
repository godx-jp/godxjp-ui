# Prop Vocabulary + Design Token Standards

These rules are normative for @godxjp/ui 8.0.0. They mirror `debate/props-vocab-token-consistency/04-Decision.md`.

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
23. Control sizing: an interactive control's box height/width MUST resolve from the `--control-height` tier (or its official steps `--control-height-{xs,sm,lg}`). Primitives MUST NOT bake in a control size via a literal length (`height: 2rem`) or an ad-hoc `calc(var(--control-height) ± <len>)` — the named tier carries the density-aware value, and per-instance size changes are the app's call via the `size` prop / `className`. Enforced by `pnpm check:control-sizing`.

Examples:

```ts
type SelectLikeProp<T = string> = {
  value?: ValueProp<T>;
  defaultValue?: DefaultValueProp<T>;
  onValueChange?: OnValueChangeProp<T>;
};
```

```tsx
<Badge tone="success" variant="outline">
  公開中
</Badge>
```

```css
@theme {
  --color-chart-1: var(--chart-1);
}
```
