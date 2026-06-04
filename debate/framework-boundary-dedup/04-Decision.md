# ADR: Framework Boundary and Duplicate Concepts

## Status

Decided. This decision feeds a future post-7.0.0 package-boundary pass; it is not a current-release implementation order.

## Context

The topic asks whether `@godxjp/ui` should be a primitives-only core, a curated domain-neutral kit, or the current broad package with deduplication only (`00-Topic.md:27-37`). The hard constraints are domain-neutrality and no redundant wrappers (`00-Topic.md:39-42`), while the migration issue asks for missing primitives and explicitly excludes app layouts, i18n providers, locale switchers, and domain widgets from that request (`context/issue-82.md:5-9`).

The bus record shows three durable facts. First, LEAN proved current coupling: AppProvider owns persistence, request headers, and singleton i18n/datetime sync; PrefetchLink couples React Router and TanStack Query; Topbar/PageContainer include product/router assumptions (`01-Bus.md:50-54`). Second, KIT proved peer systems are broader than Radix-style primitives: Mantine, Ant, MUI, and Carbon ship shells, layout, date, skeleton, badge/card, and hierarchical selection families (`01-Bus.md:34-39`). Third, SKEPTIC correctly separated component extraction from data/config cleanup: hardcoded lists and status maps can often become props, while router/query/provider singletons are runtime adapters (`01-Bus.md:42-47`).

## Options

- LEAN: primitives-only core; extract app-adjacent pieces and merge duplicates.
- KIT: curated batteries-included but domain-neutral kit; extract app data/policy and true runtime adapters.
- STATUS-QUO: keep everything, merge only strict duplicates.

## Decision

Choose KIT, narrowed by SKEPTIC's adapter rule.

Core may include domain-neutral, reusable kit concepts, not just low-level primitives. However, core must not force GODX locale catalogs, request-header policy, singleton app i18n, React Router, TanStack Query, or product chrome. When domain coupling is only a hardcoded data list, label map, or option set, the smaller fix is to make that data a prop/slot. When the component imports or requires a foreign runtime/provider/router/query client, extract the adapter whole to the app layer or a future integration package.

Winner margin: KIT by 16 points over LEAN and STATUS-QUO.

## Rubric Table

| Option     |                                                  Boundary-coherence /25 |                                                                                     Reusability /25 |                                                              Maintainability /20 |                                                   Standards-alignment /15 |                                                               Extraction-cost /15 | Total /100 |
| ---------- | ----------------------------------------------------------------------: | --------------------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------: | ------------------------------------------------------------------------: | --------------------------------------------------------------------------------: | ---------: |
| LEAN       |       24 - clearest domain-neutral boundary and best match to rule #19. | 14 - throws away reusable shell, selector, skeleton, and advanced-control concepts that peers ship. |         18 - lowest dependency surface, but risks duplicate app implementations. |   9 - overweights Radix/headless peers despite evidence for broader kits. |                                         7 - highest migration/package split cost. |         68 |
| KIT        | 21 - coherent if hardcoded app policy and runtime adapters are removed. |                    23 - keeps high-value reusable kit concepts while rejecting fixed business data. | 15 - manageable with optional subpaths, but still broader than a primitive core. |       14 - best match to Mantine/MUI/Ant/Carbon breadth cited in the bus. | 11 - moderate churn: props/slots and selective extraction, not wholesale removal. |         84 |
| STATUS-QUO |         10 - preserves concrete provider/router/query/product coupling. |                                                       22 - maximum short-term consumer convenience. |                9 - largest dependency/policy surface and redundant wrapper risk. | 12 - peers support broad kits, but not GODX-specific runtime assumptions. |                                     15 - cheapest migration because little moves. |         68 |

## Per-Component Verdict

