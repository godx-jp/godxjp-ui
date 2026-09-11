import * as React from "react";
import { Checkbox as AriaCheckbox } from "react-aria-components";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/utils";
import { useFieldIdentity } from "../../lib/field-a11y";
import { CheckboxGroup } from "./checkbox-group";
import { withOwnHitTarget } from "./choice-hit-target";

/**
 * The glyph a checkbox paints for a given `data-state`. A dash for "indeterminate" (a PARTIAL
 * selection — DataTable / Transfer select-all, a Cascader parent with some leaves checked) and a
 * tick for "checked". Painting the tick for both made a partial selection read as "all selected".
 */
function CheckboxGlyph({ state }: { state: boolean | "indeterminate" }) {
  return state === "indeterminate" ? (
    <Minus className="ui-checkbox-icon" aria-hidden="true" />
  ) : (
    <Check className="ui-checkbox-icon" aria-hidden="true" />
  );
}

/**
 * Decorative checkbox glyph — a non-interactive `<span>`, NOT the real {@link Checkbox} (which is a
 * real `<input>` wrapped by react-aria-components). Used where the row itself is the interactive
 * element and a nested control would be invalid HTML (Cascader's option rows). Shares
 * {@link CheckboxGlyph} so "partial" can never drift apart from the real control's rendering again.
 */
