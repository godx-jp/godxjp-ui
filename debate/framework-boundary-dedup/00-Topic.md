# Debate — Where is the boundary of @godxjp/ui as a UI FRAMEWORK?

## Question

Evaluate the component set of `@godxjp/ui` **purely on each component's NATURE** (NOT on where/whether
it is currently used in any app) against four questions:

1. **Membership** — does it genuinely belong in a general-purpose UI framework, or is it an
   app/domain/business concern that should live in the consuming app (or a separate `@godxjp/ui-app` package)?
2. **Necessity** — does the component need to exist at all (does it earn its place / pull its weight)?
3. **Duplicate concept** — does it duplicate a concept another component already owns?
4. **Mergeable concept** — could two components be unified into one concept?

Produce a categorized verdict per component: **KEEP-IN-CORE / EXTRACT (app-layer) / REMOVE (unnecessary) /
MERGE (into X)**. Judge purely on the component's concept and domain-neutrality, not on usage.

## Candidate concerns to weigh (non-exhaustive; from the 70-agent audit in context/audit-findings.md)

- **Domain/app-coupled?** CountrySelect, LocalePicker, TimezonePicker, DateFormatPicker, TimeFormatPicker,
  AppProvider + formatDate + the i18n singleton, FilterBar/FilterGroup (domain word "Filter"),
  the TanStack-Query helpers (DataState, InfiniteQueryState, MutationFeedback, QueryRefetchButton, PrefetchLink),
  the app-shell chrome (AppShell, Sidebar, Topbar, PageContainer, ShellApp).
- **Duplicate / mergeable concepts?** Stack vs Inline (one Flex?), ChoiceField vs SwitchField, Select vs
  SearchSelect vs Autocomplete vs Combobox, Skeleton family (Table/Card/Rows), Cascader vs TreeSelect,
  Dialog vs Sheet vs (future Drawer), Badge vs StatusBadge, Card vs CardStat/StatCard, Calendar vs DatePicker.
- A "primitive" that is a near-zero-logic wrapper (Collapsible, ResponsiveGrid, PageInset…) — does it earn existence?

NOTE: the source tree is being refactored concurrently (7.0.0). Judge the CONCEPT, ignore transient rename states.

## The discrete OPTIONS (framework-boundary philosophy)

- **Option LEAN — Primitives-only core.** A UI framework ships domain-neutral primitives + layout + a11y
  interaction only. Aggressively EXTRACT app/domain/opinionated components to a separate `@godxjp/ui-app`
  package: all the \*Picker preference widgets, CountrySelect, AppProvider/formatDate/i18n, app-shell chrome,
  FilterBar, query-state helpers. Merge every duplicate concept. Smallest, purest core.
- **Option KIT — Curated batteries-included (domain-neutral).** Keep broadly-reusable app-adjacent
  components (app shell, config-driven domain-neutral pickers, query helpers) because peer systems (MUI,
  Mantine, Ant) ship such kits and they add real value; EXTRACT only genuinely business/domain-coupled
  pieces (hardcoded locale/country data). Merge clear duplicates only.
- **Option STATUS-QUO — Keep all, dedup-only.** Keep every component; address ONLY true duplicate concepts
  by merging; extract nothing.

## Hard constraints

- The library's own rule #19 = domain-neutral ("no service-specific anything"). Rules #31/#32 = no wrapper/redundant.
- Real comparison: what do Radix, MUI, Mantine, Ant, Chakra, Fluent, Carbon, shadcn actually ship vs leave to apps?
- This debate informs a FUTURE package-boundary pass (post-7.0.0), so extraction cost is a real but secondary factor.

## Scoring rubric (Judge scores each option; weights sum 100)

- **Framework-boundary coherence & purity** — 25
- **Reusability / real consumer value of what stays** — 25
- **Maintainability & dependency surface** — 20
- **Standards alignment (what peer design systems actually ship vs extract)** — 15
- **Extraction / migration cost** — 15

## Roster

ADV-LEAN, ADV-KIT, ADV-SQ (status-quo), SKEPTIC (red-team all), JUDGE (scores; writes 04-Decision.md; dissent).

## Status

decided
