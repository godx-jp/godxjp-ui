# GoDX service icons (interim set, approved 2026-10-06)

One icon per production service, keyed by its `services.slug`. They are original geometry, with no
third-party logos and no emoji.

The system: a 64×64 grid with a radius-14 tile filled flat in the GoDX brand green #008066 (the
GoDX preset's `--brand`, the logo's and the primary button's colour; it replaced the violet→navy
gradient in gh#1345). Each tile carries one white glyph at stroke 4, with round caps and joins,
inside the 16–48 live area. White on the tile measures 4.91:1. Every icon is legible from 24 to 64 px. At 24 px the closest pair
still differs in 50 of 576 pixels.

| file                 | use                                                                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `svg/<slug>.svg`     | Master, with a rounded tile and transparent corners                                                                                                                                                        |
| `png/512/<slug>.png` | Admin → カタログ upload. A full-bleed, fully opaque square, because the catalog crops with `object-fit: cover` and rounds the image itself. Accepts jpeg/png/webp up to 2048 KB; this set is ~250 KB each. |
| `png/256/<slug>.png` | The rounded tile as a raster                                                                                                                                                                               |

Slugs: approval · content · godx-chatter · godx-logger · godx-mailer · kintai · media · speedhr · task · tempo

Regenerate: `node assets/service-icons/generate.mjs assets/service-icons && node assets/service-icons/rasterize.mjs assets/service-icons`.
The full-bleed sources go to `.square/`, which is ignored by git.

These files are not part of the npm package. A list of GoDX services is platform data, not a
framework component.
