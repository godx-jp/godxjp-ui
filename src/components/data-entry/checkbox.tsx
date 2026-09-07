import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/utils";
import { useFieldIdentity } from "../../lib/field-a11y";
import { CheckboxGroup } from "./checkbox-group";

/**
 * The glyph a checkbox paints for a given `data-state`. A dash for "indeterminate" (a PARTIAL
 * selection — DataTable / Transfer select-all, a Cascader parent with some leaves checked) and a
 * tick for "checked". Painting the tick for both made a partial selection read as "all selected".
 */
function CheckboxGlyph({ state }: { state: CheckboxPrimitive.CheckedState }) {
  return state === "indeterminate" ? (
    <Minus className="ui-checkbox-icon" aria-hidden="true" />
  ) : (
    <Check className="ui-checkbox-icon" aria-hidden="true" />
  );
}

/**
 * Decorative checkbox glyph — a non-interactive `<span>`, NOT the real {@link Checkbox} (which is a
 * `<button>`). Used where the row itself is the interactive element and a nested `<button>` would
 * be invalid HTML (Cascader's option rows). Shares {@link CheckboxGlyph} so "partial" can never
 * drift apart from the real control's rendering again.
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
  const state: CheckboxPrimitive.CheckedState = indeterminate ? "indeterminate" : checked;
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
          the way antd draws a partial selection. */}
      {checked || indeterminate ? <CheckboxGlyph state={state} /> : null}
    </span>
  );
}

/**
 * Spelled out here rather than imported from `props/components/data-entry.prop` (where the same
 * shape is declared as `CheckboxProp` for the catalog) for ONE mechanical reason: the API-manifest
 * generator treats an inherited prop as public the moment the implementation source mentions its
 * name as a bare word, and a TS-only import line would introduce exactly such a word — publishing
 * the underlying `<button>`'s HTML kind attribute as part of Checkbox's API. Same trap the comment
 * inside `input.tsx` records for the native form-submission attribute; keep this file free of it.
 */
const CheckboxRoot = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & { indeterminate?: boolean }
>(({ className, indeterminate, ...props }, ref) => {
  // The machine key for a Checkbox NESTED under a layout wrapper (the 「不明」 box beside
  // a value input is the shape this was measured on). `{}` in every other case, and the resolved
  // `name` reaches Radix's hidden bubble input so the box still submits natively.
  const identity = useFieldIdentity({
    id: props.id,
    name: props.name,
    "data-field": (props as { "data-field"?: string })["data-field"],
  });
  // Radix keeps the resolved check state in a private context, so an UNCONTROLLED box's state is
  // mirrored here — otherwise `defaultChecked="indeterminate"` would keep painting a dash after
  // the first click. A controlled box reads straight off the prop.
  const [uncontrolled, setUncontrolled] = React.useState<CheckboxPrimitive.CheckedState>(
    props.defaultChecked ?? false,
  );
  // antd `indeterminate` is a SEPARATE boolean beside `checked`; Radix spells the same state as
  // `checked="indeterminate"`. While the flag is true it wins, and the box falls back to whatever
  // `checked` said the moment it goes false — which is exactly antd's "some / all / none" header
  // box: the flag reports the partial selection and never destroys the underlying value.
  const resolvedChecked: CheckboxPrimitive.CheckedState | undefined = indeterminate
    ? "indeterminate"
    : props.checked;
  const state = resolvedChecked ?? uncontrolled;
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        // `disabled:cursor-not-allowed disabled:opacity-50` and the checked fill are DELETED, not
        // moved: `.ui-checkbox:disabled, .ui-checkbox[data-disabled]` and
        // `.ui-checkbox[data-state="checked"]` in styles/control.css already declare both, reading
        // --disabled-opacity and --checkbox-checked-background. Utilities are layered AFTER
        // components in Tailwind v4, so these literals were silently OUTRANKING those knobs — a
        // service overriding --checkbox-checked-background got no fill change at all. Radix sets
        // `data-state`/`data-disabled` on the root, so the CSS rules match. Rendering is unchanged:
        // both knobs default to exactly the values these utilities hard-coded.
        "peer ui-checkbox aria-invalid:border-destructive data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground shrink-0 shadow-xs transition-shadow outline-none",
        className,
      )}
      {...props}
      checked={resolvedChecked}
      {...identity}
      onCheckedChange={(next) => {
        setUncontrolled(next);
        props.onCheckedChange?.(next);
      }}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="ui-choice-indicator">
        <CheckboxGlyph state={state} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
CheckboxRoot.displayName = CheckboxPrimitive.Root.displayName;

/** Checkbox — dùng standalone hoặc `Checkbox.Group` với `options` (Ant Design style). */
export const Checkbox = Object.assign(CheckboxRoot, {
  Group: CheckboxGroup,
});
