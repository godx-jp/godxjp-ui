# Premium UI study: what the browser showed (Claude, driven in Chromium 1440×900 and 390×844)

Method:
- `explore.mjs` hovers and clicks up to 14 premium targets per demo and captures frames at 0/120/400 ms. It records `document.getAnimations()` and the static transition inventory; output is in `browser/<slug>/report.json` and `sheet.png`.
- `flows.mjs` runs real user flows (typing, multi-pick, vote, bulk delete, submit) and captures frames plus the live animations per step; output is in `flows/`.
- Counts that `cssRules` could not reach under `file://` were re-measured with grep.

## Measured across all 27 demos

| Measure | Result |
|---|---|
| `prefers-reduced-motion` handled | **0 / 27** (grep) |
| `:focus-visible` styles | **0 / 27** (grep) |
| Any `aria-*` attribute in the HTML | **2 / 27** |
| Horizontal overflow at 390 px | **12 / 27**, worst: mega-menu 610 px, login 194, date_time 170, feature-card 160, search 130, navigation-dropdown 123 |
| Most common transition | `transition: 0.3s` with the default `ease` and **property `all`** (≈ 60 declarations). It animates every property, including layout. |
| Custom easings used | `cubic-bezier(0.22,0.61,0.36,1)` (ease-out-quart family) ×4 · `(0.16,1,0.3,1)` (expo-out) ×2 · `(0.22,1,0.36,1)` ×1 · `(0.65,0,0.35,1)` ×1 · `(.68,-.55,.27,1.55)` (back overshoot) ×2 |
| Duration bands seen live | 200–300 ms for colour/border/opacity on controls · 250–450 ms for overlay enter (opacity + translate) · 450 ms for a sliding indicator · 800 ms panel `flex-grow` · 1100 ms image drift · 3000 ms toast countdown (linear) |

## What only the browser showed

1. **Selection hand-off, not a jump** (dock-navigation). The newly chosen item fills at once. The previous one fades through a tinted ghost (visible at 120 ms) to plain (400 ms), so the eye sees where the selection came from. Hover shows a label tooltip at once.
2. **A sliding active indicator** (navigation-dropdown). It animates `left`/`width` for 450 ms with a **back-overshoot** easing, so at 0 ms the pill sits mid-flight and overshoots. The idea (one indicator that travels) is VALUE. The implementation is HARMFUL for us: it animates layout properties, and overshoot is wrong for data UI. Translate with `transform` and an ease-out instead.
3. **Staged reveal** (vertical-image-accordion). The panel grows first (`flex-grow` 800 ms, ease-out-quart); the title, copy and CTA appear only after it has room. The image drifts 1100 ms. Content never animates while its box is still resizing.
4. **Live per-rule validation** (password). The border and meter recolour with strength (weak red → medium orange → strong green). Each rule chip flips from ○ to ✓ the moment it is met, and the meter width grows. Floating label on focus. **Flaw seen live:** after ONE character every rule turns red at once. That is premature error; stay neutral until the user pauses or blurs.
5. **Count-bearing primary action** (bulk-delete, multiselect). "Delete 3 Items" and "N Selected" put the count in the action itself. The CTA is visibly disabled at 0, and selected cards get a tinted border and fill. **Fake progress seen live:** delete runs a 1,200 ms `requestAnimationFrame` ring from 0 to 100% (`script.js:88-105`) while cards "fly" to the trash. No work happens and there is no undo. HARMFUL: commit at once and offer Undo.
6. **Results that grow into place** (poll). After the vote, each option's background bar fills from 0 to its share (visible between 0 and 500 ms), the chosen option gets a check, and the percentages sit right-aligned in tabular figures.
7. **Search that teaches itself** (search). A `Ctrl + K` hint shows at rest and fades while typing. A clear (×) button appears only with text. Results are grouped (SUGGESTIONS / RECENT SEARCHES with its own Clear), ArrowDown highlights the first row, and a focus glow ring marks the field.
8. **Rich option rows** (multiselect, navigation-dropdown, cascading-dropdown). Each row has an icon tile, a label and a muted sub-label, with a group heading ("POPULAR") above. Panels have an in-panel search and a Clear/Apply footer, and the selected state shows as both a checkbox and a tinted row.
9. **Decoration that is not UX** (login). The "premium" login is a gradient title, a gradient button and dot-grid shapes. Validation is still the browser's native bubble, an invalid email is not flagged inline, and the page overflows 194 px at 390. Prettier, not better.
10. **Ambient countdown** (toast). The progress bar shrinks linearly over 3 s, which shows the remaining time honestly. The close button scales on hover (`transform` 200 ms). There is no pause-on-hover, so a reader can lose the message mid-read.

Frames: `browser/<slug>/sheet.png` (hover, then click at 0, 120 and 400 ms) and `flows/sheet-<slug>.png` (step by step).
