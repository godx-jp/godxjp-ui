---
diataxis: adr
library: "@godxjp/ui"
library_version: 3.0.0
adr: "0002"
title: Ownership-pattern components (shadcn-style) instead of sealed library
status: accepted
date: 2026-01-14
last-updated: 2026-05-17
audience: [developer]
lang: en
---

# ADR 0002 — Ownership-pattern components (shadcn-style) instead of sealed library

## Status

Accepted.

---

## Context

A component library can be distributed in two patterns:

1. **Sealed library** (e.g., MUI, Chakra, Ant Design) — Consumer installs
   the npm package. Components render from the package's `node_modules`. To
   change a component's behavior or appearance, the consumer uses props,
   theming APIs, or overrides — but does not touch the source. When the
   override API is insufficient, the consumer is blocked.

2. **Ownership pattern** (e.g., shadcn/ui) — The registry is published; the
   consumer may choose to copy individual component source files into their
   own repository and own them. The npm package is also available for teams
   that prefer the sealed model. The key property: the consumer can always
   inspect and fork without losing the foundational conventions.

GoDX services differ from typical external consumers: they are all first-party
applications within the same monorepo, maintained by engineers who share the
platform context. Some services will need to customize the rendering behavior
of a primitive beyond what a prop API can express — for example, wrapping a
Dialog with a telemetry hook at every mount, or adding a density-specific
animation curve.

The team evaluated:

- **Fully sealed** — Simplest to consume; hardest to escape when a service
  needs non-trivial customization.
- **Fully forked per service** — Maximum flexibility; no shared primitives;
  no a11y or token consistency guarantee.
- **Ownership model** — Components are importable from the npm package for
  the common case; source is inspectable and forkable per-component when
  needed; the token system and Radix foundation remain available in forks.

---

## Decision

`@godxjp/ui` adopts the shadcn-style ownership pattern:

- Every component is published in the npm package (`@godxjp/ui`) and
  importable normally.
- Every component source is in `src/components/<kind>/<Name>.tsx` — a
  short, self-contained file that a service can copy verbatim if it needs to
  own the component.
- Components are thin wrappers: Radix handles accessibility; CSS classes from
  `tokens.css` handle visual output. A copied component that still imports
  `@godxjp/ui/tailwind.css` inherits the full token system.
- The wrapper API never wraps a component in a way that makes the interior
  inaccessible. `className` is always passthrough; `asChild` (where Radix
  supports it) is always available.

---

## Consequences

**Positive:**

- Services can adopt `@godxjp/ui` incrementally — start with the npm package
  import, fork a specific primitive later if needed.
- Design consistency is preserved in forks because the token layer is
  separate from the component layer.
- Component source is the documentation. An engineer reading the wrapper
  sees exactly what CSS classes and Radix props are applied.
- No lock-in anxiety: if `@godxjp/ui` is deprecated, every primitive is
  already a standalone file.

**Negative / constraints:**

- Forks diverge from the upstream package. A service that forks
  `Dialog.tsx` and later upgrades `@godxjp/ui` must manually reconcile
  changes to the upstream source.
- The ownership model only works when the source is genuinely thin. Thick
  wrappers with complex internal state defeat the fork story.
- CI requires `docs/reference/primitives/` parity with the barrel at
  `src/components/primitives.ts` (which re-exports from the six
  group folders under `src/components/<group>/` per cardinal rule
  27). A new primitive must have a reference page (cardinal rule
  18); this is an authoring overhead not present in sealed
  libraries.

**Neutral:**

- The pattern does not affect how Radix is used internally (ADR-0001) or
  how tokens are organized (ADR-0003).

---

## See also

- [ADR 0001: Radix as foundation](./0001-radix-as-foundation.md)
- [ADR 0003: Tokens not utilities](./0003-tokens-not-utilities.md)
- [How-to: Contribute a primitive](../how-to/contribute-primitive.md)
- [shadcn/ui](https://ui.shadcn.com/) — the public reference for this pattern.
