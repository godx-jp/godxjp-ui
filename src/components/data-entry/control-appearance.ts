import type * as React from "react";

import type { ControlStatusProp, ControlVariantProp } from "../../props/vocabulary";
import type { ControlCountProp } from "../../props/components/data-entry.prop";

/**
 * The two appearance axes Ant Design puts on every text field — `status` and `variant` — resolved
 * once, here, so Input / Textarea / NumberInput / PasswordInput / SearchInput cannot drift into
 * three different spellings of "this field is wrong".
 *
 * WHY A HELPER AND NOT A CLASS PER COMPONENT. `status` has a SECOND half that is not paint:
 * `error` must also report `aria-invalid`, or the red boundary is a lie to a screen reader. That
 * pairing is the thing worth keeping in one place; the CSS is the easy half.
 */
export type ControlAppearanceInput = {
  status?: ControlStatusProp;
  variant?: ControlVariantProp;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
};

export type ControlAppearanceAttributes = {
  "data-status"?: ControlStatusProp;
  "data-variant"?: ControlVariantProp;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
};

/**
 * `status="error"` REPORTS `aria-invalid` — unless the caller (or FormField, which injects it)
 * already said something, in which case the explicit value wins and nothing is overwritten.
 * `status="warning"` deliberately reports nothing: a warning is not a validity failure, and
 * antd does not announce one either (es/_util/statusUtils.js only reaches for the class name).
 */
export function controlAppearanceAttributes({
  status,
  variant,
  "aria-invalid": ariaInvalid,
}: ControlAppearanceInput): ControlAppearanceAttributes {
  return {
    "data-status": status,
    "data-variant": variant,
    "aria-invalid": ariaInvalid ?? (status === "error" ? true : undefined),
  };
}

/**
 * The chrome utilities a variant carries, kept in the COMPONENT rather than in `control.css`.
 *
 * A Tailwind utility lives in `@layer utilities`, which outranks `@layer components` no matter
 * how specific the component rule is — so `bg-background` baked unconditionally into the class
 * list would silently defeat `filled` and `borderless` and no gate would notice. The outlined
 * field therefore keeps exactly the utilities it always had, and the other two simply do not
 * receive them; their surface comes from `.ui-control--filled` / `.ui-control--borderless`.
 */
export const CONTROL_VARIANT_CHROME_CLASS: Record<ControlVariantProp, string> = {
  outlined: "border-input bg-background",
  filled: "ui-control--filled",
  borderless: "ui-control--borderless",
};

/**
 * The status BOUNDARY, for the same cascade-layer reason — and this one was measured the hard way.
 *
 * `.ui-control[data-status="warning"] { border-color: … }` in `@layer components` renders exactly
 * nothing: `border-input` is a utility, utilities are a later layer, and a later layer wins over
 * any specificity. In Chromium the warned field measured `rgb(144 135 127)` — the resting border —
 * with the component rule in place and no error anywhere. Painting it from a utility instead puts
 * the two declarations in the SAME layer, where `data-[status=…]` (0,2,0) genuinely outranks
 * `border-input` (0,1,0). It is also the mechanism the library already used for the invalid state
 * (`aria-invalid:border-destructive`), so the two states now paint the same way.
 *
 * The `--focus-*` reassignments stay in `control.css`: those are custom properties, and no utility
 * competes for them.
 */
export const CONTROL_STATUS_CHROME_CLASS =
  "data-[status=error]:border-destructive data-[status=warning]:border-warning";

/** Default `count.strategy` — code points, so a surrogate pair counts once. */
export function countCodePoints(value: string): number {
  return [...value].length;
}

export type ResolvedControlCount = {
  count: number;
  max?: number;
  exceeded: boolean;
  content: React.ReactNode;
};

/** `null` when the counter is switched off (no `count`, or `count.show === false`). */
export function resolveControlCount(
  config: ControlCountProp | undefined,
  value: string,
): ResolvedControlCount | null {
  if (!config || config.show === false) return null;
  const strategy = config.strategy ?? countCodePoints;
  const count = strategy(value);
  const max = config.max;
  return {
    count,
    max,
    exceeded: max != null && count > max,
    content: config.formatter
      ? config.formatter({ value, count, max })
      : max == null
        ? String(count)
        : `${count} / ${max}`,
  };
}
