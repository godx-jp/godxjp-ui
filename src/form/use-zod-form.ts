/**
 * Mandatory form hook — wraps react-hook-form + @hookform/resolvers/zod (Zod 4).
 */
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import type { UseZodFormOptionsProp } from "../props/components/form.prop";

export type { UseZodFormOptionsProp, UseZodFormReturnProp } from "../props/components/form.prop";

export function useZodForm<TFieldValues extends FieldValues>(
  schema: z.ZodType<TFieldValues, FieldValues>,
  options?: Omit<UseZodFormOptionsProp<TFieldValues>, "defaultValues"> & {
    defaultValues?: DefaultValues<TFieldValues>;
  },
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    ...options,
    // zodResolver + Zod 4 inference gap — runtime types are correct.
    resolver: zodResolver(schema) as Resolver<TFieldValues>,
  }) as UseFormReturn<TFieldValues>;
}
