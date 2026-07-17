/**
 * Layout & spacing prop types.
 * @see docs/PROPS-VOCABULARY.md#layout--density
 */

/** Page-level density — affects padding, control heights across PageContainer subtree. */
export type PageDensityProp = "compact" | "default" | "comfortable";

/** Shared page/subtree density vocabulary. */
export type DensityProp = "compact" | "default" | "comfortable";

/** Page shell layout — orthogonal to PageDensityProp. */
export type PageContainerVariantProp = "default" | "narrow" | "flush" | "ghost";

/** CenteredShell content-column max-width tier — sm ~32rem, md ~46rem, lg ~64rem. */
export type CenteredShellWidthProp = "sm" | "md" | "lg";

/** Shared gap between layout children; components may document subsets. */
export type GapProp = "xs" | "sm" | "md" | "lg" | "xl";

/** DataTable row density subset. */
export type TableDensityProp = Exclude<DensityProp, "default">;
