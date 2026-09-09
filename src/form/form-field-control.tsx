import * as React from "react";
import type { Ref } from "react";
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { FormField } from "../components/data-entry/form-field";
import { extractControlValue, useFormAdapter, useFormDisabled } from "./form-context";
import type { FormFieldControlProp } from "../props/components/form.prop";

export type { FormFieldControlProp } from "../props/components/form.prop";

const noopRef: Ref<HTMLInputElement> = () => {};

function bindField<T extends { onChange: (...args: unknown[]) => void }>(
  field: T,
): T & { onValueChange: T["onChange"] } {
  return { ...field, onValueChange: field.onChange };
}

/**
 * antd `dependencies` — re-validate `name` whenever one of `dependencies` changes. Rendered as a
 * component (never on the adapter path, only when dependencies are declared) so a form that does
 * not use the feature pays neither the watch nor the formState subscription.
 *
 * Gated on `isSubmitted`, matching antd: before the first submit the user has not reached the
 * dependent field yet, and validating it would flag an error for something they never touched.
 */
function FieldDependencies<TFieldValues extends FieldValues>({
  control,
  name,
  dependencies,
  trigger,
}: {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  dependencies: FieldPath<TFieldValues>[];
  trigger: (name: FieldPath<TFieldValues>) => Promise<boolean>;
}) {
  const values = useWatch({ control, name: dependencies });
  const { isSubmitted } = useFormState({ control });
  // The watched array is a new reference every render; compare by content so `trigger` (which
  // re-renders) cannot drive the effect in a loop.
  const signature = JSON.stringify(values ?? null);
  React.useEffect(() => {
    if (!isSubmitted) return;
    void trigger(name);
    // `signature` IS the dependency values; `values` itself would fire on every render.
  }, [signature, isSubmitted, name, trigger]);
  return null;
}

export function FormFieldControl<TFieldValues extends FieldValues>({
  name,
  id,
  field: fieldKey,
  labelAddon,
  layout,
  labelWidth,
  controlWidth,
  colSpan,
  label,
  required,
  helper,
  disabled,
  dependencies,
  getValueFromEvent,
  normalize,
  help,
  validateStatus,
  hasFeedback,
  feedback,
  preserve,
  className,
  children,
}: FormFieldControlProp<TFieldValues>) {
  const autoId = React.useId();
  const resolvedId = id ?? `${autoId}-${String(name)}`;
  const presentation = { field: fieldKey, labelAddon, layout, labelWidth, controlWidth, colSpan };
  const adapter = useFormAdapter();
  // Always call the RHF hook (returns null outside a provider) so hook order is stable across paths.
  const rhf = useFormContext<TFieldValues>();
  const formDisabled = useFormDisabled();
  const isDisabled = disabled ?? formDisabled;
  // Emitted ONLY when disabled: a bare `disabled: false` in the render-prop bag would re-enable a
  // control that a caller disabled itself when the bag is spread last (`<Input {...field} />`).
  const disabledProp = isDisabled
    ? { disabled: true as const }
    : disabled === false
      ? { disabled: false as const }
      : undefined;

  /** antd `getValueFromEvent` + `normalize`, applied in that order. */
  const readValue = (args: unknown[], previousValue: unknown): unknown => {
    const raw = getValueFromEvent ? getValueFromEvent(...args) : extractControlValue(args[0]);
    return normalize ? normalize(raw, previousValue) : raw;
  };

  // Adapter path (server-driven): bind value/onChange/error straight from the adapter by `name`.
  // FormField wires aria-invalid/aria-errormessage from the `error` slot, so no manual aria wiring.
  if (adapter) {
    const fieldName = String(name);
    return (
      <FormField
        {...presentation}
        id={resolvedId}
        name={fieldName}
        label={label}
        required={required}
        helper={helper}
        error={help ?? adapter.getError(fieldName)}
        validateStatus={validateStatus}
        hasFeedback={hasFeedback}
        feedback={feedback}
        className={className}
      >
        {children(
          bindField({
            id: resolvedId,
            name: fieldName,
            value: adapter.getValue(fieldName),
            onChange: (...args: unknown[]) =>
              adapter.setValue(fieldName, readValue(args, adapter.getValue(fieldName))),
            onBlur: () => adapter.onBlur?.(fieldName),
            ref: noopRef,
            ...disabledProp,
          }),
        )}
      </FormField>
    );
  }

  // Built-in react-hook-form path.
  return (
    <>
      {dependencies?.length ? (
        <FieldDependencies
          control={rhf.control}
          name={name}
          dependencies={dependencies}
          trigger={rhf.trigger}
        />
      ) : null}
      <Controller
        name={name}
        control={rhf.control}
        shouldUnregister={preserve === false}
        render={({ field, fieldState }) => (
          <FormField
            {...presentation}
            id={resolvedId}
            name={String(name)}
            label={label}
            required={required}
            helper={helper}
            error={help ?? fieldState.error?.message}
            validateStatus={validateStatus}
            hasFeedback={hasFeedback}
            feedback={feedback}
            className={className}
          >
            {children(
              bindField({
                id: resolvedId,
                name: field.name,
                value: field.value,
                onChange: (...args: unknown[]) => field.onChange(readValue(args, field.value)),
                onBlur: field.onBlur,
                ref: field.ref as Ref<HTMLInputElement>,
                ...disabledProp,
              }),
            )}
          </FormField>
        )}
      />
    </>
  );
}
