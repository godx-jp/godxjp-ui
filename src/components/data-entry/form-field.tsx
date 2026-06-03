import * as React from "react";

import { Label } from "../data-entry/label";
import { cn } from "../../lib/utils";
import type { FormFieldProp } from "../../props/components/data-entry.prop";

export type {
  FormFieldProp,
  FormFieldProp as FormFieldProps,
} from "../../props/components/data-entry.prop";

export function FormField({
  id,
  label,
  required,
  helper,
  error,
  labelAddon,
  className,
  children,
}: FormFieldProp) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

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

  const childWithA11y = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        // Helper and error can coexist: helper stays on aria-describedby, the error on
        // aria-errormessage (surfaced when aria-invalid is true).
        "aria-describedby": helperId,
        "aria-errormessage": errorId,
        "aria-required": required ? true : undefined,
        "aria-invalid": !!error || undefined,
      })
    : children;

  return (
    <div className={cn("ui-stack-sm", className)}>
      <div className="flex items-center gap-1">
        <Label htmlFor={id} className="ui-inline-xs">
          <span>{label}</span>
          {required && (
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          )}
        </Label>
        {labelAddon}
      </div>
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
  );
}
