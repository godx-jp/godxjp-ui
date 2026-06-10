import * as React from "react";

import { Label } from "../data-entry/label";
import { cn } from "../../lib/utils";
import { useFormLayout } from "./form";
import type { FormFieldProp } from "../../props/components/data-entry.prop";
import type { WidthProp } from "../../props/vocabulary";

export type {
  FormFieldProp,
  FormFieldProp as FormFieldProps,
} from "../../props/components/data-entry.prop";

const toCssLength = (v: WidthProp): string => (typeof v === "number" ? `${v}px` : v);

/** Label-click focus target — a real control, never a wrapper div. */
const FOCUSABLE_SELECTOR =
  'input:not([type="hidden"]), select, textarea, button, [tabindex]:not([tabindex="-1"])';

export function FormField({
  id,
  label,
  required,
  helper,
  error,
  labelAddon,
  layout: layoutProp,
  labelWidth: labelWidthProp,
  controlWidth: controlWidthProp,
  colSpan,
  className,
  children,
}: FormFieldProp) {
  // Form context provides defaults; per-field props override (Form → FormField priority).
  const form = useFormLayout();
  const layout = layoutProp ?? form?.layout ?? "vertical";
  const labelWidth = labelWidthProp ?? form?.labelWidth;
  const controlWidth = controlWidthProp ?? form?.controlWidth;
  const labelAlign = form?.labelAlign ?? "end";
  const collapseBelow = form?.collapseBelow ?? "md";

  // `id` is optional: when omitted the field auto-generates one and injects it
  // into the child, so every control under FormField always carries an id
  // (Chrome's "form field element should have an id or name" stays silent).
  const autoId = React.useId();
  const resolvedId = id ?? autoId;
  const labelId = `${resolvedId}-label`;
  const helperId = helper ? `${resolvedId}-helper` : undefined;
  const errorId = error ? `${resolvedId}-error` : undefined;

  if (
    typeof process !== "undefined" &&
    process.env?.NODE_ENV !== "production" &&
    !React.isValidElement(children)
  ) {
    // FormField wires aria-* onto a single control; multiple/no/text children can't receive them.
    console.warn(
      "FormField expects a single React element child to receive aria-describedby/aria-errormessage; " +
        "the helper text and error message will not be associated with the control.",
    );
  }

  const childProps = React.isValidElement(children)
    ? (children.props as Record<string, unknown>)
    : undefined;
  const childWithA11y = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        // The label is associated via aria-labelledby (not <label for>): composite
        // controls (Radio.Group, checkbox lists, range pairs) have no labelable root,
        // and a dangling `for` triggers Chrome's "Incorrect use of <label>" issue.
        id: (childProps?.id as string | undefined) ?? resolvedId,
        "aria-labelledby": (childProps?.["aria-labelledby"] as string | undefined) ?? labelId,
        // Helper and error can coexist: helper stays on aria-describedby, the error on
        // aria-errormessage (surfaced when aria-invalid is true).
        "aria-describedby": helperId,
        "aria-errormessage": errorId,
        "aria-required": required ? true : undefined,
        "aria-invalid": !!error || undefined,
      })
    : children;

  const style: React.CSSProperties = {};
  if (labelWidth != null)
    (style as Record<string, string>)["--form-label-width"] = toCssLength(labelWidth);
  if (controlWidth != null)
    (style as Record<string, string>)["--form-control-width"] = toCssLength(controlWidth);
  if (colSpan != null) style.gridColumn = `span ${colSpan}`;

  return (
    <div
      data-slot="form-field"
      data-layout={layout}
      data-collapse-below={String(collapseBelow)}
      data-label-align={labelAlign}
      style={Object.keys(style).length ? style : undefined}
      className={cn("ui-form-field", className)}
    >
      <div data-slot="form-field-label" className="ui-form-field-label">
        {/* asChild renders a <span>: the control is named via aria-labelledby, and a
            real <label> whose `for` can dangle (composite children) is a Chrome a11y
            issue. Click-to-focus is preserved by hand. */}
        <Label asChild id={labelId} className="ui-inline-xs">
          <span
            onClick={() => {
              const el = document.getElementById(resolvedId);
              if (!(el instanceof HTMLElement)) return;
              // Composite children put the field id on a plain wrapper —
              // focus the first real control inside it instead.
              const focusable = el.matches(FOCUSABLE_SELECTOR)
                ? el
                : el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
              (focusable ?? el).focus();
            }}
          >
            <span>{label}</span>
            {required && (
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            )}
          </span>
        </Label>
        {labelAddon}
      </div>
      <div data-slot="form-field-control" className="ui-form-field-control">
        {childWithA11y}
        {helper ? (
          <p id={helperId} className="text-muted-foreground text-xs">
            {helper}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-destructive text-xs">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
