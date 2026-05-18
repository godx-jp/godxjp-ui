import { Children, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import {
  useController,
  type ControllerFieldState,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Skeleton } from "../feedback/Skeleton";
import { Spinner } from "../feedback/Spinner";
import { AutoComplete } from "./AutoComplete";
import { Cascader } from "./Cascader";
import { Checkbox } from "./Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";
import { ColorPicker } from "./ColorPicker";
import { Field, type FieldHelpTone } from "./Field";
import { useFormLoading } from "./Form";
import { InputNumber } from "./InputNumber";
import { normalizeLoading, type LoadingProp } from "./loading";
import { RadioGroup } from "./Radio";
import { Rate } from "./Rate";
import { Select } from "./Select";
import { Slider } from "./Slider";
import { Switch } from "./Switch";
import { Transfer } from "./Transfer";
import { TreeSelect } from "./TreeSelect";

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
  /** Per-field loading override. `true` → spinner. `{ kind: "skeleton" }` →
   * skeleton placeholder (use during initial data fetch). When omitted,
   * inherits from the surrounding `<Form loading={…}>`. */
  loading?: LoadingProp;
  children: ReactElement;
}

/**
 * Form-wired Field. Reads value/onChange/error from the surrounding
 * `<Form>` via react-hook-form's `useController`, then clones its single
 * child with the right adapter:
 *
 *   - Checkbox / Switch     → checked + onCheckedChange
 *   - InputNumber           → value (number) + onValueChange
 *   - Select / AutoComplete / ColorPicker / RadioGroup / Rate / Slider /
 *     Cascader / Transfer / TreeSelect → value + onValueChange
 *   - default (Input / Textarea / InputSearch / etc.)
 *                           → value + onChange(event)
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
  loading,
  children,
}: FormFieldProps<T, TName>) {
  const { field, fieldState } = useController<T, TName>({ name });
  const formLoading = useFormLoading();
  const { active: isLoading, kind: loadKind, label: loadLabel } =
    normalizeLoading(loading ?? formLoading);

  const error = extractErrorMessage(fieldState);
  const invalid = fieldState.invalid;
  const child = Children.only(children);
  const wired = isValidElement(child)
    ? adaptChild(child as ReactElement, field as ControllerField, invalid)
    : child;
  const resolvedTone: FieldHelpTone | undefined = error
    ? "error"
    : (tone ?? (description !== undefined ? "default" : undefined));

  let body: ReactElement | ReactNode;
  if (isLoading && loadKind === "skeleton") {
    body = <Skeleton className="h-9 w-full rounded-md" aria-label={loadLabel} />;
  } else if (isLoading && loadKind === "spinner") {
    body = (
      <div className="form-field-spin">
        <span className="form-field-spin__control">{wired}</span>
        <span className="form-field-spin__overlay" aria-hidden>
          <Spinner size="sm" aria-label={loadLabel ?? "読み込み中"} />
        </span>
      </div>
    );
  } else {
    body = wired;
  }

  return (
    <Field
      label={label}
      required={required}
      optional={optional}
      tone={resolvedTone}
      help={error ?? description}
    >
      {body}
    </Field>
  );
}

type ControllerField = ReturnType<
  typeof useController<FieldValues, string>
>["field"];

const BOOLEAN_TOGGLES = new Set<unknown>([Checkbox, Switch]);
const VALUE_CHANGE_TYPES = new Set<unknown>([
  Select,
  AutoComplete,
  CheckboxGroup,
  ColorPicker,
  RadioGroup,
  Rate,
  Slider,
  Cascader,
  Transfer,
  TreeSelect,
]);

function adaptChild(
  child: ReactElement,
  field: ControllerField,
  invalid: boolean,
): ReactElement {
  if (BOOLEAN_TOGGLES.has(child.type)) {
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
  if (VALUE_CHANGE_TYPES.has(child.type)) {
    return cloneElement(child as ReactElement<Record<string, unknown>>, {
      value: field.value,
      onValueChange: (next: unknown) => field.onChange(next),
      onBlur: field.onBlur,
      status: invalid ? "error" : undefined,
      "aria-invalid": invalid || undefined,
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
