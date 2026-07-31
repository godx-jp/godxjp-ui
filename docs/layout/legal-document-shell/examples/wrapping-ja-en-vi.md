---
title: Wrapping JA / EN / VI
viewport: 1440x900
---

One document, three scripts, deliberately hostile line-breaking material.

| Script | Hazard                                     | Rule that handles it                                        |
| ------ | ------------------------------------------ | ----------------------------------------------------------- |
| JA     | no spaces; punctuation may not start a line | `line-break: strict` (kinsoku)                              |
| EN     | long compounds and a query-string URL      | `overflow-wrap: break-word` — breaks those, and only those  |
| VI     | diacritic-heavy words                      | `word-break: normal` — "nghĩa" is never split mid-word       |

All three read at `--legal-document-body-line-height` (1.8) inside the 46rem measure, and a long `h2`
wraps within the measure while keeping `--legal-document-section-title-gap` to its body.

Resize the frame down to 390px: the rules are width-independent, so nothing changes except the
column count.
