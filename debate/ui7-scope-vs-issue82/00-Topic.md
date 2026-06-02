# Debate — What should @godxjp/ui 7.0.0 actually change?

## Question
We are cutting a breaking `@godxjp/ui` **7.0.0**. Three inputs are in tension:
1. **Already-decided cleanup** (locked, not up for debate): REMOVE 5 domain/dup components
   (ScanPanel, CodeBadge, ShellApp, Menu, MobileFrame); MERGE StatusBadge→Badge(`status`),
   TabsItems→Tabs(`items`), SwitchField→ChoiceField+Switch; RENAME KeyValueGrid→Descriptions,
   ProgressMeter→Progress, CardStat→StatCard.
2. **A 70-agent naming/design audit** (`context/audit-findings.md`) that aggressively recommends
   MANY more renames + API redesigns (PageContainer→PageShell, ResponsiveGrid→SimpleGrid,
   Topbar→AppBar, FilterBar→FilterToolbar, Sidebar/AppShell/Select/Upload "redesign-api", etc.).
   The moderator's prior (to be TESTED, not assumed) is that most of these are over-engineering.
3. **Issue #82** (`context/issue-82.md`): a real production migrator asks us to ADD missing
   standard primitives (Avatar, Separator, Progress, Skeleton-base, Toggle/ToggleGroup, AspectRatio,
   Accordion, ContextMenu, HoverCard, Drawer-as-bottom-sheet, InputOTP, Combobox, PasswordInput…).
   NOTE: #82 treats **Sheet (side panel)** and **Drawer (bottom-sheet/vaul)** as DISTINCT — which
   directly conflicts with the audit's suggestion to rename Sheet→Drawer.

## The discrete OPTIONS (mutually exclusive scope for 7.0.0)
- **Option A — Conservative cleanup.** Ship ONLY the locked cleanup (input 1) + the 2–3
  unambiguously-canonical renames already implied (Descriptions, Progress). REJECT the audit's
  further renames/redesigns as over-engineering / churn. KEEP `Sheet` (do NOT rename to Drawer —
  reserve "Drawer" for a future bottom-sheet). Defer ALL of #82's new primitives to a later 7.x minor.
- **Option B — Cleanup + fill the gaps (#82-aligned).** Locked cleanup, KEEP `Sheet`, and in the
  SAME 7.0.0 ADD #82's P1 missing primitives (Avatar, Separator, Skeleton-base, Toggle/ToggleGroup,
  AspectRatio) because a "standard framework" is expected to ship them. Adopt only the clearly-correct
  renames; reject cosmetic ones. New bottom-sheet `Drawer` may be added now or deferred.
- **Option C — Maximalist overhaul.** Locked cleanup + ACCEPT the bulk of the audit's renames AND
  API redesigns (PageShell, SimpleGrid, AppBar, FilterToolbar, Sidebar/AppShell composition rework,
  Sheet→Drawer, etc.) + add #82's primitives. One sweeping 7.0.0.

## Hard constraints
- Hard rename, NO deprecated aliases (already chosen). Domain-neutral (rule #19). Breaking release.
- The library is consumed by a real app (MF: StatusBadge×59, KeyValueGrid/Sheet/CardStat usages) →
  migration cost is real. The library's own rules #19/#23/#31/#32/#33 are the design canon.
- "Internationally standard naming" and "correct component design philosophy" are explicit goals.

## Scoring rubric (Judge scores each option; weights sum 100)
- **Standards & design-philosophy fit** — 30 (does it make names/APIs genuinely more canonical?)
- **Consumer migration cost / churn risk** — 25 (breakage vs value; needless renames are pure churn)
- **Coherence & completeness** — 15 (does 7.0.0 tell one coherent story; does it leave obvious gaps?)
- **Effort / deliverability** — 15
- **Reversibility** — 15 (how hard to undo a wrong call later)

## Roster
ADV-A (Conservative), ADV-B (#82-aligned middle), ADV-C (Maximalist audit), SKEPTIC (red-team all),
JUDGE (neutral; scores rubric; writes 04-Decision.md; records dissent).

## Status
decided
