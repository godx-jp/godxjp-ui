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

Add narrow per-export overrides only after evidence exists. Never convert a dimension to `pass`
merely because a unit test or static demo exists.

Async is intentionally `untested` by default. Every export must eventually be classified: execute
its loading/error/retry/cancel/offline lifecycle, or mark it `not-applicable` with a component-specific
reason. A blanket primitive-default `not-applicable` hides async-capable controls and is forbidden.
