/**
 * Shared `size` prop-vocabulary per cardinal rule 23 §B.
 *
 * Most primitives accept `"small" | "default" | "large"`. Button extends
 * this with `"x-small"` for compact icon-bar / table-row contexts.
 * IconButton / Spinner use the `sm | md | lg` shorthand (visual symbol
 * sizing — the height token comes from `--density-element-*` regardless).
 *
 * Naming convention: every shared prop-vocabulary type ends in singular
 * `Prop` so it's unambiguous at import sites (matches `LoadingProp` and
 * disambiguates from third-party `Size` types).
 */

export type SizeProp = "small" | "default" | "large";

/** Button + composites that need a tighter step below `small`. */
export type SizeWithXSProp = "x-small" | SizeProp;

/** Icon-only primitives whose visual axis is a glyph, not a height. */
export type IconSizeProp = "sm" | "md" | "lg";
