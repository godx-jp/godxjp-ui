/**
 * FormField publishes the field's MACHINE KEY onto its control (gh#337).
 *
 * A ported back office is driven by screen automation (RPA) as well as by people. The legacy
 * CakePHP screens gave every control a `name` and an `id`, and both disappeared in the React
 * rewrite: measured on 案件, `name` went from 98 of 100 controls to 3 of 67, and no select, radio
 * or checkbox carried an id its options could be addressed by. That is not only an automation
 * problem — `name` on a form control is basic HTML semantics and an id on a select/radio/checkbox
 * is an accessibility requirement — so the fix belongs in the library, not in 1,281 call sites.
 *
 * Two rules this file pins:
 *  - `data-field` is INERT metadata and is always emitted.
 *  - `name` changes what a native form submit sends, so it is opt-in per app
 *    (`<AppProvider emitFieldNames>`). A shared package must not start posting new keys to a
 *    consumer's backend on an upgrade.
 *
 * Every assertion reads the real DOM attribute on the real focus target and fails without the fix.
 */
import * as React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { FormField } from "../form-field";
import { Input } from "../input";
import { Textarea } from "../textarea";
import { NumberInput } from "../number-input";
import { Select } from "../select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { Radio } from "../radio";
import { Checkbox } from "../checkbox";
import { Switch } from "../switch";
import { DatePicker } from "../date-picker";
import { Cascader } from "../cascader";
import { MonthPicker } from "../month-picker";
import { TimePicker } from "../time-picker";
import { Flex } from "../../layout/flex";
import { AppProvider } from "../../../app/app-provider";
import { renderWithUi, userEvent, within } from "@/test/render";

const OPTIONS = [
  { value: "52", label: "東京本社" },
  { value: "53", label: "大阪支社" },
];

/** The consumer that opted in — the only configuration in which `name` is emitted. */
function renderNamed(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppProvider persist={false} defaultLocale="ja" emitFieldNames>
        <form data-testid="form">{children}</form>
      </AppProvider>
    ),
  });
}

describe("FormField field identity — data-field (gh#337)", () => {
  it("defaults the key to the field id and puts it on the control", () => {
    renderWithUi(
      <FormField id="project_name" label="案件名">
        <Input />
      </FormField>,
    );
    expect(document.getElementById("project_name")).toHaveAttribute("data-field", "project_name");
  });

  it("prefers an explicit `field` over `name`, and `name` over `id`", () => {
    renderWithUi(
      <>
        <FormField id="a_field" name="a_name" field="a_field_key" label="A">
          <Input />
        </FormField>
        {/* `id` is a DOM-uniqueness token; `name` is the server's own key, so it outranks it. */}
        <FormField id="source_slip_field" name="source_slip_id" label="B">
          <Input />
        </FormField>
      </>,
    );
    expect(document.getElementById("a_field")).toHaveAttribute("data-field", "a_field_key");
    expect(document.getElementById("source_slip_field")).toHaveAttribute(
      "data-field",
      "source_slip_id",
    );
  });

  it("never invents a key from the auto-generated id", () => {
    renderWithUi(
      <FormField label="キー無し">
        <Input data-testid="anon" />
      </FormField>,
    );
    // The control still gets its generated `id` (that contract is unchanged) but no `data-field`:
    // a «r3»-style token is not something anything outside React can be pointed at.
    const input = document.querySelector<HTMLInputElement>('[data-testid="anon"]')!;
    expect(input.id).not.toBe("");
    expect(input).not.toHaveAttribute("data-field");
  });

  it("a key written on the control itself always wins", () => {
    renderWithUi(
      <FormField id="outer" label="上書き">
        <Input data-field="inner" />
      </FormField>,
    );
    expect(document.getElementById("outer")).toHaveAttribute("data-field", "inner");
  });

  it("reaches the semantic focus target of every control kind", () => {
    renderWithUi(
      <>
        <FormField id="remarks" label="備考">
          <Textarea />
        </FormField>
        <FormField id="sales_limit_amount" label="限度額">
          <NumberInput />
        </FormField>
        <FormField id="branch_cd" label="拠点">
          <Select options={OPTIONS} value="52" onValueChange={() => {}} />
        </FormField>
        <FormField id="tax_class" label="税区分">
          <Radio.Group options={OPTIONS} value="52" />
        </FormField>
        <FormField id="flags" label="フラグ">
          <Checkbox.Group options={OPTIONS} value={["52"]} />
        </FormField>
        <FormField id="is_active" label="有効">
          <Checkbox />
        </FormField>
        <FormField id="enabled" label="通知">
          <Switch />
        </FormField>
        <FormField id="order_date" label="受注日">
          <DatePicker />
        </FormField>
        <FormField id="area_cd" label="地域">
          <Cascader options={[{ value: "a", label: "A" }]} />
        </FormField>
      </>,
    );
    for (const id of [
      "remarks",
      "sales_limit_amount",
      "branch_cd",
      "tax_class",
      "flags",
      "is_active",
      "enabled",
      "order_date",
      "area_cd",
    ]) {
      expect(document.getElementById(id)).toHaveAttribute("data-field", id);
    }
  });
});

