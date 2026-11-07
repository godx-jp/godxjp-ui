---
name: godxjp-ui-design
description: The design rules for app screens built with @godxjp/ui, in one skill. Use when designing, building, redesigning or reviewing any page, form, menu or console in an app that installs the @godxjp/ui npm package. The do/don't rules from real review feedback are here; topic guides are in references/. forms.md covers create/edit screens, Form + FormField and input widths (formerly the godxjp-ui-form skill). navigation.md covers the sidebar menu, per-role landing, bottom bar, breadcrumbs and tabs (formerly godxjp-ui-navigation). complex-admin.md covers multi-tier consoles with wireframe-first, layered IA (formerly design-complex-admin). craft.md covers taste dials, craft lenses, layout, interaction and motion hygiene, and action feedback (no silent action). For an EXPRESSIVE sign-in or onboarding screen, use godxjp-ui-brand-surface instead.
---

# @godxjp/ui — Design rules for app screens

Concrete rules for interfaces built with `@godxjp/ui`, accumulated from actual reviewer feedback.
Treat each as a hard rule. Combine them with DESIGN.md (the visual spec), the `@godxjp/ui` MCP
(`search_components`, `get_component`, `get_exemplar`, `list_anti_ai_tells`,
`list_redesign_checks`) and industry patterns for the surface being designed.

> Applies only to apps that install the `@godxjp/ui` npm package. Apps that vendored their own
> copy of the components follow their own rules.

Read the reference that matches the task before writing JSX:

| Task                                                                                | Read                                                                                                                                         |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| A form, a create or edit screen, a labelled input                                   | [references/forms.md](references/forms.md)                                                                                                   |
| A menu item, a new page, a role's landing page, breadcrumbs, tabs                   | [references/navigation.md](references/navigation.md) (sources in [references/navigation-principles.md](references/navigation-principles.md)) |
| A console spanning several administrative tiers (platform, tenant, shop…)           | [references/complex-admin.md](references/complex-admin.md)                                                                                   |
| Making a screen read as well made: taste, craft lenses, layout, interaction, motion | [references/craft.md](references/craft.md)                                                                                                   |
| An expressive sign-in, onboarding or first empty state                              | the `godxjp-ui-brand-surface` skill                                                                                                          |

## DO

- **Status chips / labels never wrap to a second line.** A `Badge` must stay on ONE line — icon +
  text inline, never the icon stacked above the text. Pass a leading icon through the Badge `icon`
  prop as a _component reference_ (`icon={BadgeCheck}`), NEVER as an inline child
  (`<Badge><BadgeCheck/> 確認済み</Badge>` column-stacks and wraps). This is `@godxjp/ui` cardinal
  rule #35 ("Status chips never wrap"). It applies to every verified/pending/active-style chip on
  every surface.

- **No silent action.** A button that waits on the server shows `loading` (re-entry blocked) while it
  runs, then a short `toast.success` saying what was done, or `toast.error` / an `Alert` with the
  reason on failure; an undoable action puts Undo on the success toast. Details and example:
  [references/craft.md §5](references/craft.md).

## DON'T

- **Don't give a sticky top bar a semi-transparent background + `backdrop-filter`.** A
  `position: sticky` topbar with `background: hsl(var(--background) / 0.96)` +
  `backdrop-filter: blur/saturate` samples and tints from whatever renders behind it — colourful
  content scrolling underneath, or the browser's red automation/debug banner — so the bar picks up
  a stray pink/red wash. Use a FULLY OPAQUE background (`hsl(var(--background))`, no alpha, no
  `backdrop-filter`) so the bar is always clean whatever is behind it.

- **Don't strip the signed-in user's profile (avatar + name) from the global topbar / header.** It
  is the orientation anchor — the user must always see _who they are signed in as_ in the top
  right, even when the page body already has its own identity hero. Leaving only a locale switcher
  and "Sign out" makes the topbar look empty or broken. Keep the profile chip (avatar + name) in the
  `Topbar` `end` slot; the page hero is additive, not a replacement.
