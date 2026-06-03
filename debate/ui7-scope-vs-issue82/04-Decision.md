# ADR: @godxjp/ui 7.0.0 Scope

## Status

Accepted. 7.0.0 scope is **Option B: cleanup + #82 P1 primitive gaps**.

Winner: **Option B by 2 points over Option A**.

## Context

7.0.0 is already a hard breaking release with no deprecated aliases. The locked cleanup removes five domain/duplicate components, merges three duplicate surfaces, and renames three canonical concepts (`KeyValueGrid -> Descriptions`, `ProgressMeter -> Progress`, `CardStat -> StatCard`) (00-Topic.md:5-8, 00-Topic.md:32-35).

The audit is useful candidate evidence, but not a verdict. Its strongest findings show real design debt where components leak router, query, app-domain, or composition concerns: `PageContainer`, `Topbar`, `Sidebar`, `Select`, `Upload`, `Dialog`, query helpers, and app preference pickers are repeatedly cited in the bus as redesign-level issues, not simple cleanup renames (01-Bus.md:35-36, 01-Bus.md:43-45, 01-Bus.md:63-64).

Issue #82 is production evidence, not speculative parity work: a real migrator had to vendor standard primitives locally and requested P1 primitives that belong in a general UI framework (issue-82.md:5-9, issue-82.md:15-21). #82 also explicitly distinguishes side `Sheet` from bottom-sheet `Drawer` (issue-82.md:11, issue-82.md:29).

## Options Considered

- **Option A: Conservative cleanup.** Locked cleanup only; keep `Sheet`; defer all #82 primitives.
- **Option B: Cleanup + fill P1 gaps.** Locked cleanup; keep `Sheet`; add #82 P1 primitives; reject broad audit churn.
- **Option C: Maximalist overhaul.** Locked cleanup; bulk audit renames/redesigns; add #82 primitives; originally included `Sheet -> Drawer`.

## Decision

Choose **Option B**.

7.0.0 should spend its breaking-change budget on the locked cleanup and canonical names already proven by the current component concepts, while also adding the P1 primitives from #82 because they are standard, low-breakage additions with direct production migration evidence. It should not bundle broad audit API redesigns into the same release.

### Sheet / Drawer Ruling

**Keep `Sheet` for the current side-panel primitive. Reserve `Drawer` for a distinct vaul-style bottom-sheet. Do not rename `Sheet -> Drawer`.**

Evidence:

- #82 says `Sheet` is already present and `Drawer` is a bottom-sheet distinct from the existing side `Sheet` (issue-82.md:11, issue-82.md:29).
- ADV-A, ADV-B, and SKEPTIC all cite the current `Sheet` as a Radix Dialog side panel with side variants and default right placement (01-Bus.md:17, 01-Bus.md:35, 01-Bus.md:44).
- ADV-C conceded the original `Sheet -> Drawer` position as the weakest C item and carved it out in rebuttal (01-Bus.md:61-66).

### Audit Rename / Redesign Ruling

**ACCEPT for 7.0.0:**

- `StatusBadge -> Badge(status)`: locked merge; removes duplicate status-chip surface (00-Topic.md:5-8, 01-Bus.md:17).
- `TabsItems -> Tabs(items)`: locked merge; duplicate convenience surface (00-Topic.md:6-8, 01-Bus.md:17).
- `SwitchField -> ChoiceField + Switch`: locked merge; removes wrapper duplication (00-Topic.md:6-8, 01-Bus.md:17).
- `KeyValueGrid -> Descriptions`: canonical for semantic detail records; repeatedly supported by ADV-A/B/C (01-Bus.md:17, 01-Bus.md:26, 01-Bus.md:54).
- `ProgressMeter -> Progress`: canonical primitive name and satisfies #82 Progress (00-Topic.md:8, issue-82.md:18, 01-Bus.md:26).
- `CardStat -> StatCard`: locked extraction of KPI/stat tile from base `Card` (00-Topic.md:8, audit-findings.md:15, 01-Bus.md:54).

