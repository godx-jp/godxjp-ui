/**
 * Shared `loading` prop-vocabulary for Form / FormField / data-entry
 * primitives.
 *
 *   loading={true}                       → spinner (default kind)
 *   loading={false}                      → off
 *   loading={{ kind: "skeleton" }}       → skeleton placeholder (use for
 *                                          "data is being fetched the
 *                                           first time" — UX nuance)
 *   loading={{ kind: "spinner",
 *              label: "保存中..." }}     → spinner with aria-label
 *
 * Cascade rules:
 *   - <Form loading={…}> sets a default for every <FormField> inside.
 *   - <FormField loading={…}> overrides the Form default for that field.
 *   - A primitive's own `loading` prop overrides both.
 */

export type LoadingKind = "spinner" | "skeleton";

export interface LoadingOptions {
  /** Default `"spinner"`. */
  kind?: LoadingKind;
  /** Accessible label announced to screen readers. */
  label?: string;
}

export type LoadingProp = boolean | LoadingOptions;

export interface NormalizedLoading {
  active: boolean;
  kind: LoadingKind;
  label?: string;
}

/**
 * Coerce the union shape into `{active, kind, label}` so consumers can
 * branch on a single object instead of repeating `typeof prop === …`.
 */
export function normalizeLoading(
  prop: LoadingProp | undefined,
  defaultKind: LoadingKind = "spinner",
): NormalizedLoading {
  if (prop === undefined || prop === false) {
    return { active: false, kind: defaultKind };
  }
  if (prop === true) return { active: true, kind: defaultKind };
  return {
    active: true,
    kind: prop.kind ?? defaultKind,
    label: prop.label,
  };
}
