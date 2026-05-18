import { type ComponentProps, type ReactNode } from "react";
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
import { Field, type FieldHelpTone } from "./Field";

export interface FormRenderArg<TValue = unknown> {
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur: () => void;
  name: string;
  ref: ControllerRenderProps["ref"];
  error?: string;
  invalid: boolean;
}

export interface FormFieldConfig<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  helpTone?: FieldHelpTone;
  render: (field: FormRenderArg<TFieldValues[TName]>) => ReactNode;
}

export interface FormProps<T extends FieldValues = FieldValues>
  extends Omit<ComponentProps<"form">, "onSubmit"> {
  form: UseFormReturn<T>;
  fields?: Array<FormFieldConfig<T>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export function Form<T extends FieldValues>({
  form,
  fields,
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
        {fields?.map((field) => (
          <ControlledSlot key={field.name} field={field} />
        ))}
        {children}
      </form>
    </FormProvider>
  );
}

function ControlledSlot<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ field: config }: { field: FormFieldConfig<TFieldValues, TName> }) {
  const { field, fieldState } = useController<TFieldValues, TName>({
    name: config.name,
  });
  const error = extractErrorMessage(fieldState);
  const invalid = fieldState.invalid;
  const tone: FieldHelpTone | undefined = error
    ? "error"
    : config.helpTone ?? (config.description ? "default" : undefined);

  return (
    <Field
      label={config.label}
      required={config.required}
      help={error ?? config.description}
      tone={tone}
    >
      {config.render({
        value: field.value as TFieldValues[TName],
        onChange: (next) => field.onChange(next),
        onBlur: field.onBlur,
        name: field.name,
        ref: field.ref,
        error,
        invalid,
      })}
    </Field>
  );
}

function extractErrorMessage(state: ControllerFieldState): string | undefined {
  const err = state.error;
  if (!err) return undefined;
  if (typeof err.message === "string" && err.message) return err.message;
  if (Array.isArray((err as { types?: Record<string, string> }).types)) {
    const types = (err as unknown as { types: Record<string, string> }).types;
    const firstKey = Object.keys(types)[0];
    if (firstKey) return types[firstKey];
  }
  return err.type ? `Invalid (${err.type})` : "Invalid value";
}

export { useFormContext };
