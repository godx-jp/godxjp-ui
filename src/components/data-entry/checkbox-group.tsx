import * as React from "react";

import { cn } from "../../lib/utils";
import { pickGroupFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
import { Checkbox } from "./checkbox";
import { Field } from "./field";
import { choiceGroupClassName, type ChoiceOption } from "./choice-option";
import type { CheckboxGroupProp } from "../../props/components/data-entry.prop";

export type {
  CheckboxGroupProp,
  CheckboxGroupProp as CheckboxGroupProps,
} from "../../props/components/data-entry.prop";

function useControllableArray(
  controlled: string[] | undefined,
  defaultValue: string[],
): [string[], (next: string[]) => void] {
  const [internal, setInternal] = React.useState(defaultValue);
  const value = controlled ?? internal;
  const setValue = React.useCallback(
    (next: string[]) => {
      if (controlled === undefined) setInternal(next);
    },
    [controlled],
  );
  return [value, setValue];
}

export function CheckboxGroup({
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  options,
  orientation = "vertical",
  disabled,
  name,
  id,
  className,
  children,
  ...ariaProps
}: CheckboxGroupProp) {
  const reactId = React.useId();
  const [value, setValue] = useControllableArray(controlledValue, defaultValue);
  // FormField wires the visible label/helper/error onto this group via aria-labelledby /
  // aria-describedby / aria-errormessage. role="group" (a structure role, not a widget) only
  // supports the two id-reference relationships per ARIA 1.2 — pickGroupFieldA11y folds the error
  // id into aria-describedby so the message is still announced without an invalid-ARIA violation.
  const groupA11y = pickGroupFieldA11y(ariaProps);
  // `name` is handed to each
  // Checkbox, whose Radix hidden input is what a native submit reads.
  const identity = useFieldIdentity({ id, name, "data-field": groupA11y["data-field"] });
  const resolvedName = name ?? identity.name;
  const resolvedField = groupA11y["data-field"] ?? identity["data-field"];
  // so each box needs its own, and a `React.useId()` value is regenerated on every mount and so
  // cannot be addressed from outside React. Derive it from the group's own id when there is one.
  const optionDomId = (optionValue: string, index: number) =>
    id ? `${id}-${optionValue}` : `${reactId}-${optionValue}-${index}`;

  const toggle = (optionValue: string) => {
    const next = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    setValue(next);
    onValueChange?.(next);
  };

  if (options && options.length > 0) {
    return (
      <div
        role="group"
        id={id}
        {...groupA11y}
        data-field={resolvedField}
        aria-disabled={disabled ? true : undefined}
        data-orientation={orientation}
        className={choiceGroupClassName(orientation, className)}
      >
        {options.map((opt: ChoiceOption, index) => {
          const optionId = optionDomId(opt.value, index);
          const checked = value.includes(opt.value);
          return (
            <Field key={opt.value} id={optionId} label={opt.label} description={opt.description}>
              <Checkbox
                id={optionId}
                name={resolvedName}
                data-field={resolvedField}
                value={opt.value}
                checked={checked}
                disabled={Boolean(disabled) || Boolean(opt.disabled)}
                onCheckedChange={() => {
                  toggle(opt.value);
                }}
              />
            </Field>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      id={id}
      {...groupA11y}
      data-field={resolvedField}
      aria-disabled={disabled ? true : undefined}
      data-orientation={orientation}
      className={cn(choiceGroupClassName(orientation), className)}
    >
      {children}
    </div>
  );
}