**REJECT as 7.0.0 churn or redesign-overreach:**

- `Sheet -> Drawer`: contradicted by #82 taxonomy; keep `Sheet`, reserve `Drawer`.
- `PageContainer -> PageShell`: real router/shell debt, but requires router-decoupling and region redesign, not a cleanup rename (audit-findings.md:5, 01-Bus.md:44-45).
- `ResponsiveGrid -> SimpleGrid`: recognizable Chakra name, but thin-wrapper API expansion is not worth hard import churn now (audit-findings.md:7, 02-Research/ADV-B.md:22).
- `Topbar -> AppBar`: current component still owns product/project/search/notification/tweaks concerns; a rename would make the abstraction more misleading (audit-findings.md:10, 01-Bus.md:44-45).
- `AppShell` composition redesign: name is standard; slot/collapse ownership redesign is future work (audit-findings.md:8, 02-Research/ADV-B.md:24).
- `Sidebar` composition redesign: real data-driven/product-chrome debt, but high-churn public API rewrite (audit-findings.md:9, 01-Bus.md:44-45).
- `PageInset -> PageGutter` / merge: low-value wrapper cleanup compared with locked scope (audit-findings.md:11, 01-Bus.md:64).
- `SplitPane -> SidebarLayout` / `TwoColumnLayout`: plausible naming debt, but not evidenced as urgent 7.0.0 consumer pain (audit-findings.md:12).
- `Breadcrumb` compound redesign: valid portability concern, but not part of the 7.0.0 executable scope (audit-findings.md:13).
- `DataTable` pagination/checkbox redesign: valid design debt, but broad shared behavior risk (audit-findings.md:14, 01-Bus.md:36).
- `Timeline` compound/domain cleanup: valid future design debt, not 7.0.0 cleanup (audit-findings.md:17).
- `DataState`, `InfiniteQueryState`, `MutationFeedback`, `QueryRefetchButton`, `PrefetchLink`: real query-layer leakage, but should be handled in a focused query boundary plan, not this release (audit-findings.md:18-20, audit-findings.md:50-51, 01-Bus.md:36).
- `FormField -> Field`: audit severity is low and design is already correct; hard rename is pure churn now (audit-findings.md:21, 01-Bus.md:64).
- `SearchInput` debounce redesign: valid API concern, not naming cleanup (audit-findings.md:22).
- `Select` split/redesign: real overload debt, but full API migration unrelated to #82 P1 additions (audit-findings.md:23, 01-Bus.md:44-45).
- `CheckboxGroup.onChange -> onValueChange`, `DatePicker`/`ColorPicker` vocabulary changes, `Radio` primary-root redesign: consistency issues are real, but belong in a focused form-control pass (audit-findings.md:24-25, audit-findings.md:36, audit-findings.md:42-43).
- `Dialog` / `AlertDialog` split: semantically valid, but #82 marks composable AlertDialog as optional/low priority and current `DialogConfirm` covers common confirmation use (audit-findings.md:26, issue-82.md:44-45).
- `SkeletonTable` merge and `SkeletonCard -> SkeletonStat`: add generic `Skeleton` now; defer shaped skeleton family cleanup (audit-findings.md:27-28, 01-Bus.md:64).
- `FilterBar -> FilterToolbar`, `FilterGroup -> FilterSection`: real single-responsibility/a11y concerns, but audit itself frames this as redesign work (audit-findings.md:29-30).
- `Steps`, `Cascader`, `TreeSelect`, `TreeList`: valid future API/a11y work, but not 7.0.0 scope (audit-findings.md:31-33, audit-findings.md:45).
- `Upload` / `AvatarUpload` split and `UploadCropDialog -> ImageCropDialog`: real single-responsibility debt, but broad upload migration; add display `Avatar` instead (audit-findings.md:34-35, issue-82.md:16).
- `Calendar`, `Collapsible`, `Command`: wrapper/API-value questions are future cleanup, not this release (audit-findings.md:38, audit-findings.md:41, audit-findings.md:44).
- `CountrySelect`, `LocalePicker`, `TimezonePicker`, `DateFormatPicker`, `TimeFormatPicker`: app/domain leakage is real, but extracting these from core is a larger package-boundary decision (audit-findings.md:39, audit-findings.md:46-49).
- Standard-name components with redesign-only findings (`Inline`, `Badge`, `Card`, `Checkbox`, `ColorPicker`, `Slider`, `Calendar`, `Collapsible`, etc.) should not be hard-renamed for 7.0.0 solely because the audit found possible improvements (audit-findings.md:6, audit-findings.md:16, audit-findings.md:24, audit-findings.md:36-38, audit-findings.md:44).

