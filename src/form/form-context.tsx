import { createContext, useContext } from "react";
import {
  createFormControl,
  useFormContext,
  useWatch,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

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

/** Form-wide options shared by BOTH paths — currently the antd-style form-level `disabled`. */
export interface FormOptionsContextValue {
  disabled: boolean;
  submitting?: boolean;
}

/** Defaults to enabled so a `FormField`/`FormFieldControl` outside a `FormRoot` keeps working. */
export const FormOptionsContext = createContext<FormOptionsContextValue>({ disabled: false });

/**
 * Whether the surrounding `FormRoot` disables its fields (`FormRoot disabled`). Read it for the
 * action buttons, which are NOT fields and so are never disabled automatically.
 */
export function useFormDisabled(): boolean {
  return useContext(FormOptionsContext).disabled;
}

/**
 * Whether the surrounding `FormRoot` is currently submitting — works for BOTH paths: the adapter's
 * `isSubmitting` (e.g. Inertia's `processing`) or react-hook-form's `formState.isSubmitting`.
 */
export function useFormSubmitting(): boolean {
  const { submitting } = useContext(FormOptionsContext);
  const adapter = useContext(FormAdapterContext);
  // Always call the RHF hook (returns null outside a provider) so hook order is stable.
  const rhf = useFormContext<FieldValues>();
  if (adapter) return Boolean(submitting || adapter.isSubmitting);
  return Boolean(submitting || rhf?.formState?.isSubmitting);
}

/**
 * The react-hook-form instance of the surrounding `FormRoot` (antd `Form.useFormInstance`) — for
 * `setValue`/`trigger`/`getValues` deep inside a form without prop-drilling `form`. Throws on the
 * adapter path, which has no RHF instance; use {@link useFormAdapter} there.
 */
export function useFormInstance<
  TFieldValues extends FieldValues = FieldValues,
>(): UseFormReturn<TFieldValues> {
  const rhf = useFormContext<TFieldValues>();
  if (!rhf) {
    throw new Error(
      "useFormInstance must be rendered inside <FormRoot form={…}> (react-hook-form path). " +
        "On the adapter path use useFormAdapter().",
    );
  }
  return rhf;
}

/**
 * A never-mounted form control used ONLY to keep react-hook-form's hooks callable outside a
 * provider. `useWatch`/`useFieldArray` dereference `control` unconditionally, so on the adapter
 * path (no `FormProvider`) they would throw before we ever reach the adapter branch — and moving
 * the hook behind an `if` would make hook order depend on which path a form runs.
 */
let fallbackControl: Control<FieldValues> | undefined;
export function getFallbackFormControl(): Control<FieldValues> {
  fallbackControl ??= createFormControl<FieldValues>().control;
  return fallbackControl;
}

/**
 * Subscribe to a field's value (antd `Form.useWatch`) — the "show this section only when `plan`
 * is `enterprise`" case, WITHOUT re-rendering the whole form. Omit `name` for every value.
 * Works on both paths: react-hook-form's `useWatch`, or the adapter's `getValue`/`getValues`.
 *
 * Returns `unknown` — the same contract as `FormFieldControl`'s render-prop `value`. Narrow at the
 * call site (`String(v ?? "")`, a Zod parse, a type guard).
 */
export function useFormWatch<TFieldValues extends FieldValues = FieldValues>(
  name?: FieldPath<TFieldValues>,
): unknown {
  const adapter = useContext(FormAdapterContext);
  const rhf = useFormContext<TFieldValues>();
  const control = (rhf?.control ?? getFallbackFormControl()) as Control<TFieldValues>;
  // `disabled` keeps the fallback control from ever computing a value it cannot have.
  const watched: unknown = useWatch({
    control,
    name: name as never,
    disabled: !rhf,
  });
  if (adapter) return name === undefined ? adapter.getValues?.() : adapter.getValue(name);
  return watched;
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
