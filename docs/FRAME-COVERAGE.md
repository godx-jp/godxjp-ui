# Frame coverage ledger

`frame-coverage.json` is the policy input. `pnpm check:frame-coverage` discovers public visual
exports from component barrels, resolves each owning `/frame/<id>` source, and emits the expanded
export-by-dimension ledger as JSON.

The checker fails for missing frames, duplicate exports, malformed statuses, or unreasoned
`untested`/`not-applicable` states. A compiled frame earns only `isolated: pass`; it does not prove
responsive, RTL, accessibility, async, composition, or journey coverage.

Add narrow per-export overrides only after evidence exists. Never convert a dimension to `pass`
merely because a unit test or static demo exists.
