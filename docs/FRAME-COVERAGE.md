# Frame coverage ledger

`frame-coverage.json` is the policy input. `pnpm check:frame-coverage` discovers public visual
exports from component barrels, resolves each owning `/frame/<id>` source, and emits the expanded
export-by-dimension ledger as JSON.

The checker fails for missing frames, duplicate exports, malformed statuses, or unreasoned
`untested`/`not-applicable` states. A compiled frame earns only `isolated: pass`; it does not prove
responsive, RTL, accessibility, async, composition, or journey coverage.

The ledger also tracks `props`, `touch`, and `screenReader` independently. Axe/DOM checks may earn
`a11y: pass`, but they never imply that every prop is demonstrated, a coarse pointer works, or a
real screen reader announces the intended name/state/change.

## Component API evidence

Route presence is not component prop coverage. `component-api-manifest.json` is generated from the
actual TypeScript call signatures exported by every component barrel. It records owned props,
selected inherited behavioral props, finite literal unions, and declaration sources.

`component-case-evidence.json` is the only input allowed to promote `props` to `pass`. Each prop
needs explicit cases and rendered/test evidence; every finite union branch must be listed. Missing,
stale, or renamed props remain `untested` even when the owner page renders and passes Axe at every
viewport. Run:

- `pnpm gen:component-api-manifest` after changing public component APIs;
- `pnpm audit:component-cases` to print the exact missing component/prop/union branches;
- `pnpm check:component-api-manifest` in CI to reject a stale API inventory.

Inherited primitive behavior may be classified as pass-through only with a linked forwarding test;
a nonempty prose string or the component name appearing in JSX is not evidence.

Add narrow per-export overrides only after evidence exists. Never convert a dimension to `pass`
merely because a unit test or static demo exists.

Async is intentionally `untested` by default. Every export must eventually be classified: execute
its loading/error/retry/cancel/offline lifecycle, or mark it `not-applicable` with a component-specific
reason. A blanket primitive-default `not-applicable` hides async-capable controls and is forbidden.

## Accessibility evidence boundaries

An `a11y: pass` in this ledger means the rendered frame passed automated axe checks plus the
documented DOM/keyboard assertions. It does not claim testing with a real screen reader, braille
display, voice control, switch control, or physical coarse-touch device. Those assistive-technology
and hardware checks remain a separate manual evidence track and are currently `UNTESTED`, as also
recorded in `display-runtime-evidence.json`. Never infer real AT or touch coverage from Chromium
automation alone.
