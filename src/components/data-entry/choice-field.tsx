import * as React from "react";

import { cn } from "../../lib/utils";
import { Label } from "./label";

interface ChoiceFieldProps {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Label + optional description beside a checkbox/radio control. */
export function ChoiceField({ id, label, description, className, children }: ChoiceFieldProps) {
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