describe("FormField field identity — native name is opt-in (gh#337)", () => {
  it("emits NO name by default, so an existing app submits exactly what it did before", () => {
    const { getByTestId } = renderWithUi(
      <form data-testid="form">
        <FormField id="project_name" label="案件名">
          <Input defaultValue="A" />
        </FormField>
      </form>,
    );
    expect(document.getElementById("project_name")).not.toHaveAttribute("name");
    expect([...new FormData(getByTestId("form") as HTMLFormElement).keys()]).toEqual([]);
  });

  it("emits the key as `name` once the app opts in", () => {
    renderNamed(
      <FormField id="project_name" label="案件名">
        <Input defaultValue="A" />
      </FormField>,
    );
    expect(document.getElementById("project_name")).toHaveAttribute("name", "project_name");
  });

  it("a name written on the control itself always wins", () => {
    renderNamed(
      <FormField id="outer" label="上書き">
        <Input name="inner" />
      </FormField>,
    );
    expect(document.getElementById("outer")).toHaveAttribute("name", "inner");
  });

  it("a native submit carries every control kind under its own key", () => {
    const { getByTestId } = renderNamed(
      <>
        <FormField id="project_name" label="案件名">
          <Input defaultValue="案件A" />
        </FormField>
        <FormField id="remarks" label="備考">
          <Textarea defaultValue="メモ" />
        </FormField>
        <FormField id="branch_cd" label="拠点">
          <Select options={OPTIONS} value="52" onValueChange={() => {}} />
        </FormField>
        <FormField id="tax_class" label="税区分">
          <Radio.Group options={OPTIONS} value="53" />
        </FormField>
        <FormField id="flags" label="フラグ">
          <Checkbox.Group options={OPTIONS} value={["52"]} />
        </FormField>
      </>,
    );
    const data = new FormData(getByTestId("form") as HTMLFormElement);
    expect(data.get("project_name")).toBe("案件A");
    expect(data.get("remarks")).toBe("メモ");
    // The CODE, never the visible label.
    expect(data.get("branch_cd")).toBe("52");
    expect(data.get("tax_class")).toBe("53");
    expect(data.get("flags")).toBe("52");
  });

  it("works with no AppProvider above it — data-field yes, name no", () => {
    render(
      <FormField id="project_name" label="案件名">
        <Input />
      </FormField>,
    );
    const input = document.getElementById("project_name")!;
    expect(input).toHaveAttribute("data-field", "project_name");
    expect(input).not.toHaveAttribute("name");
  });
});

