import {
  forwardRef,
  type ComponentProps,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  FormProvider,
  useController,
  useFormContext,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { cn } from "../cn";
import {
  Field,
  FieldHelp,
  FieldLabel,
  type FieldHelpTone,
} from "./Field";

/**
 * Form — thin wrapper over `react-hook-form` + the canonical
 * `<Field>` label/help composition. Mirrors the shadcn/ui Form
 * pattern: a `FormProvider` plus a `FormField` render-prop that
 * binds a single controller to a `<Field>` group.
 *
 * Vocabulary per cardinal rule 23 §B: stays inside the `value` /
 * `onChange` / `onBlur` Radix-style surface. No Ant `rules` /
 * `validateStatus` / `wrapperCol` props — validation comes from
 * `react-hook-form` (with Zod or any other `@hookform/resolvers`
 * adapter) and the field renders a `<FieldHelp tone="error">` line.
 */

// ─── Form root ────────────────────────────────────────────────────

export interface FormProps<T extends FieldValues = FieldValues>
  extends Omit<ComponentProps<"form">, "onSubmit"> {
  form: UseFormReturn<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export function Form<T extends FieldValues>({
  form,
  onSubmit,
  className,
  children,
  ...rest
}: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form
        className={cn("form", className)}
        onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}
        noValidate
        {...rest}
      >
        {children}
      </form>
    </FormProvider>
  );
}

// ─── FormItem — generic wrapper ───────────────────────────────────

export interface FormItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(
  function FormItem({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn("field", className)} {...rest}>
        {children}
      </div>
    );
  },
);

// ─── FormField — render-prop controller binding ───────────────────

export interface FormFieldRenderArg<TValue = unknown> {
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur: () => void;
  name: string;
  ref: ControllerRenderProps["ref"];
  error?: string;
  invalid: boolean;
}

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  /** Visual help-line tone override; defaults to "error" when the field is invalid. */
  helpTone?: FieldHelpTone;
  children: (field: FormFieldRenderArg<TFieldValues[TName]>) => ReactNode;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  required,
  helpTone,
  children,
}: FormFieldProps<TFieldValues, TName>) {
  const { field, fieldState } = useController<TFieldValues, TName>({ name });
  const error = extractErrorMessage(fieldState);
  const invalid = fieldState.invalid;
  const tone: FieldHelpTone | undefined = error
    ? "error"
    : helpTone ?? (description ? "default" : undefined);

  return (
    <Field>
      {label !== undefined && (
        <FieldLabel htmlFor={field.name} required={required}>
          {label}
        </FieldLabel>
      )}
      {children({
        value: field.value as TFieldValues[TName],
        onChange: (next) => field.onChange(next),
        onBlur: field.onBlur,
        name: field.name,
        ref: field.ref,
        error,
        invalid,
      })}
      {(error || description) && (
        <FieldHelp tone={tone}>{error ?? description}</FieldHelp>
      )}
    </Field>
  );
}

function extractErrorMessage(state: ControllerFieldState): string | undefined {
  const err = state.error;
  if (!err) return undefined;
  if (typeof err.message === "string" && err.message) return err.message;
  // Aggregate validators (e.g. zod array-of-issues) — show the first.
  if (Array.isArray((err as { types?: Record<string, string> }).types)) {
    const types = (err as unknown as { types: Record<string, string> }).types;
    const firstKey = Object.keys(types)[0];
    if (firstKey) return types[firstKey];
  }
  return err.type ? `Invalid (${err.type})` : "Invalid value";
}

export { useFormContext };
