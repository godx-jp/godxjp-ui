import { FormProvider, type FieldValues } from "react-hook-form";

import { cn } from "../lib/utils";
import { FormAdapterContext } from "./form-context";
import type { FormRootProp } from "../props/components/form.prop";

export type { FormRootProp } from "../props/components/form.prop";

/**
 * FormRoot — the form shell. Provide EITHER `form` (built-in react-hook-form + Zod, client-side
 * validation) OR `adapter` (a framework-agnostic {@link FormStateAdapter} for a server-driven form
 * library — Inertia's `useForm` via `@godxjp/ui/inertia`, formik, TanStack Form).
 */
export function FormRoot<TFieldValues extends FieldValues>({
  form,
  adapter,
  onSubmit,
  children,
  className,
  id,
}: FormRootProp<TFieldValues>) {
  // Adapter path (server-driven): no react-hook-form. The form library owns submission
  // (e.g. `form.post(url)` inside `onSubmit`); we prevent the native navigation and pass a values
  if (adapter) {
    return (
      <FormAdapterContext.Provider value={adapter}>
        <form
          id={id}
          className={cn("ui-stack-md", className)}
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit((adapter.getValues?.() ?? {}) as TFieldValues);
          }}
          noValidate
        >
          {children}
        </form>
      </FormAdapterContext.Provider>
    );
  }

  // Built-in react-hook-form path (unchanged).
  if (!form) {
    throw new Error("FormRoot requires either a `form` (react-hook-form) or an `adapter` prop.");
  }
  return (
    <FormProvider {...form}>
      <form
        id={id}
        className={cn("ui-stack-md", className)}
        onSubmit={(event) => {
          void form.handleSubmit((values) => onSubmit(values))(event);
        }}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}