### #82 P1 Primitive Ruling

**Add #82 P1 primitives in 7.0.0.**

IN for 7.0.0:

- `Avatar`
- `Separator`
- generic `Skeleton`
- `Toggle`
- `ToggleGroup`
- `AspectRatio`
- `Progress`, satisfied by `ProgressMeter -> Progress`

Rationale: #82 is direct production evidence of missing standard primitives (issue-82.md:5-9, issue-82.md:15-21). These are additive exports, so they improve standards/completeness without increasing existing consumer migration breakage the way hard renames do. The bus repeatedly notes that the public UI barrel lacks these and that generic `SkeletonBlock` is private (01-Bus.md:26, 01-Bus.md:35, 01-Bus.md:44).

OUT for 7.0.0:

- P2 overlays/navigation: `Accordion`, `ContextMenu`, `HoverCard`, `Menubar`, `NavigationMenu`, bottom-sheet `Drawer`, `Resizable`, `Carousel`.
- P3 inputs: `InputOTP`, `Combobox`, `PasswordInput`, `TimeInput`, `Rating`, `TagInput`.
- Hooks: `useIsMobile`, `useMediaQuery`.
- Optional composable `AlertDialog` parts.

These remain valid 7.x backlog, except bottom-sheet `Drawer` must remain distinct from side `Sheet`.

## Rubric & Scoring

| Option         |                                                                                                                                 Standards & design fit (30) |                                                                                               Migration cost / churn (25) |                                                                                  Coherence & completeness (15) |                                                                               Effort / deliverability (15) |                                                                                                Reversibility (15) |  Total |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------: | ---------------------------------------------------------------------------------------------------------: | ----------------------------------------------------------------------------------------------------------------: | -----: |
| A Conservative |            22: accepts clearly canonical locked names and correct `Sheet` taxonomy, but knowingly leaves P1 primitive gaps after a standards-focused major. |                     24: lowest breakage; only locked hard changes, with #82 additions deferred because they are additive. |                        10: coherent cleanup story, but incomplete primitive layer despite production evidence. |                                                14: most deliverable; avoids new dependencies/API settling. |                                    14: deferring additions is easy to reverse in 7.x; minimal wrong-call surface. | **85** |
| B #82-aligned  |               27: keeps canonical locked changes, preserves `Sheet`/`Drawer` distinction, and adds standard P1 primitives requested by production migrator. |                        21: adds little breakage because P1 primitives are new exports, but still expands release surface. |                      14: strongest story: cleanup plus standard primitive parity, while keeping P2/P3 bounded. |       12: more work than A, but thin Radix/shadcn-style P1 wrappers are much smaller than audit redesigns. | 13: additive primitives can be adjusted more easily than hard renames; main risk is freezing weak APIs too early. | **87** |
| C Maximalist   | 25: identifies real design debt and would improve many abstractions, but original `Sheet -> Drawer` was wrong and many names are not universally canonical. | 8: broad no-alias renames/redesigns hit real consumers across layout, data-entry, query, upload, and navigation surfaces. | 12: one large overhaul is conceptually coherent, but too many unrelated concerns compete for the same release. | 4: deliverability risk is extreme: Sidebar/AppShell/Select/Upload/Dialog/query redesigns plus #82 backlog. |                                            5: wrong hard renames and replacement APIs would be expensive to undo. | **49** |

## Consequences

