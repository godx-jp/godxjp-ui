---
title: "Architecture decision records"
diataxis: index
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer]
lang: en
status: published
---

# Architecture decision records

ADRs record the significant design decisions made during the development of
`@godxjp/ui`. Each ADR uses the [Michael Nygard template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
(Context → Decision → Consequences → Alternatives considered).

Read ADRs to understand why the library is designed the way it is.
Do not modify an Accepted ADR — open a new ADR that supersedes it.

| # | Title | Status |
|---|---|---|
| [0001](./0001-radix-as-foundation.md) | Radix as the interactive primitive foundation | Accepted |
| [0002](./0002-shadcn-style-not-mui.md) | shadcn-style ownership, not MUI-style black box | Accepted |
| [0003](./0003-tokens-not-utilities.md) | Tokens (CSS custom properties) not utility classes | Accepted |
| [0004](./0004-i18next-singleton-shared.md) | Single shared i18next instance | Accepted |
| [0005](./0005-datetime-library-and-config-provider.md) | Datetime library + GodxConfigProvider | Accepted |
| [0006](./0006-table-primitive-vs-data-table-composite.md) | Table primitive vs DataTable composite | Superseded by 0007 |
| [0007](./0007-table-stage4b-chrome-to-composite.md) | Table Stage 4b — chrome moves to DataTable composite | Accepted |
