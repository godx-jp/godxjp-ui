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
      // `.ui-radio:disabled, .ui-radio[data-disabled]` in styles/control.css already declares both
      // and reads --disabled-opacity. The utility was layered after components, so it silently
      // outranked that token — a service theme's --disabled-opacity never reached a radio.
      // Byte-identical: --disabled-opacity defaults to 0.5.
      "ui-radio aria-invalid:border-destructive shrink-0 shadow-xs transition-shadow outline-none",
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

/**
 * antd `optionType="button"` — one welded bar of radio buttons instead of a column of dots.
 *
 * IT IS PAINT, NOT SEMANTICS. The roles stay `radiogroup` / `radio`, so arrow keys still move the
 * selection, a screen reader still says "1 of 3, selected", and a native submit still works. That
 * is the whole reason this is a prop on RadioGroup rather than a ToggleGroup: a row of
 * `aria-pressed` buttons permits "none chosen", and a radio group does not.
 */
function RadioButtonBar({
  options,
  value,
  optionDomId,
  resolvedField,
}: {
  options: readonly ChoiceOption[];
  value?: string;
  optionDomId: (optionValue: string, index: number) => string;
  resolvedField?: string;
}) {
  return (
    <>
      {options.map((opt, index) => (
        <RadioGroupPrimitive.Item
          key={opt.value}
          id={optionDomId(opt.value, index)}
          value={opt.value}
          disabled={opt.disabled}
          data-slot="radio-button"
          data-field={resolvedField}
          data-state={value === opt.value ? "checked" : "unchecked"}
          className="ui-radio-button ui-focus-ring"
        >
          <span className="ui-radio-button-label">{opt.label}</span>
        </RadioGroupPrimitive.Item>
      ))}
    </>
  );
}

function RadioGroupOptions({
  value,
  defaultValue,
  onValueChange,
  options,
  orientation = "vertical",
  optionType = "default",
  buttonStyle = "outline",
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
  const groupA11y = pickFieldA11y(ariaProps);
  // `name` goes on the Radix
  // root, which is what feeds each option's hidden native radio input.
  const identity = useFieldIdentity({ id, name, "data-field": groupA11y["data-field"] });
  const resolvedName = name ?? identity.name;
  const resolvedField = groupA11y["data-field"] ?? identity["data-field"];
  // A radio is the one control whose focusable element is NOT the one
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
        data-option-type={optionType === "default" ? undefined : optionType}
        data-button-style={optionType === "button" ? buttonStyle : undefined}
        className={cn(
          optionType === "button" ? "ui-radio-button-bar" : choiceGroupClassName(orientation),
          className,
        )}
      >
        {optionType === "button" ? (
          <RadioButtonBar
            options={options}
            value={value}
            optionDomId={optionDomId}
            resolvedField={resolvedField}
          />
        ) : null}
        {optionType === "button"
          ? null
          : options.map((opt: ChoiceOption, index) => {
              const optionId = optionDomId(opt.value, index);
              return (
                <Field
                  key={opt.value}
                  id={optionId}
                  label={opt.label}
                  description={opt.description}
                >
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
