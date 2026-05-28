import { useId, useState } from "react";

import { cn } from "../../lib/utils";
import type { SwitchFieldProp } from "../../props/components/data-entry.prop";
import { Label } from "./label";
import { Switch } from "./switch";

export type {
  SwitchFieldProp,
  SwitchFieldProp as SwitchFieldProps,
} from "../../props/components/data-entry.prop";

/**
 * Labelled boolean switch for native HTML forms.
 *
 * Layout follows the shadcn `field-switch` standard: label (+ helper) on the
 * left, the switch on the right (horizontal). Composes `Label` + `Switch` and
 * mirrors a hidden `0`/`1` input so it submits inside an HTML `<form>`.
 */
export function SwitchField({
  id,
  name,
  label,
  required,
  helper,
  error,
  labelAddon,
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  size,
}: SwitchFieldProp) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const helperId = helper && !error ? `${fieldId}-helper` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const handleChange = (next: boolean) => {
    if (!isControlled) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
  };

  return (
    <div className={cn("ui-stack-sm", className)} data-invalid={error ? true : undefined}>
      <input type="hidden" name={name} value={isChecked ? "1" : "0"} readOnly />
      <div className="flex items-center gap-2">
        <Switch
          id={fieldId}
          checked={isChecked}
          onCheckedChange={handleChange}
          disabled={disabled}
          size={size}
          aria-describedby={errorId ?? helperId}
          aria-required={required ? true : undefined}
          aria-invalid={!!error || undefined}
        />
        <div className="ui-stack-xs min-w-0">
          <div className="flex items-center gap-1">
            <Label htmlFor={fieldId} className="ui-inline-xs">
              <span>{label}</span>
              {required && (
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              )}
            </Label>
            {labelAddon}
          </div>
          {helper && !error ? (
            <p id={helperId} className="text-muted-foreground text-xs">
              {helper}
            </p>
          ) : null}
        </div>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
