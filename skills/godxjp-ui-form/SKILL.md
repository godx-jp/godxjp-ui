---
name: godxjp-ui-form
description: Rules for building forms with @godxjp/ui. Use when creating or changing any form, create/edit screen, or labelled input in an app that installs the @godxjp/ui npm package. Covers page-not-modal, mandatory Form + FormField, content-sized input widths (GOV.UK Design System), and the escape hatch (open an issue on the library instead of hand-rolling). Not for apps that vendored their own copy of the components and have their own form rules.
---

# Form rules (@godxjp/ui)

> Applies only to apps that install the `@godxjp/ui` npm package. **Out of scope:** apps that
> vendored their own copy of the components into their source tree — they have no MCP server and
> no `node_modules/@godxjp/ui`, and follow their own form and input-width rules.

Seven rules, each distilled from defects MEASURED in a production app and approved one by one by
its owner. A violation is a bug, not a style preference.

Sibling skills: `godxjp-ui-design` (visual do/don't rules), `godxjp-ui-navigation`.

## 1. A form with 3 or more fields is its own PAGE, not a modal

Give it its own route (for example a TanStack file route with a trailing `_` so it does not nest:
`accounts_.new.tsx`; in an Inertia app, a shell route `Inertia::render('<page>')` that passes NO
data, with the page fetching from the API itself).
A `Sheet`/drawer is also an overlay and does NOT replace a page — even though `dialog-form-too-big`
does not catch a `Sheet`.
Inlining a create form as a `Card` **above the list** is also forbidden (one app had seven screens
rejected for it). The "Create" button in the page header `extra` leads to a `…/new` route; after
saving, return to the detail page or the list.
A `Dialog` is ONLY for: confirmations (delete…), very short 1–2 field forms (editing a signature),
and quick pickers. As the owner put it: "I really hate opening things in a modal — a page with a
lot of content must be created as its own page."

## 2. ALWAYS wrap in `<Form>` — no orphan FormField, no bare control

```tsx
<Form layout="horizontal" labelWidth="11rem" controlWidth="28rem" asChild>
  <Flex direction="col" gap="md">
    <FormField id="…" label={…} required>…</FormField>
  </Flex>
</Form>
```
- Desktop default is `layout="horizontal"` (label on the left — the antd convention); the kit
  collapses to vertical below a breakpoint on its own (`collapseBelow`). Do NOT write your own
  media query.
- Use `asChild` when the form element is owned by another library, or when submitting through a
  button `onClick`.
- `required` on `FormField` adds the `*` itself — do not draw your own.

## 3. Size inputs to their CONTENT (GOV.UK Design System)

"Make text inputs the right size for the content they're intended for" —
https://design-system.service.gov.uk/components/text-input/
- Cap for the whole form: `controlWidth="28rem"` on `<Form>` (about 45 Latin characters).
- Override per field (`controlWidth` on `FormField`) when the length is KNOWN: a port `7rem`, an
  enum of 2–3 options `10rem`, a short name / preset `14rem`, a textarea for a Japanese letter
  `36rem`.
- Never let a 2-option select stretch to full width — the owner caught this one by hand.

## 4. Do NOT lay out fields yourself

Do not wrap `FormField`s in a hand-rolled horizontal `Flex` row (labels misalign at the top — a
measured bug). To weld several controls into ONE row under ONE label, use `<Flex attached>` (the
former `SpaceCompact`) inside a single `FormField`, with each control keeping its own
`aria-label`. For a grid of fields, use `<Form columns={2}>` (a `ResponsiveGrid`), not your own grid.

## 5. Discovery before writing JSX

Call `search_components` (MCP) or read `node_modules/@godxjp/ui/docs/` FIRST.
Neighbouring code is not the standard — it may be a bug nobody has caught yet.

## 6. Gates after writing

`node node_modules/@godxjp/ui/scripts/ui-audit.mjs <files>` must report 0 errors, together with
the repository's own type-check, tests and build. The audit enforces these rules through
`bare-control-needs-formfield`, `formfield-needs-form`, `dialog-form-too-big` and
`select-width-hint`; when the kit ships further rules, the audit takes over more of this list.

## 7. Escape hatch = OPEN AN ISSUE, do not hand-roll

When `Form` / `FormField` / `<Flex attached>` cannot cover a case (a layout the kit does not
support, a missing prop, an audit rule that blocks wrongly), do NOT hand-roll a workaround. Open an
issue on the @godxjp/ui repository (`godx-jp/godxjp-ui`) describing the use case and the proposed
API, then either wait or use the closest kit-valid approach with a `// TODO(godxjp-ui#<n>)`
comment. Fix it upstream, not at the call site.
