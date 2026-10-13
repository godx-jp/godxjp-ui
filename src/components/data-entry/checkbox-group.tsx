import * as React from "react";

import { cn } from "../../lib/utils";
import { pickGroupFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
import { Checkbox } from "./checkbox";
import { Field } from "./field";
import { Separator } from "../layout/separator";
import { useTranslation } from "../../i18n/use-translation";
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
  selectAll,
  ...ariaProps
}: CheckboxGroupProp) {
  const { t } = useTranslation();
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

  // gh#1245 — the select-all box controls the ENABLED options only. A disabled option is left
  // exactly as it is in both directions (antd / DataTable's locked-row rule): never counted, never
  // added, never removed — so a checked disabled option survives "clear all".
  const enabledValues = (options ?? []).filter((opt) => !opt.disabled).map((opt) => opt.value);
  const selectedEnabled = enabledValues.filter((v) => value.includes(v)).length;
  const allState: boolean | "indeterminate" =
    enabledValues.length > 0 && selectedEnabled === enabledValues.length
      ? true
      : selectedEnabled > 0
        ? "indeterminate"
        : false;
  const toggleAll = () => {
    // Computed here rather than from onCheckedChange's argument: from "mixed" the box must SELECT.
    const next =
      allState === true
        ? value.filter((v) => !enabledValues.includes(v))
        : [...value, ...enabledValues.filter((v) => !value.includes(v))];
    setValue(next);
    onValueChange?.(next);
  };
  const selectAllId = id ? `${id}-select-all` : `${reactId}-select-all`;
  const selectAllLabel =
    typeof selectAll === "object" && selectAll.label != null
      ? selectAll.label
      : t("dataEntry.checkboxGroup.selectAll");

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
        {selectAll ? (
          <>
            {/* No `name`/`value`: the box is a control over the group, not a form value, so a
                native submit never carries it. The count is its description — muted, and wired to
                the box through aria-describedby by Field. */}
            <Field
              id={selectAllId}
              label={selectAllLabel}
              description={t("common.selectedOfTotal", {
                count: selectedEnabled,
                total: enabledValues.length,
              })}
            >
              <Checkbox
                id={selectAllId}
                checked={allState}
                disabled={Boolean(disabled) || enabledValues.length === 0}
                onCheckedChange={toggleAll}
              />
            </Field>
            <Separator />
          </>
        ) : null}
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
