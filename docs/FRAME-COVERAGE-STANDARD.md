# Frame coverage standard

`/frame/**` is an executable public-contract suite, not a gallery of happy-path screenshots. A component is not covered merely because one example renders. Missing cases are `UNTESTED`, never implicitly passing.

## Required layers

Every public component and compound subcomponent must be represented at all three layers:

1. **Isolated contract** — its own props, states, content and interaction.
2. **Composition contract** — the components it is designed to contain or be contained by.
3. **Journey contract** — transitions across loading, success, empty, validation, error and recovery.

Hooks and non-visual helpers do not need a standalone visual frame, but their observable states must appear in the frame of the component that consumes them.

## Isolated contract dimensions

Each applicable dimension must have a runnable case. Mark a dimension `N/A` only with a reason.

| Dimension      | Required cases                                                                           |
| -------------- | ---------------------------------------------------------------------------------------- |
| Visual         | every `variant`, `tone`, `size`, `shape`, density and spacing mode                       |
| State          | default, disabled, read-only, loading, empty, error, success and selected/current        |
| Ownership      | controlled, uncontrolled and reset behavior                                              |
| Content stress | empty, long Japanese/Vietnamese, large numbers, missing and invalid data                 |
| Responsive     | 320, 375, 390, 768, 1024, 1280, 1440 and 1920 px; container-width cases when embeddable  |
| International  | English, Japanese, Vietnamese and RTL stress where direction affects layout/keys         |
| Accessibility  | accessible name, helper/error association, keyboard, focus order/return and live regions |
| Preferences    | 200% zoom, coarse touch, reduced motion and forced/high contrast where applicable        |
| Async          | loading, reject, retry, cancel, stale/background refresh and offline when applicable     |

Do not invent props solely for a demo. A missing required capability is documented as `UNTESTED` and linked to an issue.

## Composition matrix

| Composition                                   | Required journey                                                                              |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `FormField ×` every form control              | label, helper, required, client/server error, disabled/read-only and reset                    |
| `Form × Dialog/Sheet`                         | open, validate, submit, pending, server error, success, close and focus return                |
| `DataState × DataTable × Pagination`          | prerequisite, initial loading, data, empty, background refresh, error/retry and page boundary |
| `Toolbar × filters × Tabs × DataTable`        | long filters, clear, no results, narrow container and keyboard traversal                      |
| `Card × Skeleton/EmptyState/Alert`            | one owning surface; no nested-card or oversized section state                                 |
| `AppShell × Sidebar × Topbar × PageContainer` | desktop, tablet and mobile navigation with focus restoration                                  |
| `Provider × locale/timezone/density/theme`    | controlled changes, persistence callback, RTL and long localized content                      |
| `Carousel/Tabs/Menu × containing surface`     | focus, escape, arrows, collision, touch and reduced motion                                    |

Add a composition whenever components share state, accessible relationships, layout ownership, focus ownership or async lifecycle. Pairwise coverage is sufficient unless a defect only emerges in a larger canonical journey.

## Example-writing rules

1. One case answers one contract question and has a descriptive visible heading.
2. Use real public imports; never reproduce component internals in the example.
3. Keep deterministic data and time; never depend on a live API.
4. Show the control that changes a state when the contract is controlled.
5. Error and empty cases retain recovery/navigation actions when the product pattern requires them.
6. Avoid decorative wrapper cards. The component that owns the surface owns the single border.
7. Long-content and locale cases use meaningful strings, not repeated lorem ipsum.
8. Accessibility assertions target computed name, description, error, role, state and focus behavior.
9. Screenshots supplement interaction assertions; they never replace them.
10. A frame source declares its covered contract dimensions in the coverage ledger.

## CI rules

Coverage reports distinguish `PASS`, `FAIL`, `UNTESTED` and `N/A`. Only an executed assertion can produce `PASS`.

These rules are enforced by `pnpm check:frame-coverage-ledger` against [`preview/frame-coverage.ledger.json`](../preview/frame-coverage.ledger.json).
