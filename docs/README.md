---
title: "@godxjp/ui — documentation"
diataxis: index
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-18
audience: [developer]
lang: en
status: published
---

# @godxjp/ui — documentation

> GoDX UI framework. Single source of visual truth for every service frontend.

This index follows the [Diátaxis](https://diataxis.fr) four-quadrant
taxonomy plus a fifth `specs/` class for binding rules. Each
document belongs to exactly one home; no file mixes kinds.

For BINDING rules (you MUST conform) see [`specs/`](./specs/README.md)
— that index lists the canonical specs (theme axes, consumer
contract, token system, prop vocabulary, design handoff formats).
The four quadrants below are explanatory / task-mode companions.

|                            | Practical                                                       | Theoretical                                                 |
| -------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| **Acquisition** (learning) | **Tutorials**                                                   | **Explanation**                                             |
|                            | [01 Getting started](./tutorials/01-getting-started.md)         | [Overview](./explanation/overview.md)                       |
|                            | [02 Theming](./tutorials/02-theming.md)                         | [Design philosophy](./explanation/design-philosophy.md)     |
|                            | [03 Shell composition](./tutorials/03-shell-composition.md)     | [Architecture](./explanation/architecture.md)               |
|                            | [04 Add a new primitive](./tutorials/04-add-a-new-primitive.md) | [Accessibility](./explanation/accessibility.md)             |
|                            |                                                                 | [Preferences](./explanation/godx-config.md)                 |
|                            |                                                                 | [ADRs](./adr/)                                              |
| **Application** (working)  | **How-to**                                                      | **Reference**                                               |
|                            | [Override tokens](./how-to/override-tokens.md)                  | [Components](./reference/)                                  |
|                            | [Compose shell](./how-to/compose-shell.md)                      | [Shell](./reference/shell/)                                 |
|                            | [Add a locale](./how-to/add-locale.md)                          | [Hooks](./reference/hooks/)                                 |
|                            | [Customise density](./how-to/customise-density.md)              | [Tokens](./reference/tokens.md)                             |
|                            | [Customize theme](./how-to/customize-theme.md)                  | [i18n](./reference/i18n.md)                                 |
|                            | [Wire preferences](./how-to/wire-godx-config.md)                | [Exports](./reference/exports.md)                           |
|                            | [Contribute a primitive](./how-to/contribute-primitive.md)      | [Types](./reference/types.md)                               |
|                            | [Consume from a service](./how-to/consume-from-service.md)      |                                                             |

## Binding specs

Normative architectural rules every primitive / consumer must conform to.
See [`specs/README.md`](./specs/README.md) for the full index.

- [01 Theme axes](./specs/01-theme-axes.md) — `data-theme`, `data-accent`, `data-density`, `data-font-size` + cascade layering
- [02 Consumer contract](./specs/02-consumer-contract.md) — dist surface, folder shape, prop-not-className rule
- [03 Token system](./specs/03-token-system.md) — three-tier token architecture + catalogue
- [04 Prop vocabulary](./specs/04-prop-vocabulary.md) — locked prop names + forbidden synonyms
- [05 Design handoff formats](./specs/05-design-handoff-formats.md) — Claude Design / DESIGN.md / DTCG / Figma intake
