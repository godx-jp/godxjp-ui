---
name: godxjp-ui-design
description: Design do/don't rules for @godxjp/ui interfaces, learned from real review feedback. Use when designing, redesigning, or reviewing any web UI built with @godxjp/ui — pages, app shells, topbars, status chips. Grows as reviewers flag issues.
---

# @godxjp/ui — Design Do / Don't

Concrete rules for interfaces built with `@godxjp/ui`, accumulated from actual reviewer feedback —
treat each as a hard rule. Combine them with the `@godxjp/ui` MCP authority (`search_components`,
`get_component`, `list_anti_ai_tells`, `list_redesign_checks`) and industry patterns for the
surface being designed.

Sibling skills: `godxjp-ui-form` (forms and inputs), `godxjp-ui-navigation`.

## DO

- **Status chips / labels never wrap to a second line.** A `Badge` must stay on ONE line — icon +
  text inline, never the icon stacked above the text. Pass a leading icon through the Badge `icon`
  prop as a *component reference* (`icon={BadgeCheck}`), NEVER as an inline child
  (`<Badge><BadgeCheck/> 確認済み</Badge>` column-stacks and wraps). This is `@godxjp/ui` cardinal
  rule #35 ("Status chips never wrap"). It applies to every verified/pending/active-style chip on
  every surface.

## DON'T

- **Don't give a sticky top bar a semi-transparent background + `backdrop-filter`.** A
  `position: sticky` topbar with `background: hsl(var(--background) / 0.96)` +
  `backdrop-filter: blur/saturate` samples and tints from whatever renders behind it — colourful
  content scrolling underneath, or the browser's red automation/debug banner — so the bar picks up
  a stray pink/red wash. Use a FULLY OPAQUE background (`hsl(var(--background))`, no alpha, no
  `backdrop-filter`) so the bar is always clean whatever is behind it.

- **Don't strip the signed-in user's profile (avatar + name) from the global topbar / header.** It
  is the orientation anchor — the user must always see *who they are signed in as* in the top
  right, even when the page body already has its own identity hero. Leaving only a locale switcher
  + "Sign out" makes the topbar look empty or broken. Keep the profile chip (avatar + name) in the
  `Topbar` `end` slot; the page hero is additive, not a replacement.
