# @godxjp/ui — Roadmap & shipped log (post-7.0.0)

Status of the consolidation that followed three multi-agent ADR debates (`debate/`): scope (#82),
framework boundary/dedup, and prop-vocabulary/token consistency. **7.0.0 had no external consumers,
so breaking churn was front-loaded into one place rather than spread across many releases.**

Every breaking release ships behind the same gate: `pnpm verify:release` (typecheck · lint ·
check:prop-vocabulary · check:token-tiers · check:mcp-sync · check:mcp-orphans · build · test ·
**check:core-isolation**) → verified in the MF consumer → `pnpm release`.

---

## ✅ Shipped

| Version     | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7.0.0**   | Naming cleanup (remove 5, rename 3, merge 3) + #82 **P1 primitives** (Avatar, Separator, base Skeleton, Toggle, ToggleGroup, AspectRatio, Progress). Kept `Sheet` (a distinct bottom-sheet `Drawer` came later).                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **8.0.0**   | **Consistency pass** (ADR: PRAGMATIC-SHARED). Vocabulary: full controlled vocab (`value`/`defaultValue`/`onValueChange`, `open`/`defaultOpen`/`onOpenChange`), status `variant→tone`, `onChange→onValueChange`, gap×3→`GapProp`, registry made normative. Tokens: 3-tier (primitive/semantic/component), removed domain `--tracking-*`. **22 rules** → `docs/STANDARDS-vocabulary-tokens.md` + MCP + audit. New CI guards `check:prop-vocabulary` + `check:token-tiers`. Concept merges (Stack+Inline→`Flex`, ChoiceField→`Field`, FilterBar→`Toolbar`, SkeletonCard→`SkeletonStat`, PageInset→PageContainer, MutationFeedback/QueryRefetchButton→presets) with thin aliases kept. |
| **8.1–8.3** | All remaining **#82 primitives** — Accordion, HoverCard, PasswordInput, Drawer (vaul bottom-sheet), InputOTP, Rating, TagInput, ContextMenu, Menubar, NavigationMenu, Resizable, Carousel, Combobox, TimeInput + `useIsMobile`/`useMediaQuery` (`@godxjp/ui/hooks`). **#82 closed.**                                                                                                                                                                                                                                                                                                                                                                                               |
| **9.0.0**   | **Core runtime isolation** (ADR: KIT + adapter rule, issue #83). Root `@godxjp/ui` no longer forces a foreign runtime: dropped `./form` (react-hook-form) + query adapters (@tanstack) from the root barrel (still on `@godxjp/ui/form` + `/query`); decoupled Breadcrumb/PageContainer/PageHeader from `react-router-dom` (injectable `linkComponent`, default `<a>`). New `check:core-isolation` guard (traces the root dist graph) wired into verify. **#83 closed.**                                                                                                                                                                                                           |
| **9.1.0**   | Removed the confirm-dialog **duplication** — dropped `DialogConfirm` + `Dialog mode="confirm"`; `AlertDialog` is the sole confirm/destructive dialog; `Dialog` is role=dialog only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **9.2.0**   | #90 GitHub-Pages preview deploy (`godx-jp.github.io/godxjp-ui/`); #91 `sideEffects:false` tree-shaking + completed AlertDialog/Pagination composables + `./ui` barrel consistency (Separator/Tooltip); #92 `PasswordStrength` + `usePasswordStrength`. Boundary decouple gaps: `LocalePicker` accepts `options` (no required provider), `Topbar` `projectPlaceholder`, `Sidebar` composition escape hatch (`renderItem` + `SidebarHeader`/`SidebarSection`/`SidebarItem` children, alongside `sections`).                                                                                                                                                                          |

## Key decisions (so the ADRs aren't re-litigated)

- **No `@godxjp/ui-app` package split.** The boundary ADR's "extract runtime adapters" goal is met by the
  **subpath architecture + `check:core-isolation`** (root stays neutral; adapters live on `./query`/`./form`/`./app`).
  A separate package was judged unnecessary churn (Skeptic's version-sync dissent) — revisit only if a real consumer needs it.
- **`variant` stays component-specific** (not one global enum); status intent is a separate `tone`.
- **KIT, not primitives-only.** Domain-neutral kit components (shell, pickers, query helpers) stay in core as long as
  the ROOT export forces no foreign runtime and hardcoded data becomes props.

## Open / future (not blocking)

- **AppShell/Topbar full composition-API rewrite** — Sidebar now has a composition escape hatch; AppShell/Topbar
  remain config-driven, which is valid under KIT. A full slot rewrite is optional future work, not a committed plan.
- **MF consumer** carries ~400 pre-existing wayfinder/route tsc errors from its own accounting-roadmap work —
  unrelated to `@godxjp/ui`; a separate MF cleanup.
- One ADR per breaking decision lives under `debate/`; the design standard is `docs/STANDARDS-vocabulary-tokens.md`.
