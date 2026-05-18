/**
 * `@godxjp/ui/props` — shared prop-vocabulary types.
 *
 * One central source of truth for the cross-cutting vocabulary defined
 * in cardinal rule 23 §B. Primitives import the types they need from
 * here instead of defining their own per-file aliases, so:
 *
 *   1. The vocabulary stays consistent — adding a new size value
 *      (e.g. `"x-large"`) is one edit, not 20.
 *   2. Tracking is trivial — `grep -rln '"../../props"' src/components/`
 *      lists every primitive consuming the shared types.
 *   3. Consumer apps can author their own primitives using the same
 *      vocabulary: `import type { SizeProp, StatusProp } from "@godxjp/ui/props"`.
 *
 * Naming convention: every value-union exported here ends in singular
 * `Prop` (matches `LoadingProp`) so it's unambiguous at import sites.
 * Primitives may extend a base type (Button uses `SizeWithXSProp`)
 * but must NOT redefine the base values inline.
 */

export type { SizeProp, SizeWithXSProp, IconSizeProp } from "./size";
export type { StatusProp, ToneProp, HelpToneProp } from "./status";
export type { OrientationProp } from "./orientation";
export type { DensityProp } from "./density";
export type { SideProp, PlacementProp } from "./side";
export type { PaddingProp } from "./padding";
export type { AlignProp } from "./align";
export type { ColorProp, FeedbackColorProp } from "./color";
export {
  normalizeLoading,
  type LoadingKind,
  type LoadingOptions,
  type LoadingProp,
  type NormalizedLoading,
} from "./loading";
