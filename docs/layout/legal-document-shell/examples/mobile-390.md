---
title: Viewport 390x844
viewport: 390x844
---

## Documented mobile behaviour

Below the **56rem** container threshold the shell collapses to one column and the DOM order is
exactly the reading order:

1. document header (`h1` · version · `<time>` effective date · summary)
2. **contents** — a static compact block
3. the sections
4. `footerAction`

The rail is **deliberately not sticky and not height-capped** at this size: pinning a 8-item contents
list on a 390×844 screen costs more vertical space than it saves, and a height-capped inner scroller
inside a page scroller is a known touch-scroll trap. The entries stay real anchors with the same
`--legal-document-scroll-offset` and the same focus handoff, so tapping one jumps to — and focuses —
the section.

Nothing here is a media query: the same rules apply to a 56rem-narrow pane on a large screen.
