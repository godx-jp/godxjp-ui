# @godxjp/ui Documentation

| Doc                                          | Purpose                                                                                                                                                                                                               |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [CONSUMER-RULES.md](./CONSUMER-RULES.md)     | **Start here if you build an app with @godxjp/ui** — the rules the audit enforces (styles entry, layout owners, real primitives, tokens)                                                                              |
| [DEVELOPMENT.md](./DEVELOPMENT.md)           | **Contributor guideline** — role/boundary, architecture, how to add/extend, verify                                                                                                                                    |
| [COMPONENTS.md](./COMPONENTS.md)             | Component catalog by taxonomy group                                                                                                                                                                                   |
| [PROPS-VOCABULARY.md](./PROPS-VOCABULARY.md) | Atomic prop types (`*Prop` suffix)                                                                                                                                                                                    |
| [PROPS-REGISTRY.md](./PROPS-REGISTRY.md)     | Machine-readable registry + forbidden aliases                                                                                                                                                                         |
| [DATETIME.md](./DATETIME.md)                 | **Mandatory** `formatDate` — all date/time display                                                                                                                                                                    |
| [DESIGN-AUTHORITY.md](./DESIGN-AUTHORITY.md) | **Which external standard owns which decision** — APG, Radix, shadcn, Ant Design groups, SmartHR colour, Carbon geometry, measured contrast for derived colour. Read before inventing a spacing/density/layout answer |
| [SPACING.md](./SPACING.md)                   | Golden ratio (φ) macro spacing — PageContainer sections, Flex gap, Card rhythm                                                                                                                                        |
| [FORMS.md](./FORMS.md)                       | **Mandatory** react-hook-form + Zod 4                                                                                                                                                                                 |
| [TESTING.md](./TESTING.md)                   | **Mandatory** Vitest per component                                                                                                                                                                                    |
| [FRAME-A11Y-CI.md](./FRAME-A11Y-CI.md)       | Per-frame axe a11y (LOCAL ONLY, never CI) + geometry + coverage gates — how to run/regenerate                                                                                                                         |
| [../README.md](../README.md)                 | Setup, workspace wiring, theme                                                                                                                                                                                        |

## Preview

```bash
pnpm preview          # http://localhost:6008
pnpm preview:build    # static site → preview/dist/ — heavy; CI's job, run at most once pre-PR
```

Each docs page is `docs/<group>/<component>.tsx` (or `docs/<group>/<component>/index.tsx` with
per-feature screens in `examples/`), served at `/isolate/<group>-<component>`. Pages import the
public paths (`@godxjp/ui/{data-display,layout,general,…}`), never `@/components/…`. The full layout
is in [DEVELOPMENT.md](./DEVELOPMENT.md) §4.

## Props folder layout

```
src/props/
├── vocabulary/     ← atomic reusable concepts (TitleProp, GapProp, …)
├── components/     ← per-component interfaces (PageContainerProp, ButtonProp, …)
├── registry.ts     ← canonical catalog — check before adding new props
└── index.ts        ← public export @godxjp/ui/props
```

## Naming rules

1. **Vocabulary** (atomic): `{Concept}Prop` — e.g. `TitleProp`, `PageDensityProp`
2. **Component** (composite): `{Component}Prop` — e.g. `PageContainerProp`, `ButtonProp`
3. **Never** define prop interfaces inline in component `.tsx` files
4. **Always** check `registry.ts` + `PROP_ALIASES_FORBIDDEN` before inventing a name
