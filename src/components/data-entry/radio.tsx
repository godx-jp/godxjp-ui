import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "../../lib/utils";
import { pickFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
import { Field } from "./field";
import { choiceGroupClassName, type ChoiceOption } from "./choice-option";
import type { RadioGroupProp } from "../../props/components/data-entry.prop";

export type {
  RadioGroupProp,
  RadioGroupProp as RadioGroupProps,
} from "../../props/components/data-entry.prop";

const RadioGroupRoot = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    data-slot="radio-group"
    className={cn("ui-choice-group", className)}
    {...props}
  />
));
RadioGroupRoot.displayName = RadioGroupPrimitive.Root.displayName;

const RadioItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    data-slot="radio-group-item"
    className={cn(
      // `disabled:cursor-not-allowed disabled:opacity-50` DELETED, not moved (#319):
      // `.ui-radio:disabled, .ui-radio[data-disabled]` in styles/control.css already declares both
      // and reads --disabled-opacity. The utility was layered after components, so it silently
      // outranked that token — a service theme's --disabled-opacity never reached a radio.
      // Byte-identical: --disabled-opacity defaults to 0.5.
      "ui-radio aria-invalid:border-destructive aria-invalid:ring-destructive/20 shrink-0 shadow-xs transition-shadow outline-none",
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator
      data-slot="radio-group-indicator"
      className="ui-choice-indicator"
    >
      <Circle className="ui-radio-icon" aria-hidden="true" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioItem.displayName = RadioGroupPrimitive.Item.displayName;

function RadioGroupOptions({
  value,
  defaultValue,
  onValueChange,
  options,
  orientation = "vertical",
  disabled,
  name,
  id,
  className,
  children,
  ...ariaProps
}: RadioGroupProp) {
  const reactId = React.useId();
  // role="radiogroup" IS a widget → it supports the full validation contract (aria-invalid /
  // -errormessage / -required), so forward every field-a11y relationship FormField injects.
  // `data-field` rides along on the same route (gh#337).
  const groupA11y = pickFieldA11y(ariaProps);
  // gh#337 — the machine key for a group NESTED under a layout wrapper. `name` goes on the Radix
  // root, which is what feeds each option's hidden native radio input.
  const identity = useFieldIdentity({ id, name, "data-field": groupA11y["data-field"] });
  const resolvedName = name ?? identity.name;
  const resolvedField = groupA11y["data-field"] ?? identity["data-field"];
  // Per-option DOM id (gh#337). A radio is the one control whose focusable element is NOT the one
  // that carries the field's id — the group holds that — so each button needs an id of its own,
  // and `React.useId()` produces `«r3»-52-0`: unique, but regenerated on every mount and different
  // in every build, so nothing outside React can address it. Derive it from the group's OWN id
  // whenever there is one; `useId` stays the fallback for a group that has none.
  const optionDomId = (optionValue: string, index: number) =>
    id ? `${id}-${optionValue}` : `${reactId}-${optionValue}-${index}`;

  if (options && options.length > 0) {
    return (
      <RadioGroupRoot
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={resolvedName}
        id={id}
        {...groupA11y}
        data-field={resolvedField}
        data-orientation={orientation}
        className={choiceGroupClassName(orientation, className)}
      >
        {options.map((opt: ChoiceOption, index) => {
          const optionId = optionDomId(opt.value, index);
          return (
            <Field key={opt.value} id={optionId} label={opt.label} description={opt.description}>
              <RadioItem
                id={optionId}
                value={opt.value}
                disabled={opt.disabled}
                data-field={resolvedField}
              />
            </Field>
          );
        })}
      </RadioGroupRoot>
    );
  }

  return (
    <RadioGroupRoot
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      name={resolvedName}
      id={id}
      {...groupA11y}
      data-field={resolvedField}
      data-orientation={orientation}
      className={choiceGroupClassName(orientation, className)}
    >
      {children}
    </RadioGroupRoot>
  );
}

/** Single radio — use inside `Radio.Group` / `RadioGroupRoot`, or via `options` API. */
export const Radio = Object.assign(RadioItem, {
  Root: RadioGroupRoot,
  Group: RadioGroupOptions,
  Item: RadioItem,
});

export { RadioGroupRoot, RadioItem, RadioGroupOptions as RadioGroup };
