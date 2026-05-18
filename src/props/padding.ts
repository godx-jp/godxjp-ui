/**
 * Shared `padding` prop-vocabulary per cardinal rule 23 §B.
 *
 * `PaddingProp` is the canonical 4-step ladder used by surface
 * containers — Card, PageHeader, and equivalent composites — to pick
 * how much breathing room sits between the inner content and the
 * container's edge.
 *
 * Density is a separate axis (see `DensityProp`): density rescales the
 * primitive's internal element heights, padding rescales the outer
 * gutter. Most consumers want padding (visual breathing room) without
 * touching density (row heights).
 */

export type PaddingProp = "tight" | "default" | "cozy" | "none";