| Component                      | Verdict                                   | Reason                                                                                                                                         |
| ------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| LocalePicker                   | KEEP-IN-CORE                              | The problem is `APP_LOCALES`/AppProvider fallback, not the select concept; accept caller locales and no required provider (`01-Bus.md:42-45`). |
| TimezonePicker                 | KEEP-IN-CORE                              | Already has caller options before context fallback, so make that the core path (`01-Bus.md:42-45`).                                            |
| DateFormatPicker               | KEEP-IN-CORE                              | Keep as configurable preference select; move fixed format enum/provider policy out.                                                            |
| TimeFormatPicker               | KEEP-IN-CORE                              | Keep as configurable 12h/24h preference select; fixed option policy becomes props.                                                             |
| CountrySelect                  | EXTRACT(→app layer)                       | Country option display is a domain dataset/display policy over Select, not a core primitive (`context/audit-findings.md:39`).                  |
| CountryOptionLabel             | EXTRACT(→app layer)                       | Flag/native-name/country-code rendering is the domain part of CountrySelect.                                                                   |
| AppProvider                    | EXTRACT(→app layer)                       | Persistence, request headers, and singleton sync are app runtime policy (`01-Bus.md:35-38`).                                                   |
| formatDate                     | EXTRACT(→app layer)                       | The singleton/default-context formatter is app display policy; core components should accept formatted labels or explicit locale options.      |
| i18n singleton/catalog         | EXTRACT(→app layer)                       | Fixed catalogs and module globals are app infrastructure, not UI component chrome (`01-Bus.md:35-38`).                                         |
| AppShell                       | KEEP-IN-CORE                              | Slot-only shell/layout is a standard kit concept; keep without product/runtime assumptions (`01-Bus.md:34-39`).                                |
| Sidebar                        | KEEP-IN-CORE                              | Navigation shell is reusable if product branding/data objects become composition slots.                                                        |
| Topbar                         | KEEP-IN-CORE                              | Keep as AppBar/Header concept after replacing product/project/search/notification/tweaks props with slots (`01-Bus.md:35-37`).                 |
| PageContainer                  | KEEP-IN-CORE                              | Page framing can stay, but router breadcrumbs/admin assumptions must become caller nodes or adapters (`01-Bus.md:42-45`).                      |
| FilterBar                      | MERGE(→Toolbar)                           | Filtering is common, but current component mixes toolbar layout, filter state, clear action, and i18n copy (`context/audit-findings.md:29`).   |
| FilterGroup                    | MERGE(→Fieldset/Group)                    | It is a labeled grouping primitive with filter-specific naming; use generic group semantics (`context/audit-findings.md:30`).                  |
| DataState                      | EXTRACT(→app layer)                       | Current public contract is TanStack Query lifecycle, so it is an adapter even if the rendered states are generic (`01-Bus.md:35-39`).          |
| InfiniteQueryState             | EXTRACT(→app layer)                       | Infinite-query typing and GODX page-shape flattening belong in a data adapter.                                                                 |
| flattenItemPages/query helpers | EXTRACT(→app layer)                       | Data-shape normalization is API/application policy.                                                                                            |
| MutationFeedback               | MERGE(→AlertQueryError/app query adapter) | It is a thin pending/error gate over alert feedback (`01-Bus.md:26-30`).                                                                       |
| QueryRefetchButton             | MERGE(→Button/app query adapter)          | It is a Button wired to `query.refetch()` and `isFetching` (`01-Bus.md:26-30`).                                                                |
| PrefetchLink                   | EXTRACT(→app layer)                       | It imports React Router and TanStack Query and owns prefetch policy (`01-Bus.md:42-46`).                                                       |
| Stack                          | MERGE(→Flex)                              | Same one-div gap wrapper concept as Inline; keep aliases only as API sugar if needed (`01-Bus.md:26-30`).                                      |
| Inline                         | MERGE(→Flex)                              | Horizontal cluster is useful, but implementation/props should share one direction-aware primitive (`01-Bus.md:42-46`).                         |
| ChoiceField                    | MERGE(→Field/FormField)                   | Label/description/help wiring belongs to the generic Field concept (`context/audit-findings.md:40`).                                           |
| Skeleton                       | KEEP-IN-CORE                              | Export the generic base skeleton requested by consumers (`context/issue-82.md:15-20`).                                                         |
| SkeletonRows                   | KEEP-IN-CORE                              | Generic enough as a loading recipe over the base Skeleton.                                                                                     |
| SkeletonTable                  | KEEP-IN-CORE                              | Keep as DataTable companion/loading recipe; avoid drift with DataTable (`context/audit-findings.md:27`).                                       |
| SkeletonDetail                 | KEEP-IN-CORE                              | Generic detail-page loading recipe.                                                                                                            |
| SkeletonCard                   | MERGE(→SkeletonStat)                      | It is a stat/KPI skeleton, not a generic card skeleton (`context/audit-findings.md:28`).                                                       |
| Cascader                       | KEEP-IN-CORE                              | Not a duplicate of TreeSelect: path/column cascade interaction is a distinct user model (`01-Bus.md:42-46`).                                   |
| TreeSelect                     | KEEP-IN-CORE                              | Standard hierarchical selection control; fix ARIA/API flags, do not merge into Cascader.                                                       |
| Badge                          | KEEP-IN-CORE                              | Base badge variants are neutral; make status maps injectable instead of extracting Badge (`01-Bus.md:42-46`).                                  |
| StatusBadge/status map         | MERGE(→Badge)                             | One badge family should own status presentation; app-specific statuses become data.                                                            |
| Card                           | KEEP-IN-CORE                              | Neutral surface primitive with slots; peers universally ship Card (`01-Bus.md:50-54`).                                                         |
| StatCard                       | KEEP-IN-CORE                              | Dashboard stat tile is reusable when label/value/delta are caller data; keep separate from Card.                                               |
| CardStat alias/concept         | MERGE(→StatCard)                          | One stat tile concept should survive.                                                                                                          |
| Calendar                       | KEEP-IN-CORE                              | Standalone date-grid primitive is standard; normalize API rather than collapse by default (`context/audit-findings.md:38`).                    |
| DatePicker                     | KEEP-IN-CORE                              | Canonical input plus calendar popover data-entry component.                                                                                    |
| ResponsiveGrid                 | KEEP-IN-CORE                              | A grid primitive belongs, but the API must grow beyond a narrow 2/3/4 enum (`context/audit-findings.md:7`).                                    |
| PageInset                      | MERGE(→PageContainer)                     | Single gutter wrapper is too thin and tied to page layout (`context/audit-findings.md:11`).                                                    |
| Collapsible                    | KEEP-IN-CORE                              | Disclosure/collapsible is a standard primitive; add tokenized value or document re-export policy (`context/audit-findings.md:44`).             |
| Dialog                         | KEEP-IN-CORE                              | Modal dialog semantics are distinct from Sheet; split AlertDialog behavior if needed.                                                          |
| Sheet                          | KEEP-IN-CORE                              | Directional slide-over/drawer interaction is distinct from Dialog (`01-Bus.md:42-46`).                                                         |
| DialogConfirm                  | MERGE(→AlertDialog/app preset)            | Confirm behavior changes semantics and should not be hidden inside base Dialog (`context/audit-findings.md:26`).                               |
| Select                         | KEEP-IN-CORE                              | Foundational select primitive.                                                                                                                 |
| SearchSelect                   | KEEP-IN-CORE                              | Searchable select/combobox convenience is a reusable data-entry concept.                                                                       |
| Autocomplete                   | MERGE(→SearchSelect)                      | Bus identifies it as a deprecated thin wrapper over SearchSelect (`01-Bus.md:26-30`).                                                          |

