---
title: Overview
---

The core action control — every clickable action is a `Button` (never a raw `<button>`).
Pick the variant by intent (one primary per view), the size from the preset, and use
`asChild` to render links with button styling. See Examples for real usage in context.

For filter tabs / segmented toggles that show a per-option total, pass the `count` prop
(`<Button variant="outline" count={18}>Chờ bay</Button>`) instead of nesting a `Badge` —
it renders a borderless counter pill, formatted in the active locale and toned to the
button variant, so an outline button never ends up with a doubled border.
