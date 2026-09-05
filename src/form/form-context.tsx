import { createContext, useContext } from "react";
import { useFormContext, type FieldValues } from "react-hook-form";

import type { FormStateAdapter } from "../props/components/form.prop";

/**
 * Context carrying a framework-agnostic {@link FormStateAdapter}. `FormRoot` provides it on the
 * adapter path (server-driven form libraries — Inertia/formik/TanStack); it stays `null` on the
 * built-in react-hook-form path, where `FormFieldControl` falls back to RHF's own context.
 */
export const FormAdapterContext = createContext<FormStateAdapter | null>(null);

/** Read the active form-state adapter, or `null` when `FormRoot` runs the react-hook-form path. */
export function useFormAdapter(): FormStateAdapter | null {
  return useContext(FormAdapterContext);
}

/**
 * Whether the surrounding `FormRoot` is currently submitting — works for BOTH paths: the adapter's
 * `isSubmitting` (e.g. Inertia's `processing`) or react-hook-form's `formState.isSubmitting`.
 */
export function useFormSubmitting(): boolean {
  const adapter = useContext(FormAdapterContext);
  // Always call the RHF hook (returns null outside a provider) so hook order is stable.
  const rhf = useFormContext<FieldValues>();
  if (adapter) return adapter.isSubmitting;
  return rhf?.formState?.isSubmitting ?? false;
}

/**
 * Normalise a control's change payload to a bare value. The `FormFieldControl` render-prop spreads
 * `onChange` onto a control that may call it with a DOM `ChangeEvent` (native `<Input>`) OR a raw
 * value (a `Select`'s `onValueChange`).
 */
export function extractControlValue(arg: unknown): unknown {
  if (arg && typeof arg === "object" && "target" in arg) {
    const target = (arg as { target: unknown }).target;
    if (target && typeof target === "object" && "type" in target) {
      const el = target as { type?: string; value?: unknown; checked?: unknown };
      return el.type === "checkbox" ? el.checked : el.value;
    }
  }
  return arg;
}