## Contested Duplicate Rulings

- Stack vs Inline: REAL duplicate at implementation/concept layer, so merge into a direction-aware Flex/Stack primitive. SKEPTIC is right that horizontal and vertical aliases may remain public conveniences, but they should not be separate implementations or divergent APIs (`01-Bus.md:42-46`).
- Cascader vs TreeSelect: DISTINCT, keep both. Cascader's path arrays, active columns, `changeOnSelect`, and hover/click expansion differ from TreeSelect's selected keys, expanded tree keys, check strategy, and tree panel (`01-Bus.md:42-46`).
- Dialog vs Sheet: DISTINCT, keep both. Dialog/AlertDialog semantics and Sheet side variants represent different overlay contracts; Radix/shadcn keeping them separate supports the ruling (`01-Bus.md:42-46`).

## Consequences

- Future boundary work should first remove hardcoded data/provider assumptions from components that remain core.
- Whole-component extraction is reserved for runtime adapters and app-owned datasets/policy: AppProvider, singleton i18n/formatting, router/query adapters, and CountrySelect.
- Core grows toward a curated kit: shell/layout primitives, Field, Skeleton, Badge, Card, DatePicker/Calendar, TreeSelect/Cascader, and stronger Grid/Flex APIs.
- Optional subpaths may exist, but root/default exports must not force React Router, TanStack Query, GODX request headers, or app locale catalogs.
- Dedup work should prefer shared primitives and aliases over destructive removals where consumer vocabulary is valuable.

## Dissent

- LEAN dissent/risk: strongest unresolved risk is package/version fragmentation. Extracting configurable selectors and shell concepts into `@godxjp/ui-app` may make consumers rebuild common UI or keep two packages synchronized without proving better reuse (`01-Bus.md:42-47`).
- KIT dissent/risk: strongest unresolved risk is boundary creep. Calling components "curated kit" can normalize runtime coupling unless the adapter rule is enforced strictly (`01-Bus.md:42-47`).
- STATUS-QUO dissent/risk: strongest unresolved risk is preserving the largest dependency and policy surface. Agreement that something is useful is not evidence that it belongs in core (`01-Bus.md:42-47`).
