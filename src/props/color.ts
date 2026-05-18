/**
 * Shared semantic-color prop-vocabulary per cardinal rule 23 §B.
 *
 * Every primitive that exposes a `color` prop picks from this superset.
 * Each value maps 1:1 to a CSS variable (`--info`, `--success`,
 * `--warning`, `--destructive`, `--attention`, `--primary`, `--secondary`)
 * — same semantic slot across the whole system, only the hue / intensity
 * scale shifts per primitive (cardinal rule 21 — `data-accent` rebinds
 * `--primary`'s hue without renaming the slot).
 *
 * Existing primitives (AlertColor, ResultColor, ProgressColor,
 * TagPresetColor, TimelineColor, TypographyColor) each accept a subset
 * — point their aliases at `Extract<ColorProp, …>` instead of
 * redeclaring the literals inline.
 *
 * Vocabulary note: the canonical name for the danger / error slot is
 * `"destructive"` (4 of 6 primitives already use it). Tag's
 * `TagPresetColor` still uses `"error"` for legacy reasons — that
 * alias should migrate in a follow-up.
 */

export type ColorProp =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "destructive"
  | "attention"
  | "primary"
  | "secondary";

/** Subset accepted by feedback primitives — same 5-slot ladder used
 * by Alert / Result / Progress (no brand `primary`, no text-only
 * `secondary` / `attention`). */
export type FeedbackColorProp = Extract<
  ColorProp,
  "default" | "info" | "success" | "warning" | "destructive"
>;
