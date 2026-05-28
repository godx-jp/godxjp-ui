import type { Ref } from "react";
import { Controller, useFormContext, type FieldValues } from "react-hook-form";

import { FormField } from "../components/data-entry/form-field";
import type { FormFieldControlProp } from "../props/components/form.prop";

export type { FormFieldControlProp } from "../props/components/form.prop";

export function FormFieldControl<TFieldValues extends FieldValues>({
  name,
  label,
  required,
  helper,
  className,
  children,
}: FormFieldControlProp<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField
          id={String(name)}
          label={label}
          required={required}
          helper={helper}
          error={fieldState.error?.message}
          className={className}
        >
          {children({
            id: String(name),
            name: field.name,
            value: field.value,
            onChange: field.onChange,
            onBlur: field.onBlur,
            ref: field.ref as Ref<HTMLInputElement>,
          })}
        </FormField>
      )}
    />
  );
}
