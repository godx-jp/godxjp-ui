---
title: Viewport 1440x900
viewport: 1440x900
---

Reference desktop geometry. The shell is wider than 56rem, so the contents render as a **sticky rail**
on the start side — spanning the header, body and footer rows — beside a 46rem measure-capped
document column.

Scroll the frame: the active contents entry tracks the reading line (`aria-current="location"` + the
leading marker + a heavier weight), and the rail stays pinned at
`--legal-document-toc-inset-block-start`.