export function CheckboxVisual({
  checked,
  indeterminate,
  disabled,
  className,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const state: boolean | "indeterminate" = indeterminate ? "indeterminate" : checked;
  return (
    <span
      aria-hidden="true"
      data-slot="checkbox"
      data-state={indeterminate ? "indeterminate" : checked ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      className={cn("ui-checkbox inline-flex items-center justify-center", className)}
    >
      {/* No state → no glyph. `.ui-checkbox[data-state="checked"]` in styles/control.css owns the
          fill; an indeterminate box deliberately keeps the resting fill and shows only the dash,
          the conventional way to draw a partial selection. */}
      {checked || indeterminate ? <CheckboxGlyph state={state} /> : null}
    </span>
  );
}

/**
 * The PUBLIC prop shape, unchanged from the @radix-ui/react-checkbox era: `checked` /
 * `defaultChecked` accept the tri-state `"indeterminate"`, `onCheckedChange` reports it back, and
 * `disabled` / `required` keep their HTML spelling. react-aria-components spells the same four
 * `isSelected` + `isIndeterminate` / `defaultSelected` / `onChange` / `isDisabled` / `isRequired`;
 * that translation happens INSIDE this component and none of those names reach a consumer.
 */
interface CheckboxRootProps extends Omit<
  React.ComponentPropsWithoutRef<"button">,
  "checked" | "defaultChecked" | "onChange"
> {
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  required?: boolean;
}

const CheckboxRoot = React.forwardRef<HTMLLabelElement, CheckboxRootProps>((props, ref) => {
  const {
    className,
    checked,
    defaultChecked,
    onCheckedChange,
    disabled,
    required,
    value,
    tabIndex,
    "data-field": ownField,
    ...rest
  } = props as CheckboxRootProps & { "data-field"?: string };
  // The machine key for a Checkbox NESTED under a layout wrapper (the 「不明」 box beside
  // a value input is the shape this was measured on). `{}` in every other case, and the resolved
  // `name` reaches the native `<input>` react-aria renders, so the box still submits natively.
  const identity = useFieldIdentity({
    id: props.id,
    name: props.name,
    "data-field": ownField,
  });
  // gh#337 puts the machine key on the control's SEMANTIC FOCUS TARGET — the element that also
  // carries the `id` automation addresses it by. Under Radix that was this root `<button>`; under
  // react-aria it is the real `<input>`, which is where `id` and `name` already land. react-aria
  // strips every `data-*` off the input (RAC's `removeDataAttributes`) and re-emits them on the
  // root, so the key is written onto the input by hand here — and NOT left on the root as well,
  // because one field must resolve to exactly one node.
  const fieldKey = ownField ?? identity["data-field"];
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    if (fieldKey === undefined) {
      input.removeAttribute("data-field");
    } else {
      input.setAttribute("data-field", fieldKey);
    }
  }, [fieldKey]);
  // react-aria keeps the resolved check state in its own toggle state, and it is BOOLEAN — the
  // third value lives on a separate `isIndeterminate` flag. So an UNCONTROLLED box's tri-state is
  // mirrored here, otherwise `defaultChecked="indeterminate"` would keep painting a dash after the
  // first click. A controlled box reads straight off the prop.
  const [uncontrolled, setUncontrolled] = React.useState<boolean | "indeterminate">(
    defaultChecked ?? false,
  );
  const state = checked ?? uncontrolled;
  const invalid = props["aria-invalid"];
  return (
    <AriaCheckbox
      // `aria-label` / `aria-labelledby` / `aria-describedby` / `aria-errormessage` are forwarded
      // by react-aria onto the real `<input>` — the semantic focus target, which is also where
      // `id` and `name` land. The FormField contract is satisfied; only the host element moved.
      {...(rest as unknown as Record<string, never>)}
      ref={ref}
      inputRef={inputRef}
      data-slot="checkbox"
      // Radix wrote `data-state` itself; react-aria writes `data-selected` / `data-indeterminate`
      // instead, so it is restored here by hand. `.ui-checkbox[data-state="checked"]` in
      // styles/control.css owns the checked fill and would go dark without it.
      data-state={state === "indeterminate" ? "indeterminate" : state ? "checked" : "unchecked"}
      name={identity.name ?? props.name}
      value={value as string | undefined}
      isSelected={state === true}
      isIndeterminate={state === "indeterminate"}
      isDisabled={disabled}
      isRequired={required}
      // react-aria drops a raw `aria-invalid`; `isInvalid` is the knob that puts it back on the
      // input (and `data-invalid` on this root, which the class below now keys off).
      isInvalid={invalid !== undefined && invalid !== false && invalid !== "false"}
      // `tabIndex={-1}` is how a caller takes the box out of the tab ring when the ROW is the tab
      // stop (TreeSelect). react-aria filters raw DOM props off the root, so it is translated.
      excludeFromTabOrder={tabIndex !== undefined && tabIndex < 0}
      className={cn(
        // `disabled:cursor-not-allowed disabled:opacity-50` and the checked fill are DELETED, not
        // moved: `.ui-checkbox:disabled, .ui-checkbox[data-disabled]` and
        // `.ui-checkbox[data-state="checked"]` in styles/control.css already declare both, reading
        // --disabled-opacity and --checkbox-checked-background. Utilities are layered AFTER
        // components in Tailwind v4, so these literals were silently OUTRANKING those knobs — a
        // service overriding --checkbox-checked-background got no fill change at all. `data-state`
        // above and react-aria's own `data-disabled` keep those CSS rules matching. Rendering is
        // unchanged: both knobs default to exactly the values these utilities hard-coded.
        //
        // `inline-flex items-center justify-center` is NEW and load-bearing: the root used to be a
        // `<button>` (inline-block, so `.ui-checkbox`'s width/height applied and the glyph centred
        // itself). react-aria's root is a `<label>`, which is `display:inline` — without this the
        // 16px box collapses to nothing. CheckboxVisual already carries the same three for the
        // same reason.
        "peer ui-checkbox data-[invalid]:border-destructive data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground inline-flex shrink-0 items-center justify-center shadow-xs transition-shadow",
        className,
      )}
      // gh#476: react-aria hides the real input in a 1px clipped span at the label's top-left,
      // so the box a user aims at belongs to the LABEL and the input cannot be clicked — by a
      // pointer or by an automated click. `withOwnHitTarget` swaps that wrapper for one the
      // stylesheet sizes to the painted box; nothing about the input itself changes.
      render={(domProps) => <label {...domProps}>{withOwnHitTarget(domProps.children)}</label>}
      onChange={(next) => {
        setUncontrolled(next);
        onCheckedChange?.(next);
      }}
    >
      {/* Radix's `<Indicator>` rendered NOTHING at all while unchecked. The gate moved inward by
          one level: the `[data-slot="checkbox-indicator"]` span is now always present and only the
          glyph is conditional. react-aria warns on a Checkbox with neither children nor an
          `aria-label` (it cannot see the external `<label for>` this library names the box with),
          and an always-present child silences that for every unlabelled-in-JSX call site. The span
          is empty and `.ui-choice-indicator` is a bare flex box, so nothing is painted. */}
      <span data-slot="checkbox-indicator" className="ui-choice-indicator">
        {state ? <CheckboxGlyph state={state} /> : null}
      </span>
    </AriaCheckbox>
  );
});
CheckboxRoot.displayName = "Checkbox";

/** Checkbox — dùng standalone hoặc `Checkbox.Group` với `options` (theo quy ước phổ biến). */
export const Checkbox = Object.assign(CheckboxRoot, {
  Group: CheckboxGroup,
});
