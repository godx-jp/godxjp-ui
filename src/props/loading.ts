// Re-export the canonical loading vocabulary defined alongside Form /
// FormField. Co-locating the definition with the primitives that own
// the FormLoadingCtx avoids a circular dependency; this file keeps the
// public surface under `@godxjp/ui/props/loading` so external consumers
// have a single sub-path for every shared prop type.
export {
  normalizeLoading,
  type LoadingKind,
  type LoadingOptions,
  type LoadingProp,
  type NormalizedLoading,
} from "../components/data-entry/loading";
