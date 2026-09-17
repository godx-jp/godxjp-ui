import { describe, expect, it } from "vitest";

import { DatePicker, Input, NumberInput, Select, Textarea } from "../../components/data-entry";
import { FormFieldControl } from "../form-field-control";

/*
 * gh#698 — TYPE contract: the `FormFieldControl` render-prop bag spreads onto every godx-ui data-entry
 * control with no cast. Its `ref` used to be `Ref<HTMLInputElement>`, which a `Textarea`
 * (`HTMLTextAreaElement`) or a `Select` trigger could not accept, so callers cast — or dropped the
 * ref and with it `scrollToFirstError`'s focus target.
 *
 * Checked by `pnpm typecheck` (tsconfig includes `src/**`): a regression is a compile error on one
 * of the spreads below. The runtime `it` body only builds elements.
 */

type Values = { title: string; body: string; kind: string; qty: number | null; due?: Date };

describe("FormFieldControl render-prop spreads onto every control (gh#698)", () => {
  it("spreads `{...field}` onto Input, Textarea, Select, NumberInput and DatePicker", () => {
    const element = (
      <>
        <FormFieldControl<Values> name="title" label="Title">
          {(field) => <Input {...field} value={String(field.value ?? "")} />}
        </FormFieldControl>
        <FormFieldControl<Values> name="body" label="Body">
          {(field) => <Textarea {...field} value={String(field.value ?? "")} />}
        </FormFieldControl>
        <FormFieldControl<Values> name="kind" label="Kind">
          {(field) => <Select {...field} options={[]} value={String(field.value ?? "")} />}
        </FormFieldControl>
        <FormFieldControl<Values> name="qty" label="Quantity">
          {(field) => (
            <NumberInput {...field} value={typeof field.value === "number" ? field.value : null} />
          )}
        </FormFieldControl>
        <FormFieldControl<Values> name="due" label="Due">
          {(field) => (
            <DatePicker {...field} value={field.value instanceof Date ? field.value : undefined} />
          )}
        </FormFieldControl>
      </>
    );
    expect(element).toBeTruthy();
  });
});
