import * as React from "react";

import { cn } from "../../lib/utils";
import { mergeAriaIds } from "../../lib/field-a11y";
import { Label } from "./label";
import type { FieldProp } from "../../props/components/data-entry.prop";

export type { FieldProp, FieldProp as FieldProps } from "../../props/components/data-entry.prop";

/** Label + optional description beside a checkbox/radio/switch control. */
export function Field({
  id,
  label,
  labelAddon,
  description,
  error,
  className,
  children,
}: FieldProp) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const childProps = React.isValidElement(children)
    ? (children.props as Record<string, unknown>)
    : undefined;

  /*
   * The error id rides `aria-describedby` AS WELL AS `aria-errormessage`, and that is not
   * belt-and-braces for its own sake: the controls this row exists for are react-aria's
   * Checkbox / Radio / Switch, whose focus target is a hidden `<input>` react-aria builds
   * itself, forwarding only the aria props its own model knows about — `aria-errormessage` is
   * not one of them, so on a Switch the message would be attached to nothing. The same merge is
   * already the rule elsewhere in this library (Checkbox does it for itself, gh#709;
   * `pickGroupFieldA11y` does it for groups). `mergeAriaIds` deduplicates, so a control that
   * repeats the merge still announces the message once.
   *
   * The child's own value is read FIRST in every case: `cloneElement` overwrites every key in
   * the config bag, `undefined` included, so a bare assignment would erase an `aria-invalid` or
   * an `aria-describedby` the control set for itself.
   */
  const control = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        "aria-describedby": mergeAriaIds(
          childProps?.["aria-describedby"] as string | undefined,
          descriptionId,
          errorId,
        ),
        "aria-errormessage": mergeAriaIds(
          childProps?.["aria-errormessage"] as string | undefined,
          errorId,
        ),
        "aria-invalid": error
          ? true
          : (childProps?.["aria-invalid"] as React.AriaAttributes["aria-invalid"]),
      })
    : children;

  const labelNode = (
    <Label htmlFor={id} className="ui-choice-label">
      {label}
    </Label>
  );

  return (
    <div className={cn("ui-choice-field", className)}>
      <div className="ui-choice-control">{control}</div>
      <div className="ui-choice-content">
        {/* The addon is a SIBLING of the label, never a child of it (gh#812). `.ui-choice-label`
            is a real `<label htmlFor>`, and a browser forwards a click anywhere inside a label to
            the labelled control — so a Tooltip trigger or help button placed in `label` flips the
            switch the moment it is pressed. Outside the `<label>` element it is simply a button. */}
        {labelAddon != null ? (
          <div className="ui-choice-label-row">
            {labelNode}
            {labelAddon}
          </div>
        ) : (
          labelNode
        )}
        {description ? (
          <p id={descriptionId} className="ui-choice-description">
            {description}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="ui-choice-error">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