describe("Select / Radio / Checkbox addressability (gh#337)", () => {
  it("the Select TRIGGER publishes the selected code, not the visible label", () => {
    const { getByRole } = renderWithUi(
      <FormField id="branch_cd" label="拠点">
        <Select options={OPTIONS} value="52" onValueChange={() => {}} />
      </FormField>,
    );
    const trigger = getByRole("combobox");
    // What a person sees vs. what the row actually holds — the whole point of R-3.
    expect(trigger).toHaveTextContent("東京本社");
    expect(trigger).toHaveAttribute("data-value", "52");
    expect(trigger).toHaveAttribute("data-field", "branch_cd");
    expect(trigger).toHaveAttribute("id", "branch_cd");
  });

  it("omits data-value entirely while nothing is selected", () => {
    const { getByRole } = renderWithUi(
      <FormField id="branch_cd" label="拠点">
        <Select options={OPTIONS} value="" onValueChange={() => {}} placeholder="選択" />
      </FormField>,
    );
    expect(getByRole("combobox")).not.toHaveAttribute("data-value");
  });

  it("tracks an UNCONTROLLED pick, which Radix would otherwise keep to itself", async () => {
    const user = userEvent.setup();
    const { getByRole } = renderWithUi(
      <FormField id="branch_cd" label="拠点">
        <Select options={OPTIONS} placeholder="選択" />
      </FormField>,
    );
    const trigger = getByRole("combobox");
    expect(trigger).not.toHaveAttribute("data-value");
    await user.click(trigger);
    await user.click(await within(document.body).findByRole("option", { name: "大阪支社" }));
    expect(trigger).toHaveAttribute("data-value", "53");
  });

  it("carries the contract through the COMPOUND API, whose Radix root drops cloned props", () => {
    const { getByRole } = renderWithUi(
      <FormField id="branch_cd" label="拠点">
        <Select value="52" onValueChange={() => {}}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="52">東京本社</SelectItem>
          </SelectContent>
        </Select>
      </FormField>,
    );
    const trigger = getByRole("combobox");
    expect(trigger).toHaveAttribute("data-field", "branch_cd");
    expect(trigger).toHaveAttribute("data-value", "52");
  });

  it("gives each radio option a STABLE id derived from the field, not a React useId token", () => {
    const field = (
      <FormField id="tax_class" label="税区分">
        <Radio.Group options={OPTIONS} value="52" />
      </FormField>
    );
    const first = renderWithUi(field);
    expect(document.getElementById("tax_class-52")).toHaveAttribute("role", "radio");
    expect(document.getElementById("tax_class-52")).toHaveAttribute("data-field", "tax_class");
    expect(document.getElementById("tax_class-53")).not.toBeNull();
    // Its label points at it, so click-to-select keeps working off the same id.
    expect(document.querySelector('label[for="tax_class-52"]')).toHaveTextContent("東京本社");
    // DETERMINISTIC: a second, independent mount produces the SAME id. `React.useId()` — what this
    // used to be — produces a different token per mount and per build, so nothing outside React
    // could ever address a single radio.
    first.unmount();
    renderWithUi(field);
    expect(document.getElementById("tax_class-52")).not.toBeNull();
  });

  it("gives each checkbox option the same stable id and key", () => {
    renderWithUi(
      <FormField id="flags" label="フラグ">
        <Checkbox.Group options={OPTIONS} value={["52"]} />
      </FormField>,
    );
    const box = document.getElementById("flags-52")!;
    expect(box).toHaveAttribute("role", "checkbox");
    expect(box).toHaveAttribute("data-field", "flags");
    expect(document.querySelector('label[for="flags-53"]')).toHaveTextContent("大阪支社");
  });

  it("falls back to a generated option id when the group has no id of its own", () => {
    renderWithUi(<Radio.Group options={OPTIONS} value="52" aria-label="税区分" />);
    // Nothing to derive from — the pre-#337 behaviour, kept so a group without an id still renders
    // unique ids rather than colliding on the bare option value.
    expect(document.querySelector('[role="radio"][value="52"]')?.id).toMatch(/-52-0$/);
  });
});

