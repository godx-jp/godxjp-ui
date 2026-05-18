import { Children, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import {
  useController,
  type ControllerFieldState,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Checkbox } from "./Checkbox";
import { Field, type FieldHelpTone } from "./Field";
import { InputNumber } from "./InputNumber";

export interface FormFieldProps<
  T extends FieldValues = FieldValues,
  TName extends FieldPath<T> = FieldPath<T>,
> {
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  optional?: boolean;
  /** Override the auto-derived help tone (defaults to `"error"` when invalid,
   * `"default"` when `description` is set, otherwise undefined). */
  tone?: FieldHelpTone;
  children: ReactElement;
}

/**
 * Form-wired Field. Reads its value/onChange/error from the surrounding
 * `<Form>` via react-hook-form's `useController`, then clones its single
 * child with the right adapter (text input · InputNumber · Checkbox).
 *
 * Use `<Field>` directly when you want the structural label / help layout
 * outside a Form (e.g. read-only displays, custom local state).
 */
export function FormField<
  T extends FieldValues = FieldValues,
  TName extends FieldPath<T> = FieldPath<T>,
>({
  name,
  label,
  description,
  required,
  optional,
  tone,
  children,
}: FormFieldProps<T, TName>) {
  const { field, fieldState } = useController<T, TName>({ name });
  const error = extractErrorMessage(fieldState);
  const invalid = fieldState.invalid;
  const child = Children.only(children);
  const wired = isValidElement(child)
    ? adaptChild(child as ReactElement, field as ControllerField, invalid)
    : child;
  const resolvedTone: FieldHelpTone | undefined = error
    ? "error"
    : (tone ?? (description !== undefined ? "default" : undefined));
  return (
    <Field
      label={label}
      required={required}
      optional={optional}
      tone={resolvedTone}
      help={error ?? description}
    >
      {wired}
    </Field>
  );
}

type ControllerField = ReturnType<
  typeof useController<FieldValues, string>
>["field"];

function adaptChild(
  child: ReactElement,
  field: ControllerField,
  invalid: boolean,
): ReactElement {
  if (child.type === Checkbox) {
    return cloneElement(child as ReactElement<Record<string, unknown>>, {
      checked: Boolean(field.value),
      onCheckedChange: (next: boolean | "indeterminate") =>
        field.onChange(next === true),
      onBlur: field.onBlur,
      "aria-invalid": invalid || undefined,
    });
  }
  if (child.type === InputNumber) {
    return cloneElement(child as ReactElement<Record<string, unknown>>, {
      value: typeof field.value === "number" ? field.value : undefined,
      onValueChange: (next: number | null) => field.onChange(next),
      onBlur: field.onBlur,
      status: invalid ? "error" : undefined,
    });
  }
  return cloneElement(child as ReactElement<Record<string, unknown>>, {
    value: field.value ?? "",
    onChange: (event: unknown) => {
      if (event && typeof event === "object" && "target" in event) {
        const target = (event as { target: { value: unknown } }).target;
        field.onChange(target.value);
      } else {
        field.onChange(event);
      }
    },
    onBlur: field.onBlur,
    ref: field.ref,
    status: invalid ? "error" : undefined,
    "aria-invalid": invalid || undefined,
  });
}

function extractErrorMessage(state: ControllerFieldState): string | undefined {
  const err = state.error;
  if (!err) return undefined;
  if (typeof err.message === "string" && err.message) return err.message;
  if (err.type) return `Invalid (${err.type})`;
  return "Invalid value";
}
