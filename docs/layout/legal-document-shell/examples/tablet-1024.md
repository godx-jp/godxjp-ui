---
title: Viewport 1024x900
viewport: 1024x900
---

Still above the 56rem container threshold, so the **sticky rail is kept** and only the document
column narrows: the rail track is fixed (`--legal-document-toc-width`) and the measure track is
`minmax(0, var(--legal-document-measure-max-width))`.

Nothing overflows horizontally and **no consumer CSS changes** between 1440 and 1024 — the shell's own
container query does the work.
