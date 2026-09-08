import type * as React from "react";
import type {
  AllowClearProp,
  ControlStatusProp,
  ControlVariantProp,
  MaxTagPlaceholderProp,
  SizeProp,
} from "../../props/vocabulary";

/**
 * The DOM attributes that put a control on the `variant` × `status` × `size` matrix owned by
 * `.ui-control-surface` in `src/styles/control.css`.
 *
 * Written once, here, rather than five times: every member of the select family (Select,
 * SearchSelect, Cascader, TreeSelect, TagInput) states the antd surface contract the same way, and
 * a per-component copy is how the five drift apart. Each default (`outlined`, `md`) emits NO
 * attribute at all, so a control that says nothing keeps the exact DOM it had.
 */
export function controlSurfaceAttrs(props: {
  variant?: ControlVariantProp;
  status?: ControlStatusProp;
  size?: SizeProp;
}): {
  "data-variant"?: ControlVariantProp;
  "data-status"?: ControlStatusProp;
  "data-size"?: SizeProp;
} {
  return {
    "data-variant": props.variant && props.variant !== "outlined" ? props.variant : undefined,
    "data-status": props.status,
    "data-size": props.size && props.size !== "md" ? props.size : undefined,
  };
}

/**
 * `status="error"` must also reach assistive tech, so it folds into `aria-invalid`.
 *
 * antd's own `status="error"` is a pure recolour — a state announced by hue alone, which WCAG 2.2
 * SC 1.4.1 does not accept. An `aria-invalid` arriving from `FormField` always wins: the field's
 * validation state is the authority, and a `status` prop must never be able to talk it down.
 */
export function resolveAriaInvalid<T extends React.AriaAttributes["aria-invalid"]>(
  ariaInvalid: T,
  status: ControlStatusProp | undefined,
): T | true | undefined {
  if (ariaInvalid !== undefined) return ariaInvalid;
  return status === "error" ? true : undefined;
}

/** The normalised clear affordance: whether to offer it, with what icon, under what label. */
export type ResolvedAllowClear = {
  enabled: boolean;
  clearIcon?: React.ReactNode;
  label?: string;
};

/**
 * Reconcile antd's `allowClear` with this library's own `clearable`.
 *
 * `allowClear` wins when present because it is the more specific statement — the object form
 * carries an icon and a label that `clearable` has no way to express. `clearable` remains the
 * name every existing call site uses, and keeps its `true` default.
 */
export function resolveAllowClear(
  allowClear: AllowClearProp | undefined,
  clearable: boolean | undefined,
  fallbackLabel?: string,
): ResolvedAllowClear {
  if (allowClear !== undefined) {
    if (typeof allowClear === "boolean") {
      return { enabled: allowClear, label: fallbackLabel };
    }
    return {
      enabled: true,
      clearIcon: allowClear.clearIcon,
      label: allowClear.label ?? fallbackLabel,
    };
  }
  return { enabled: clearable !== false, label: fallbackLabel };
}

/**
 * Apply antd's `maxTagCount` / `maxTagPlaceholder` to a list of selected values.
 *
 * Returns the values that stay visible plus the overflow node, so the three call sites (Cascader,
 * TreeSelect, TagInput) agree on what "+2" means. `maxTagCount` is only honoured when it is a
 * non-negative number — `undefined` shows everything, which is the antd default.
 *
 * `overflow` is `undefined` when the consumer supplied no `maxTagPlaceholder`: the fallback wording
 * is a COUNT, and a count has to go through `t()` + `Intl.PluralRules` at the call site rather than
 * be concatenated here.
 */
export function applyMaxTagCount<T extends { value: string; label: React.ReactNode }>(
  items: T[],
  maxTagCount: number | undefined,
  maxTagPlaceholder: MaxTagPlaceholderProp | undefined,
): { visible: T[]; omitted: T[]; overflow: React.ReactNode | undefined } {
  if (maxTagCount === undefined || maxTagCount < 0 || items.length <= maxTagCount) {
    return { visible: items, omitted: [], overflow: undefined };
  }
  const visible = items.slice(0, maxTagCount);
  const omitted = items.slice(maxTagCount);
  const overflow =
    typeof maxTagPlaceholder === "function"
      ? maxTagPlaceholder(omitted.map(({ value, label }) => ({ value, label })))
      : maxTagPlaceholder;
  return { visible, omitted, overflow };
}
