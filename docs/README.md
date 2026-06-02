# @godxjp/ui Documentation

| Doc                                          | Purpose                                                                            |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| [DEVELOPMENT.md](./DEVELOPMENT.md)           | **Contributor guideline** — role/boundary, architecture, how to add/extend, verify |
| [COMPONENTS.md](./COMPONENTS.md)             | Component catalog by Ant Design group                                              |
| [PROPS-VOCABULARY.md](./PROPS-VOCABULARY.md) | Atomic prop types (`*Prop` suffix)                                                 |
| [PROPS-REGISTRY.md](./PROPS-REGISTRY.md)     | Machine-readable registry + forbidden aliases                                      |
| [DATETIME.md](./DATETIME.md)                 | **Mandatory** `formatDate` — all date/time display                                 |
| [SPACING.md](./SPACING.md)                   | Golden ratio (φ) macro spacing — Stack, Card, PageContainer                        |
| [FORMS.md](./FORMS.md)                       | **Mandatory** react-hook-form + Zod 4                                              |
| [TESTING.md](./TESTING.md)                   | **Mandatory** Vitest per component                                                 |
| [../README.md](../README.md)                 | Setup, workspace wiring, theme                                                     |

## Preview

```bash
cd packages/ui
pnpm preview          # http://localhost:6008
pnpm preview:build    # static site → preview/dist/
```

### Preview doc format

```
docs/
  primitives/              ← sidebar group (folder name → title)
    README.md              ← optional group intro
    data-display/
      README.md
      overview.tsx         ← 1 story = 1 demo (default export)
      overview.md          ← optional story docs (YAML frontmatter: title, layout)
      _shared.ts           ← prefix _ = not a story
```

- **Navigation** = folder tree; leaves = `.tsx` files (not `README.md`, not `_*.tsx`).
- **Live demo** = `export default function Demo()` from the `.tsx` file.
- **Imports** = `@godxjp/ui/{data-display,layout,general,…}` — same public paths as app code (`FORMS.md`). **Not** `@/components/…` (internal dev alias only).
- **Code panel** = same `.tsx` file raw — no duplicate `parameters.docs.source.code`.
- **Story docs** = optional same-name `.md` beside the demo (tiếng Việt): giới thiệu, khi nào dùng, import, props (hiển thị / hành động / DOM). Regenerate: `pnpm docs:sync-primitives`.
- Component preview examples live in `examples/**/*.preview.tsx`.

## Props folder layout

```
src/props/
├── vocabulary/     ← atomic reusable concepts (TitleProp, StackGapProp, …)
├── components/     ← per-component interfaces (PageContainerProp, ButtonProp, …)
├── registry.ts     ← canonical catalog — check before adding new props
└── index.ts        ← public export @godxjp/ui/props
```

## Naming rules

1. **Vocabulary** (atomic): `{Concept}Prop` — e.g. `TitleProp`, `PageDensityProp`
2. **Component** (composite): `{Component}Prop` — e.g. `PageContainerProp`, `ButtonProp`
3. **Never** define prop interfaces inline in component `.tsx` files
4. **Always** check `registry.ts` + `PROP_ALIASES_FORBIDDEN` before inventing a name
