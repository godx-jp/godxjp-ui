import * as React from "react";

import { cn } from "../../lib/utils";
import { Checkbox } from "./checkbox";
import { ChoiceField } from "./choice-field";
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
  className,
  children,
}: CheckboxGroupProp) {
  const reactId = React.useId();
  const [value, setValue] = useControllableArray(controlledValue, defaultValue);

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
        aria-disabled={disabled ? true : undefined}
        data-orientation={orientation}
        className={choiceGroupClassName(orientation, className)}
      >
        {options.map((opt: ChoiceOption, index) => {
          const id = `${reactId}-${opt.value}-${index}`;
          const checked = value.includes(opt.value);
          return (
            <ChoiceField key={opt.value} id={id} label={opt.label} description={opt.description}>
              <Checkbox
                id={id}
                name={name}
                value={opt.value}
                checked={checked}
                disabled={Boolean(disabled) || Boolean(opt.disabled)}
                onCheckedChange={() => {
                  toggle(opt.value);
                }}
              />
            </ChoiceField>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      data-orientation={orientation}
      className={cn(choiceGroupClassName(orientation), className)}
    >
      {children}
    </div>
  );
}
