/** Form module prop types — react-hook-form + Zod 4 only. */
import type * as React from "react";
import type { FieldPath, FieldValues, UseFormProps, UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { ErrorProp, HelperProp, IdProp, LabelProp, RequiredProp } from "../vocabulary";

/** Schema passed to useZodForm — must be Zod 4 object schema. */
export type ZodSchemaProp<T extends z.ZodType = z.ZodType> = T;

/** Options for useZodForm (resolver injected automatically). */
export type UseZodFormOptionsProp<TFieldValues extends FieldValues> = Omit<
  UseFormProps<TFieldValues>,
  "resolver"
>;

/** Return type of useZodForm. */
export type UseZodFormReturnProp<TFieldValues extends FieldValues> = UseFormReturn<TFieldValues>;

/**
 * Framework-agnostic form-state adapter — decouples `FormRoot`/`FormFieldControl` from any single
 * form library. The DS ships the built-in react-hook-form path (`form`), and an adapter lets a
 * SERVER-driven form library plug into the same auto-binding: Inertia's `useForm`
 * (`@godxjp/ui/inertia`), formik, or TanStack Form. The core has ZERO dependency on any of them —
 * a consumer wraps its own form object in an adapter and passes it to `FormRoot`.
 */
export interface FormStateAdapter {
  /** Current value of the field `name` (dotted paths allowed if the underlying store supports them). */
  getValue(name: string): unknown;
  /** Write `value` back to the field `name` (e.g. Inertia's `setData(name, value)`). */
  setValue(name: string, value: unknown): void;
  /** Server/validation error message for `name`, or undefined when the field is valid. */
  getError(name: string): string | undefined;
  /** True while a submit is in flight (e.g. Inertia's `processing`) — drives submit-button loading. */
  isSubmitting: boolean;
  /** Optional blur handler (e.g. touch-tracking); called with the field name. */
  onBlur?(name: string): void;
  /** Optional snapshot of all values, passed to `onSubmit`; defaults to `{}` when absent. */
  getValues?(): unknown;
}

/** @see FormRoot */
export type FormRootProp<TFieldValues extends FieldValues> = {
  /**
   * react-hook-form return (client-side Zod validation). Provide EITHER `form` OR `adapter` — `form`
   * is the built-in client path; `adapter` plugs in a server-driven form library (Inertia/formik).
   */
  form?: UseZodFormReturnProp<TFieldValues>;
  /**
   * Framework-agnostic form-state adapter (e.g. `inertiaAdapter(form)` from `@godxjp/ui/inertia`).
   * Provide EITHER `form` OR `adapter`. With an adapter, `FormFieldControl` auto-binds each field by
   * `name` (value/onChange/error/aria) and `useFormSubmitting()` reads `isSubmitting`.
   */
  adapter?: FormStateAdapter;
  /** Submit handler. RHF path receives validated `values`; the adapter path calls it with a snapshot (`getValues()`), typically ignored in favour of the form library's own submit (`form.post(url)`). */
  onSubmit: (values: TFieldValues) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  id?: IdProp;
};

/** @see FormFieldControl */
export type FormFieldControlProp<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: LabelProp;
  required?: RequiredProp;
  helper?: HelperProp;
  className?: string;
  children: (field: {
    id: string;
    name: string;
    value: unknown;
    onChange: (...args: unknown[]) => void;
    onBlur: () => void;
    ref: React.Ref<HTMLInputElement>;
  }) => React.ReactNode;
};

/** Mapped field error from RHF — displayed via FormField error slot. */
export type FieldErrorMessageProp = ErrorProp;