- 7.0.0 remains a breaking cleanup release, but does not ship with obvious P1 primitive holes already reported by production migration.
- Consumers pay the locked hard-rename cost once, without also being forced through speculative layout/navigation/form/query rewrites.
- Audit findings are not discarded; they become future focused design passes where replacement APIs, migration docs, and package boundaries can be evaluated separately.
- P2/P3 #82 primitives can ship in later 7.x minors because they are additive; they do not need the major release window.

## Dissent

- **Option A unresolved risk:** SKEPTIC's strongest objection is that A under-scopes the release by shipping a "standard framework" major while knowingly leaving P1 primitives missing after a production migrator had to vendor them (01-Bus.md:33-36).
- **Option B unresolved risk:** SKEPTIC's strongest objection is scope ambiguity: adding P1 primitives during the major can blur the release story and force API/dependency choices under the same deadline as hard migration docs (01-Bus.md:33, 01-Bus.md:36-37).
- **Option C unresolved risk:** SKEPTIC's strongest objection is correctness and deliverability collapse: broad redesign-api scope plus the original `Sheet -> Drawer` collision create irreversible semantic breakage and too much implementation risk (01-Bus.md:33-36).

## 7.0.0 CHANGE-SET (actionable)

### IN-scope

Remove:

- `ScanPanel`
- `CodeBadge`
- `ShellApp`
- `Menu`
- `MobileFrame`

Rename:

- `KeyValueGrid -> Descriptions`
- `ProgressMeter -> Progress`
- `CardStat -> StatCard`

Merge:

- `StatusBadge -> Badge(status)`
- `TabsItems -> Tabs(items)`
- `SwitchField -> ChoiceField + Switch`

Keep:

- Keep `Sheet` as the side-panel primitive.
- Do not introduce a side-panel `Drawer` alias.
- Reserve `Drawer` for a future distinct bottom-sheet primitive.

Add:

- `Avatar` / `AvatarImage` / `AvatarFallback`
- `Separator`
- generic `Skeleton`
- `Toggle`
- `ToggleGroup`
- `AspectRatio`
- `Progress` through the `ProgressMeter -> Progress` rename

### OUT-of-scope

Deferred audit renames/redesigns:

- `PageContainer -> PageShell`
- `ResponsiveGrid -> SimpleGrid`
- `Topbar -> AppBar`
- `PageInset -> PageGutter` or merge
- `SplitPane -> SidebarLayout` / `TwoColumnLayout`
- `FormField -> Field`
- `SkeletonCard -> SkeletonStat`
- `FilterBar -> FilterToolbar`
- `FilterGroup -> FilterSection`
- `Cascader -> TreeSelect`
- `UploadCropDialog -> ImageCropDialog`
- `LocalePicker -> LocaleSelect`
- `DateFormatPicker -> DateFormatSelect`
- `TimeFormatPicker -> TimeFormatSwitcher`
- `QueryRefetchButton -> RefetchButton`
- `TreeList -> Tree` / `TreeView`

Deferred redesign/API passes:

- `AppShell`, `Sidebar`, `Breadcrumb`, `DataTable`, `Timeline`, `DataState`, `InfiniteQueryState`, `MutationFeedback`, `SearchInput`, `Select`, `CheckboxGroup`, `DatePicker`, `Dialog`/`AlertDialog`, `SkeletonTable`, `Steps`, `TreeSelect`, `Upload`, `Calendar`, `CountrySelect`, `ChoiceField`, `Command`, `Radio`, `Collapsible`, `TimezonePicker`, `PrefetchLink`, query/app-domain extraction.

Deferred #82 additions:

- `Accordion`
- `ContextMenu`
- `HoverCard`
- `Menubar`
- `NavigationMenu`
- bottom-sheet `Drawer`
- `ResizablePanelGroup` / `ResizablePanel` / `ResizableHandle`
- `Carousel`
- `InputOTP`
- `Combobox`
- `PasswordInput`
- `TimeInput`
- `Rating`
- `TagInput`
- `useIsMobile`
- `useMediaQuery`
- composable `AlertDialog` parts
