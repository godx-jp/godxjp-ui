import type * as React from "react";

/**
 * The accessible-name / description / validation contract that {@link FormField} injects onto its
 * single control child (via `cloneElement`). EVERY form-capable `@godxjp/ui` component accepts
 * these props and forwards them to its **semantic focus target** — the real `<input>` / combobox /
 * trigger the user tabs to, never a presentational wrapper `<div>`. Without this forwarding the
 * visible label / helper / error rendered by FormField is silently disconnected from the control
 * for assistive technology (issue #164).
 *
 * These are the standard WAI-ARIA field relationships:
 * - `aria-labelledby` — points at the FormField label → the control's accessible **name**.
 * - `aria-describedby` — points at helper text → the control's **description**.
 * - `aria-errormessage` + `aria-invalid` — the validation message, announced when invalid.
 * - `aria-required` — required-field semantics.
 * - `aria-label` — a name supplied directly (used when there is no visible label element).
 */
export interface FieldA11yProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-required"?: React.AriaAttributes["aria-required"];
}

const FIELD_A11Y_KEYS = [
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-errormessage",
  "aria-invalid",
  "aria-required",
] as const;

/**
 * Merge one or more space-separated id-reference lists (`aria-describedby`, `aria-labelledby`,
 * `aria-errormessage`) into a single deduplicated token list. Returns `undefined` when empty so the
 * attribute is omitted rather than rendered as `""`.
 */
export function mergeAriaIds(...values: Array<string | undefined>): string | undefined {
  return (
    Array.from(new Set(values.flatMap((value) => value?.split(/\s+/).filter(Boolean) ?? []))).join(
      " ",
    ) || undefined
  );
}

/**
 * Extract ONLY the defined field-a11y attributes from a props bag, ready to spread onto a
 * component's semantic focus target. Undefined entries are dropped so a forwarded contract never
 * clobbers a control's own intrinsic `aria-label` / `aria-invalid`.
 *
 * ```tsx
 * const fieldA11y = pickFieldA11y(props);
 * return <input {...fieldA11y} />; // the real focus target owns the relationship
 * ```
 */
export function pickFieldA11y(props: FieldA11yProps): FieldA11yProps {
  const out: Record<string, unknown> = {};
  for (const key of FIELD_A11Y_KEYS) {
    const value = props[key];
    if (value !== undefined) out[key] = value;
  }
  return out as FieldA11yProps;
}

/**
 * The inverse of {@link pickFieldA11y}: everything EXCEPT the field-a11y attributes. Use it when a
 * component must route the contract somewhere other than the element the remaining props land on —
 * e.g. `Select`'s compound API, where the props bag belongs to `SelectPrimitive.Root` (a
 * context-only component that renders no DOM) while the accessible name has to reach the trigger.
 */
export function omitFieldA11y<T extends FieldA11yProps>(props: T): Omit<T, keyof FieldA11yProps> {
  const out = { ...props } as Record<string, unknown>;
  for (const key of FIELD_A11Y_KEYS) delete out[key];
  return out as Omit<T, keyof FieldA11yProps>;
}

/**
 * As {@link pickFieldA11y}, but resolves the accessible **name** for a control that also has an
 * intrinsic `aria-label` (e.g. SearchInput's built-in "Search"): when the FormField supplies an
 * `aria-labelledby`, it wins and the intrinsic `aria-label` is dropped (a control must not carry
 * both — `aria-labelledby` takes precedence and the redundant `aria-label` only adds noise).
 */
export function resolveFieldA11y(
  props: FieldA11yProps,
  intrinsicAriaLabel?: string,
): FieldA11yProps {
  const picked = pickFieldA11y(props);
  if (picked["aria-labelledby"]) {
    // A visible label (via FormField) owns the name — drop any intrinsic aria-label.
    return picked;
  }
  if (picked["aria-label"] === undefined && intrinsicAriaLabel !== undefined) {
    picked["aria-label"] = intrinsicAriaLabel;
  }
  return picked;
}

/**
 * The field-a11y attributes valid on a **group container** (`role="group"`), used by composite
 * controls that have no single labelable focus target — CheckboxGroup, and the two-input range
 * pickers / Transfer shuttle.
 *
 * Per WAI-ARIA 1.2 only `aria-labelledby` and `aria-describedby` are globally allowed on
 * `role="group"`; `aria-invalid` / `aria-errormessage` / `aria-required` are widget-only and would
 * be an invalid-ARIA violation on a group. So the validation message id (`aria-errormessage`) is
 * **folded into `aria-describedby`** — the error text is still announced as part of the group's
 * description, and FormField's `role="alert"` error node announces it live regardless.
 *
 * `role="radiogroup"` IS a widget and supports the full validation set — those groups use
 * {@link pickFieldA11y} directly, not this helper.
 */
export function pickGroupFieldA11y(props: FieldA11yProps): {
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
} {
  const describedBy = mergeAriaIds(props["aria-describedby"], props["aria-errormessage"]);
  return {
    ...(props["aria-labelledby"] !== undefined
      ? { "aria-labelledby": props["aria-labelledby"] }
      : {}),
    ...(describedBy !== undefined ? { "aria-describedby": describedBy } : {}),
  };
}
