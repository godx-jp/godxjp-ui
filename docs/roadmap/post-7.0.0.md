# @godxjp/ui — Roadmap after 7.0.0

Master implementation plan consolidating: issue #82 (missing primitives), issue #83 +
`debate/framework-boundary-dedup` (boundary/dedup), and `debate/props-vocab-token-consistency`
(vocabulary + token standardization). Sequenced so each release tells one coherent story and every
breaking change is paid once.

Every milestone ends with the same gate: `pnpm verify:release` (typecheck · lint · check:mcp-sync ·
check:mcp-orphans · build · test) green → verify in the MF consumer (tsc + vite build, e2e where it
applies) → `pnpm release` → update MF. New components ship a story + docs + MCP entry (parity guards).

---

## ✅ 7.0.0 — naming cleanup + #82 P1 (DONE, published)
Removed 5, renamed 3, merged 3 (StatusBadge→Badge, TabsItems→Tabs, SwitchField→ChoiceField+Switch),
added Avatar/Separator/Skeleton/Toggle/ToggleGroup/AspectRatio/Progress. Kept Sheet. MF migrated.

## 🩹 7.0.1 — dead-token cleanup (PATCH, fast, non-breaking)
The domain tokens `--tracking-yamato / --tracking-seller / --tracking-internal` survived CodeBadge's
removal (`src/styles/index.css:56-58`, `theme/example.service.css`, `lib/__tests__/theme-tokens-*`).
They are dead + violate rule #19. Remove the vars, the `--color-tracking-*` mappings, and the test
assertions. Pure deletion → patch.

## 🔼 7.1.x → 7.4.x — #82 P2/P3 primitives (MINOR, additive, low-risk)
Ship in small additive minors (each: ui/ wrapper + group export + story + docs + MCP entry):
- **7.1 overlays/nav:** Accordion, ContextMenu, HoverCard, Menubar, NavigationMenu (Radix).
- **7.2 layout/scroll:** bottom-sheet **Drawer** (vaul, distinct from side Sheet — the reserved name),
  Resizable (react-resizable-panels), Carousel (embla).
- **7.3 form inputs:** InputOTP, Combobox (single+multi, builds on the Select engine), PasswordInput,
  TimeInput, Rating, TagInput.
- **7.4 hooks:** useIsMobile, useMediaQuery (the `useBreakpoint` family).

## 🧱 8.0.0 — CONSISTENCY pass (BREAKING): vocabulary + tokens + concept merges
The one breaking release that makes the API uniform. Three coordinated workstreams:

### 8a. Prop-vocabulary standardization  ← rules + exact set finalized by `debate/props-vocab-token-consistency`
- Collapse duplicate prop names to one concept: `GapProp` (drop Inline/StackGapProp), `VariantProp`
  (drop Button/Alert/Confirm/PageContainerVariant — keep per-component *value enums* only where truly
  distinct), `DensityProp` (drop Page/TableDensity), `TitleProp` (drop PageTitle).
- Adopt the full controlled vocabulary: `value`/`defaultValue`/`onValueChange`, `open`/`defaultOpen`/
  `onOpenChange`; generic `SizeProp`/`ToneProp`. Migrate ad-hoc `onChange`/`on*` to the standard names.
- Every component prop must resolve to a `props/registry.ts` entry; add a **vocabulary-coverage check**
  (CI guard) so new props can't drift.

### 8b. Token standardization (W3C Design-Tokens / Style-Dictionary 3-tier)
- Three tiers: **primitive** (raw palette `--gray-*`/`--blue-*`, spacing scale) → **semantic**
  (`--primary`, `--destructive`, `--muted`…) → **component** (`--card-*`, `--control-*`). Public/consumer
  surface = semantic only; raw palette is private/internal.
- Normalize scales (space, radius, size, z-index, motion) into documented, evenly-stepped sets.
- Add a **token-governance check** (extend the existing token tests): no raw palette in component CSS,
  no domain tokens, every semantic token has a `-foreground` pair where it's a surface.

### 8c. Concept merges (from the boundary debate)
- `Stack` + `Inline` → one direction-aware **`Flex`** (keep Stack/Inline as thin aliases).
- `ChoiceField` → **`Field`** · `FilterBar` → **`Toolbar`** · `FilterGroup` → `Fieldset`.
- `MutationFeedback` → `Alert`'s query-error preset · `QueryRefetchButton` → `Button` recipe.
- `SkeletonCard` → `SkeletonStat` · `PageInset` → `PageContainer` slot · `DialogConfirm` → `AlertDialog` preset.
- Decouple (data/policy → prop/slot, stay in core): *Pickers (drop `APP_LOCALES`), AppShell/Sidebar/
  Topbar/PageContainer (product/router → slots), Badge (injectable status map), ResponsiveGrid (richer API).

## 📦 9.0.0 — PACKAGE BOUNDARY (BREAKING): extract runtime adapters → `@godxjp/ui-app`
Per the boundary ADR (KIT + adapter rule): extract whole-components that import a foreign runtime/provider.
- New package `@godxjp/ui-app` (or `@godxjp/ui/integrations` subpath): AppProvider, `formatDate`, i18n
  singleton/catalog, CountrySelect, DataState, InfiniteQueryState, query flatten helpers, PrefetchLink.
- Core's root/default exports must not force React Router, TanStack Query, GODX headers, or locale catalogs.
- Codemod + migration guide for consumers (MF first).

---

## Cross-cutting (write rules, not just code)
- **RULES** from the vocab/token debate → write into: `docs/` (a vocabulary + token standard doc),
  the `@godxjp/ui-mcp` rules data (so agents follow them), and the `godxjp-ui-audit` linter (enforce in
  consumers). The MCP `prop-vocabulary` + `tokens` data must mirror the canonical set.
- Keep MF as the live consumer/proving ground for every breaking step (verify before publish).
- One ADR per breaking decision under `debate/`; one tracking issue per major (#82, #83, + new for 8.0.0/9.0.0).

## Sequencing rationale
7.0.1 (bugfix) and 7.1–7.4 (additive) ship NOW with zero/again-additive risk. 8.0.0 batches ALL the
breaking vocab/token/merge churn into ONE migration (consumers pay once). 9.0.0 is a separate, bigger
architectural split (package extraction) so it isn't rushed under 8.0.0's deadline.
