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
  const helperId = helper && !error ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = errorId ?? helperId;

  const childWithA11y = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        "aria-describedby": describedBy,
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
      {error ? (
        <p id={errorId} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="text-muted-foreground text-xs">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
