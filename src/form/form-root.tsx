import { FormProvider, type FieldValues } from "react-hook-form";

import { cn } from "../lib/utils";
import type { FormRootProp } from "../props/components/form.prop";

export type { FormRootProp } from "../props/components/form.prop";

export function FormRoot<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  id,
}: FormRootProp<TFieldValues>) {
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
