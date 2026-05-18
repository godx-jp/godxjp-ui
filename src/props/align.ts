/**
 * Shared cross-axis alignment prop-vocabulary per cardinal rule 23 §B.
 *
 * `AlignProp` is the CSS-flexbox alignment ladder used by Flex and
 * row-shaped composites (PageHeader row, IconRow). Mirrors the values
 * `align-items` accepts, dropped to the five that have meaningful
 * design canon.
 */

export type AlignProp =
  | "start"
  | "end"
  | "center"
  | "stretch"
  | "baseline";
