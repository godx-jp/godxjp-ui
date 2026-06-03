import * as React from "react";

import { cn } from "../../lib/utils";
import { Label } from "./label";
import type { FieldProp } from "../../props/components/data-entry.prop";

export type { FieldProp, FieldProp as FieldProps } from "../../props/components/data-entry.prop";

/** Label + optional description beside a checkbox/radio/switch control. */
export function Field({ id, label, description, className, children }: FieldProp) {
  return (
    <div className={cn("ui-choice-field", className)}>
      <div className="ui-choice-control">{children}</div>
      <div className="ui-choice-content">
        <Label htmlFor={id} className="ui-choice-label">
          {label}
        </Label>
        {description ? <p className="ui-choice-description">{description}</p> : null}
      </div>
    </div>
  );
}
