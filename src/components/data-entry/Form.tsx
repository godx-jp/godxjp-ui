import { createContext, useContext, type ComponentProps } from "react";
import {
  FormProvider,
  useForm,
  useFormContext,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import { cn } from "../cn";
import type { LoadingProp } from "../../props";

export type FormLayout = "vertical" | "horizontal" | "inline";

export interface FormProps<T extends FieldValues = FieldValues>
  extends Omit<ComponentProps<"form">, "onSubmit" | "defaultValue"> {
  form?: UseFormReturn<T>;
  defaultValues?: DefaultValues<T>;
  resolver?: Resolver<T>;
  mode?: UseFormProps<T>["mode"];
  onSubmit?: (values: T) => void | Promise<void>;
  /** Visual layout. Mobile-first: every layout collapses to vertical at `xs`;
   * `horizontal` becomes label-left at `md`, `inline` becomes single-row at `sm`. */
  layout?: FormLayout;
  /** When set, every `<FormField>` inside this form renders its loading
   * state (spinner by default, skeleton via `{ kind: "skeleton" }`).
   * Each `<FormField>` can override with its own `loading` prop. */
  loading?: LoadingProp;
}

interface FormLoadingContext {
  loading: LoadingProp | undefined;
}
const FormLoadingCtx = createContext<FormLoadingContext>({ loading: undefined });

/** Read the surrounding Form's loading state (used by `<FormField>`). */
export function useFormLoading(): LoadingProp | undefined {
  return useContext(FormLoadingCtx).loading;
}

export function Form<T extends FieldValues>({
  form,
  defaultValues,
  resolver,
  mode = "onTouched",
  onSubmit,
  layout = "vertical",
  loading,
  className,
  children,
  ...rest
}: FormProps<T>) {
  const local = useForm<T>({
    defaultValues,
    resolver,
    mode,
  });
  const active = form ?? local;
  return (
    <FormProvider {...active}>
      <FormLoadingCtx.Provider value={{ loading }}>
        <form
          className={cn("form", `form-${layout}`, className)}
          onSubmit={onSubmit ? active.handleSubmit(onSubmit) : undefined}
          noValidate
          {...rest}
        >
          {children}
        </form>
      </FormLoadingCtx.Provider>
    </FormProvider>
  );
}

export { useFormContext };
