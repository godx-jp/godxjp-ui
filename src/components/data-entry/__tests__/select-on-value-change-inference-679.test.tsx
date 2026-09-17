import { describe, expect, expectTypeOf, it } from "vitest";

import { Select } from "../index";
import type { SelectOption } from "../index";
import type { SelectLabeledValueProp } from "../../../props/components/data-entry.prop";

/*
 * gh#679 — TYPE contract: `onValueChange={(value, option) => …}` on the data-driven `Select` must be
 * contextually typed on EVERY branch, with no annotation and under `strict`.
 *
 * `SelectProp` is a union of the four data branches and the compound API. When a callback's
 * parameters are left bare, TypeScript types them only if the union narrows to members whose
 * `onValueChange` signatures are identical. The plain single-select (no `mode`, no `labelInValue`)
 * lost that in the antd-6 union and fell to an implicit `any` (TS7006).
 *
 * This file is checked by `pnpm typecheck` (tsconfig includes `src/**`): a regression shows up as
 * TS7006 on a bare parameter, as a failed `expectTypeOf`, or as an unused `@ts-expect-error` if a
 * parameter silently widens to `any`. The runtime `it` bodies only build elements.
 */

const OPTIONS = [{ value: "jpy", label: "JPY" }];
const loadOptions = async () => ({ options: OPTIONS });

describe("Select onValueChange contextual typing (gh#679)", () => {
  it("single-select with `options` and no mode infers (string, SelectOption?)", () => {
    const element = (
      <Select
        options={OPTIONS}
        onValueChange={(value, option) => {
          expectTypeOf(value).toEqualTypeOf<string>();
          expectTypeOf(option).toEqualTypeOf<SelectOption | undefined>();
          // @ts-expect-error — `value` is a string; a regression to `any` makes this directive unused.
          const wrong: number = value;
          void wrong;
        }}
      />
    );
    expect(element).toBeTruthy();
  });

  it("single-select with `loadOptions` and no mode infers (string, SelectOption?)", () => {
    const element = (
      <Select
        loadOptions={async () => ({ options: [] })}
        onValueChange={(value, option) => {
          expectTypeOf(value).toEqualTypeOf<string>();
          expectTypeOf(option).toEqualTypeOf<SelectOption | undefined>();
          // @ts-expect-error — `option` is not an array on the single branch.
          void option?.length;
        }}
      />
    );
    expect(element).toBeTruthy();
  });

  it("mode=multiple and mode=tags infer (string[], SelectOption[]?)", () => {
    const multiple = (
      <Select
        options={OPTIONS}
        mode="multiple"
        onValueChange={(value, options) => {
          expectTypeOf(value).toEqualTypeOf<string[]>();
          expectTypeOf(options).toEqualTypeOf<SelectOption[] | undefined>();
          // @ts-expect-error — a multi value is an array, not a string.
          const wrong: string = value;
          void wrong;
        }}
      />
    );
    const tags = (
      <Select
        loadOptions={loadOptions}
        mode="tags"
        onValueChange={(value, options) => {
          expectTypeOf(value).toEqualTypeOf<string[]>();
          expectTypeOf(options).toEqualTypeOf<SelectOption[] | undefined>();
        }}
      />
    );
    expect(multiple).toBeTruthy();
    expect(tags).toBeTruthy();
  });

  it("labelInValue single infers ({value,label} | undefined, SelectOption?)", () => {
    const element = (
      <Select
        options={OPTIONS}
        labelInValue
        onValueChange={(value, option) => {
          expectTypeOf(value).toEqualTypeOf<SelectLabeledValueProp | undefined>();
          expectTypeOf(option).toEqualTypeOf<SelectOption | undefined>();
          // @ts-expect-error — the labelInValue dialect never hands back a bare string.
          const wrong: string = value;
          void wrong;
        }}
      />
    );
    expect(element).toBeTruthy();
  });

  it("labelInValue + mode infers ({value,label}[], SelectOption[]?)", () => {
    const element = (
      <Select
        options={OPTIONS}
        labelInValue
        mode="multiple"
        onValueChange={(value, options) => {
          expectTypeOf(value).toEqualTypeOf<SelectLabeledValueProp[]>();
          expectTypeOf(options).toEqualTypeOf<SelectOption[] | undefined>();
        }}
      />
    );
    expect(element).toBeTruthy();
  });

  it("still rejects a callback annotated with the wrong value type", () => {
    const element = (
      <Select
        options={OPTIONS}
        // @ts-expect-error — the single branch hands a string, never a number.
        onValueChange={(value: number) => void value}
      />
    );
    expect(element).toBeTruthy();
  });

  it("keeps an explicitly annotated caller (the consumer stopgap) compiling", () => {
    const element = (
      <Select
        loadOptions={loadOptions}
        onValueChange={(value: string, option?: SelectOption) => void [value, option]}
      />
    );
    expect(element).toBeTruthy();
  });
});
