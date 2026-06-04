import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "../../lib/utils";
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
      "ui-radio focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 shrink-0 shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
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
  className,
  children,
}: RadioGroupProp) {
  const reactId = React.useId();

  if (options && options.length > 0) {
    return (
      <RadioGroupRoot
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
        data-orientation={orientation}
        className={choiceGroupClassName(orientation, className)}
      >
        {options.map((opt: ChoiceOption, index) => {
          const id = `${reactId}-${opt.value}-${index}`;
          return (
            <Field key={opt.value} id={id} label={opt.label} description={opt.description}>
              <RadioItem id={id} value={opt.value} disabled={opt.disabled} />
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
      name={name}
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
