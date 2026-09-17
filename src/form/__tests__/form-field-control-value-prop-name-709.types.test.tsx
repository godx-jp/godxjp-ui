import { describe, expect, it } from "vitest";

import { Checkbox, Input, Switch } from "../../components/data-entry";
import { FormFieldControl } from "../form-field-control";

/*
 * gh#709 — TYPE contract: `valuePropName="checked"` NARROWS the render-prop bag to
 * `checked` / `onCheckedChange`, so `<Checkbox {...field}>label</Checkbox>` and `<Switch {...field} />`
 * compile with no wiring and no cast, and the default bag keeps `value` / `onChange`.
 *
 * Checked by `pnpm typecheck` (tsconfig includes `src/**`): a regression is a compile error below —
 * including the `@ts-expect-error` lines, which fail the build if the narrowing ever stops.
 */

type Values = { is_shared: boolean; notify: boolean; title: string };

describe("FormFieldControl valuePropName narrows the render-prop bag (gh#709)", () => {
  it("types `checked` for valuePropName='checked' and `value` by default", () => {
    const element = (
      <>
        <FormFieldControl<Values> name="is_shared" valuePropName="checked">
          {(field) => {
            const checked: boolean = field.checked;
            // @ts-expect-error — the checked bag carries no `value`
            void field.value;
            // @ts-expect-error — the checked bag carries no `onChange`
            void field.onChange;
            void checked;
            return <Checkbox {...field}>Share with the project</Checkbox>;
          }}
        </FormFieldControl>
        <FormFieldControl<Values> name="notify" label="Notify" valuePropName="checked">
          {(field) => <Switch {...field} />}
        </FormFieldControl>
        <FormFieldControl<Values> name="title" label="Title">
          {(field) => {
            // @ts-expect-error — the default bag carries no `checked`
            void field.checked;
            return <Input {...field} value={String(field.value ?? "")} />;
          }}
        </FormFieldControl>
      </>
    );
    expect(element).toBeTruthy();
  });
});
