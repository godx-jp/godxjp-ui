import type { Ref } from "react";
import { Controller, useFormContext, type FieldValues } from "react-hook-form";

import { FormField } from "../components/data-entry/form-field";
import { extractControlValue, useFormAdapter } from "./form-context";
import type { FormFieldControlProp } from "../props/components/form.prop";

export type { FormFieldControlProp } from "../props/components/form.prop";

const noopRef: Ref<HTMLInputElement> = () => {};

export function FormFieldControl<TFieldValues extends FieldValues>({
  name,
  label,
  required,
  helper,
  className,
  children,
}: FormFieldControlProp<TFieldValues>) {
  const adapter = useFormAdapter();
  // Always call the RHF hook (returns null outside a provider) so hook order is stable across paths.
  const rhf = useFormContext<TFieldValues>();

  // Adapter path (server-driven): bind value/onChange/error straight from the adapter by `name`.
  // FormField wires aria-invalid/aria-errormessage from the `error` slot, so no manual aria wiring.
  if (adapter) {
    const fieldName = String(name);
    return (
      <FormField
        id={fieldName}
        label={label}
        required={required}
        helper={helper}
        error={adapter.getError(fieldName)}
        className={className}
      >
        {children({
          id: fieldName,
          name: fieldName,
          value: adapter.getValue(fieldName),
          onChange: (...args: unknown[]) =>
            adapter.setValue(fieldName, extractControlValue(args[0])),
          onBlur: () => adapter.onBlur?.(fieldName),
          ref: noopRef,
        })}
      </FormField>
    );
  }

  // Built-in react-hook-form path (unchanged).
  return (
    <Controller
      name={name}
      control={rhf.control}
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
