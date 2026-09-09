import * as React from "react";
import {
  get,
  useFieldArray,
  useFormContext,
  useFormState,
  type Control,
  type FieldArrayPath,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { getFallbackFormControl, useFormDisabled } from "./form-context";
import type { FormFieldArrayProp } from "../props/components/form.prop";

export type { FormFieldArrayProp } from "../props/components/form.prop";

/** Array-LEVEL message (`z.array(...).min(1)`), which RHF files under `root` or on the node itself. */
function arrayErrorMessage(errors: unknown, name: string): string | undefined {
  const entry = get(errors, name) as
    { root?: { message?: unknown }; message?: unknown } | undefined;
  const message = entry?.root?.message ?? entry?.message;
  return typeof message === "string" && message ? message : undefined;
}

/**
 * FormFieldArray — repeating fields (antd `Form.List`) on react-hook-form's `useFieldArray`, so
 * rows keep their identity across insert/remove/move instead of being re-keyed by index.
 *
 * Each row hands back its dotted path prefix; build the child field name from it, which is what
 * makes nested validation messages land on the right row:
 *
 * ```tsx
 * <FormFieldArray<Values, "contacts"> name="contacts">
 *   {({ fields, append, remove }) => (…
 *     <FormFieldControl name={`${row.name}.email`} label={t("contact.email")}>…
 *   )}
 * </FormFieldArray>
 * ```
 *
 * react-hook-form path only — a server-driven `adapter` owns its own collection state.
 */
export function FormFieldArray<
  TFieldValues extends FieldValues,
  TName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
>({ name, children }: FormFieldArrayProp<TFieldValues, TName>) {
  const rhf = useFormContext<TFieldValues>();
  // Every hook runs before the guard below: `useFieldArray` dereferences `control` immediately, so
  // it cannot sit behind an early return without making hook order depend on the render path.
  const control = (rhf?.control ?? getFallbackFormControl()) as Control<TFieldValues>;
  const { fields, append, prepend, insert, remove, move, swap, replace } = useFieldArray<
    TFieldValues,
    TName
  >({ control, name });
  const { errors } = useFormState({ control, name: name as unknown as FieldPath<TFieldValues> });
  const disabled = useFormDisabled();

  const rows = React.useMemo(
    () =>
      fields.map((row, index) => ({
        key: row.id,
        name: `${String(name)}.${index}` as `${TName}.${number}`,
        index,
      })),
    [fields, name],
  );

  if (!rhf) {
    throw new Error(
      "FormFieldArray must be rendered inside <FormRoot form={…}> (react-hook-form path).",
    );
  }

  return (
    <>
      {children({
        fields: rows,
        append,
        prepend,
        insert,
        remove,
        move,
        swap,
        replace,
        error: arrayErrorMessage(errors, String(name)),
        disabled,
      })}
    </>
  );
}
