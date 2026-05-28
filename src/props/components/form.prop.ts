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

/** @see FormRoot */
export type FormRootProp<TFieldValues extends FieldValues> = {
  form: UseZodFormReturnProp<TFieldValues>;
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