describe("Nested controls under a layout wrapper (gh#337)", () => {
  /**
   * 322 of 1,410 measured controls (23%) sit one level below FormField — the direct child is a
   * `Flex` holding a from/to pair, a 年/月 combo, or a value + 「不明」 checkbox. `cloneElement`
   * reaches one level, so those were all anonymous, and the customer's acceptance condition is
   * 100%, not 77%. A nested control names itself from its OWN id, which 250 of the 322 already
   * carry, and which is already distinct per control at the call site.
   */
  it("names each half of a from/to pair after its own id, never the field's", () => {
    renderNamed(
      <FormField id="search_billing_date" label="請求日">
        <Flex gap="sm">
          <Input id="search_billing_date_from" />
          <Input id="search_billing_date_to" />
        </Flex>
      </FormField>,
    );
    const from = document.getElementById("search_billing_date_from")!;
    const to = document.getElementById("search_billing_date_to")!;
    expect(from).toHaveAttribute("data-field", "search_billing_date_from");
    expect(to).toHaveAttribute("data-field", "search_billing_date_to");
    // The two must never collide on one key — that is the whole reason the id is the source.
    expect(from.getAttribute("data-field")).not.toBe(to.getAttribute("data-field"));
    expect(from).toHaveAttribute("name", "search_billing_date_from");
    expect(to).toHaveAttribute("name", "search_billing_date_to");
  });

  it("covers the value + 「不明」 checkbox shape, across control kinds", () => {
    renderNamed(
      <FormField id="fax_field" label="FAX">
        <Flex gap="sm">
          <Input id="fax" />
          <Checkbox id="fax_unknown" />
        </Flex>
      </FormField>,
    );
    expect(document.getElementById("fax")).toHaveAttribute("data-field", "fax");
    expect(document.getElementById("fax_unknown")).toHaveAttribute("data-field", "fax_unknown");
  });

  it("reaches every nested control kind the survey found", () => {
    renderNamed(
      <FormField id="misc_field" label="その他">
        <Flex gap="sm">
          <Textarea id="remarks" />
          <NumberInput id="qty" />
          <Select id="branch_cd" options={OPTIONS} value="52" onValueChange={() => {}} />
          <Radio.Group id="tax_class" options={OPTIONS} value="52" />
          <Checkbox.Group id="flags" options={OPTIONS} value={["52"]} />
          <DatePicker id="order_date" />
          <MonthPicker id="target_ym" />
          <TimePicker id="start_time" />
          <Cascader id="area_cd" options={[{ value: "a", label: "A" }]} />
          <Switch id="is_active" />
        </Flex>
      </FormField>,
    );
    for (const id of [
      "remarks",
      "qty",
      "branch_cd",
      "tax_class",
      "flags",
      "order_date",
      "target_ym",
      "start_time",
      "area_cd",
      "is_active",
    ]) {
      expect(document.getElementById(id)).toHaveAttribute("data-field", id);
    }
  });

  it("lets a composite resolve its own key and own the native name", () => {
    const { getByTestId } = renderNamed(
      <FormField id="period_field" label="請求日">
        <Flex gap="sm">
          <DatePicker id="billing_date" value={new Date(2026, 0, 5)} />
        </Flex>
      </FormField>,
    );
    const visible = document.getElementById("billing_date")!;
    // DatePicker — not the Input it composes — decides which element carries the native `name`,
    // so the submitted key is the picker's own field key and the value stays ISO-8601.
    expect(visible).toHaveAttribute("data-field", "billing_date");
    expect(new FormData(getByTestId("form") as HTMLFormElement).get("billing_date")).toBe(
      "2026-01-05",
    );
  });

  it("a nested control with no id of its own gets NOTHING — never a fabricated key", () => {
    renderNamed(
      <FormField id="anon_field" label="無名">
        <Flex gap="sm">
          <Input data-testid="anon-a" />
          <Input data-testid="anon-b" />
        </Flex>
      </FormField>,
    );
    // Handing both the field's key would bind automation to an ambiguous selector that silently
    // resolves to the wrong half. Reporting the gap is the correct outcome.
    for (const testid of ["anon-a", "anon-b"]) {
      const el = document.querySelector(`[data-testid="${testid}"]`)!;
      expect(el).not.toHaveAttribute("data-field");
      expect(el).not.toHaveAttribute("name");
    }
  });

  it("leaves controls OUTSIDE a FormField completely untouched", () => {
    render(
      <AppProvider persist={false} defaultLocale="ja" emitFieldNames>
        <Input id="loose" />
      </AppProvider>,
    );
    const loose = document.getElementById("loose")!;
    expect(loose).not.toHaveAttribute("data-field");
    expect(loose).not.toHaveAttribute("name");
  });

  it("does not emit a nested name unless the app opted in", () => {
    renderWithUi(
      <FormField id="fax_field" label="FAX">
        <Flex gap="sm">
          <Input id="fax" />
        </Flex>
      </FormField>,
    );
    expect(document.getElementById("fax")).toHaveAttribute("data-field", "fax");
    expect(document.getElementById("fax")).not.toHaveAttribute("name");
  });
});
