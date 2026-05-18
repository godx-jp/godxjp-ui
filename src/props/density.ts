/**
 * Shared density prop-vocabulary per cardinal rule 23 §B.
 *
 * Different from `SizeProp` — density rescales the surrounding padding /
 * row-height tokens (`--density-element-*`) while size targets the
 * primitive's own visual axis. Tables and lists use `density` to fit
 * more rows on screen without shrinking the type.
 */

export type DensityProp = "compact" | "default" | "comfortable";
