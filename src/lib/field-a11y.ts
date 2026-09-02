import * as React from "react";

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
 *
 * `data-field` travels the SAME route (gh#337) and is therefore part of this bag even though it is
 * not an ARIA attribute. It is the field's stable machine key — the `data-testid` role, standardised
 * on one attribute so a control never has to be found by a generated id or by its visible Japanese
 * label. It is inert (read-only metadata) and must land on the same semantic focus target the aria
 * relationships do; routing it through a second, parallel mechanism is how a control gets missed.
 */
export interface FieldA11yProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-required"?: React.AriaAttributes["aria-required"];
  /** Stable machine key of the field (gh#337) — see the interface doc above. */
  "data-field"?: string;
}

const FIELD_A11Y_KEYS = [
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-errormessage",
  "aria-invalid",
  "aria-required",
  "data-field",
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
 * The FormField label made reachable by NESTED controls (gh#303).
 *
 * `cloneElement` can only wire the field-a11y contract onto FormField's single direct child. When
 * that child is a layout wrapper (a `Flex` holding a range from/to pair, a 年/月 input+select
 * combo), the naming attributes stop on the wrapper `div` and every control inside is left with no
 * accessible name at all (axe: `label` on the inputs, `button-name` on select/combobox triggers).
 *
 * FormField therefore also publishes its label through this context, and each control's semantic
 * focus target picks it up as a LAST-RESORT name via {@link useFieldNameFallback}: a control that
 * already has a name — its own `aria-label`/`aria-labelledby`, or the one FormField cloned onto it
 * as the direct child — keeps it untouched. Multiple nested controls then all announce the field's
 * label; a consumer wanting distinct names (e.g. "開始日" / "終了日") sets `aria-label` per
 * control, which always wins.
 */
export interface FieldNameContextValue {
  /** DOM id of FormField's visible label element (the `aria-labelledby` target). */
  labelId: string;
  /** The label's plain-text content, when it is a string (belt-and-suspenders `aria-label`). */
  label?: string;
}

export const FieldNameContext = React.createContext<FieldNameContextValue | null>(null);

/**
 * Resolve the last-resort accessible name for a control's semantic focus target (see
 * {@link FieldNameContext}). Returns `{}` — never clobbering anything — unless the control is
 * inside a FormField AND still nameless after its own props and the cloned contract are applied.
 */
export function useFieldNameFallback(
  name: Pick<FieldA11yProps, "aria-label" | "aria-labelledby">,
): Pick<FieldA11yProps, "aria-label" | "aria-labelledby"> {
  const field = React.useContext(FieldNameContext);
  if (!field || name["aria-label"] !== undefined || name["aria-labelledby"] !== undefined) {
    return {};
  }
  return {
    "aria-labelledby": field.labelId,
    ...(field.label !== undefined ? { "aria-label": field.label } : {}),
  };
}

/**
 * The enclosing `FormField`, made reachable by NESTED controls (gh#337).
 *
 * `cloneElement` reaches FormField's single DIRECT child only. In the real screens this library
 * serves, 322 of 1,410 controls (23%) sit one level deeper — the direct child is a `Flex` holding a
 * from/to pair, a 年/月 combo, or a value + 「不明」 checkbox — so the machine key stopped on the
 * wrapper `div` and the controls inside stayed anonymous. The customer's acceptance condition is
 * 「画面に見えている入力欄の100%に付与されていること」; 77% does not pass.
 *
 * The key for such a control is its OWN `id`, and that is a finding, not a convention invented
 * here: of those 322, **250 already carry a static id** and the ambiguous case the wrapper creates
 * — two controls under one field — is already distinguished at the call site
 * (`search_billing_date_from` / `..._to`, `fax` / `fax_unknown`). So a nested control names itself
 * and no two controls can ever end up sharing a key. The remaining 72 (48 computed ids, 24 with no
 * id at all) get NOTHING: a fabricated key is worse than a missing one, because automation would
 * bind to it and break silently on the next render.
 */
export interface FieldIdentityContextValue {
  /** Whether the app opted into a native `name` (@see AppProviderProp.emitFieldNames). */
  emitName: boolean;
}

export const FieldIdentityContext = React.createContext<FieldIdentityContextValue | null>(null);

/**
 * Resolve `data-field` / `name` for a control nested under a `FormField` (see
 * {@link FieldIdentityContext}). Returns `{}` — adding nothing — in every case but the one it
 * exists for, which is what keeps it safe to call from every control:
 *
 * - **outside a FormField** → `{}`. A control elsewhere on the page is untouched.
 * - **`data-field` already present** → `{}`. Either `FormField` cloned it onto its direct child, or
 *   a composite (DatePicker, Select) already resolved this field and is passing it down. Whoever
 *   owns the field owns BOTH attributes, so `name` is not second-guessed here either — that is what
 *   keeps DatePicker's ISO mirror (`name` belongs to the hidden `yyyy-MM-dd` input, not the visible
 *   `yyyy/MM/dd` one) and Select's native `<select>` intact.
 * - **no `id` of its own** → `{}`. Nothing to derive a stable key from; see the interface doc.
 */
export function useFieldIdentity(own: { id?: string; name?: string; "data-field"?: string }): {
  "data-field"?: string;
  name?: string;
} {
  const ctx = React.useContext(FieldIdentityContext);
  if (!ctx || own["data-field"] !== undefined || own.id === undefined) return {};
  return {
    "data-field": own.id,
    ...(ctx.emitName && own.name === undefined ? { name: own.id } : {}),
  };
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
  "data-field"?: string;
} {
  const describedBy = mergeAriaIds(props["aria-describedby"], props["aria-errormessage"]);
  return {
    ...(props["aria-labelledby"] !== undefined
      ? { "aria-labelledby": props["aria-labelledby"] }
      : {}),
    ...(describedBy !== undefined ? { "aria-describedby": describedBy } : {}),
    // Not an ARIA attribute and so not subject to the role="group" restriction above — a group
    // still has to be findable by its field key (gh#337).
    ...(props["data-field"] !== undefined ? { "data-field": props["data-field"] } : {}),
  };
}
