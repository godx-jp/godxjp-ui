# Consuming @godxjp/ui through the shadcn registry

## What is published, and what is not

`@godxjp/ui` ships as an **npm package**. The components are imported, not copied:

```ts
import { DataTable, Cascader } from "@godxjp/ui/data-display";
```

The registry does **not** publish those components, and that is deliberate. A shadcn registry is a
copy-paste channel — `shadcn add` writes files into your tree and you own them from then on. Copying
165 components would fork your copy from the package: you would stop receiving token fixes, a11y
fixes and the guard discipline the library is built on, while carrying ~73k lines you did not write.

What the registry publishes is the part the package cannot hand you on its own: **the design
language**.

| Item             | Type             | What you get                                                                   |
| ---------------- | ---------------- | ------------------------------------------------------------------------------ |
| `@godxjp/theme`  | `registry:theme` | The full token system — foundation scales, semantic roles, per-component knobs |
| `@godxjp/styles` | `registry:style` | The stylesheets those tokens drive (only if you adopt godxjp markup too)       |

`docs/showcase/acme-portal.tsx` is the proof this is the valuable half: an entire brand — gold and
navy, Source Sans 3, a 14px radius, navy-tinted shadows — reproduced by **configuring tokens alone**,
with no component edits and no new components.

## Setup

Add the namespace to your own `components.json`:

```json
{
  "registries": {
    "@godxjp": "https://godx-jp.github.io/godxjp-ui/registry/{name}.json"
  }
}
```

Then:

```bash
npx shadcn add @godxjp/theme
```

and import the token entry before your own overrides:

```css
@import "./styles/tokens/base.css";
```

## Re-theming

Override roles at `:root`, or scope them per tenant:

```css
[data-tenant="acme"] {
  --primary: 41 71% 53%;
  --radius: 0.875rem;
  --font-family-sans: "Source Sans 3", system-ui, sans-serif;
}
```

Two rules the token system holds to, worth knowing before you override:

- **Chrome is a token, default quiet (rule #44).** Dividers and separator borders default to their
  quietest state; you opt _in_ to them rather than out.
- **Role-mirror knobs are declared `initial`.** A knob whose default is a role (`--card`, `--muted`,
  `--primary`) resolves that role at the _call site_, not at `:root`. This is what lets a scoped
  `[data-tenant]` or `.dark` override actually reach a portaled overlay. See `docs/TOKENS.md`.

## Why not the components?

If you want the components, install the package — that is the supported path and the one every
guard, test and token in this repo is built around:

```bash
pnpm add @godxjp/ui
```

The registry exists for teams who already have their own shadcn components and want the godxjp
design language on top of them.
