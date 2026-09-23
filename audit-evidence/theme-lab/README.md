# theme-lab — gh#882 evidence

`/showcase/theme-lab?theme=<id>&seed=<id>`, captured by `node scripts/measure-glass.mjs <port> --shots`.

- `<theme>-<seed>.png` — the top of the page for every cell of the matrix: the shell, the switcher
  and the seed read-out. Fifteen cells: three themes (`base`, `glass`, `flat`) × five seeds
  (violet, azure, coral, citron `#FFD400`, navy `#0A1F44`).
- `glass-<seed>-dialog.png` — the Dialog open over its scrim, for the default seed and for the two
  extreme ones. The panel is at 88% and the Sheet at 92% over a 62% scrim on every seed; the table
  in `../theme-lab-measure.txt` carries the computed fills for all five, which is the part a
  screenshot cannot settle.

The numbers live in `../theme-lab-measure.txt`: per cell, every surface's computed fill, blur,
saturate, edge, shadow and radius; every overlay OPENED and measured; every interaction state
hovered and keyboard-focused; and every string's composited contrast against the worst band the
backdrop can produce.
