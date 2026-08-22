/**
 * FormField — the label reaches every control NESTED under a composite wrapper (gh#303).
 *
 * `cloneElement` wires the field-a11y contract onto FormField's single direct child only. In the
 * real app the child of a range / 年月 field is a `Flex`, so the name stopped on the wrapper div
 * and every control inside was nameless — measured across 92 screens as axe `label` (46 nodes:
 * `<input data-slot="input">` in from/to pairs) and `button-name` (Radix Select /
 * SearchSelect `role="combobox"` triggers).
 *
 * The fix: FormField also publishes its label through FieldNameContext, and each control's
 * semantic focus target (Input's <input>, SelectTrigger, SearchSelect's trigger) adopts it as a
 * LAST-RESORT accessible name — a control that already has a name keeps it. Every assertion here
 * reads the COMPUTED accessible name on the real focus target and fails without the fix.
 */
import { describe, expect, it } from "vitest";

import { FormField } from "../form-field";
import { Input } from "../input";
import { NumberInput } from "../number-input";
import { Select } from "../select";
import { SearchSelect } from "../search-select";
import { Flex } from "../../layout/flex";
import { renderWithUi } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

const OPTIONS = [
  { value: "1", label: "1月" },
  { value: "2", label: "2月" },
];

describe("FormField composite-child naming (gh#303)", () => {
  it("names every nested input in a range from/to pair after the field label", () => {
    renderWithUi(
      <FormField id="search_billing_amount" label="請求金額">
        <Flex gap="sm" align="center">
          <Input id="search_billing_amount_from" />
          <span aria-hidden="true">〜</span>
          <Input id="search_billing_amount_to" />
        </Flex>
      </FormField>,
    );
    const from = document.getElementById("search_billing_amount_from")!;
    const to = document.getElementById("search_billing_amount_to")!;
    expect(from).toHaveAccessibleName("請求金額");
    expect(to).toHaveAccessibleName("請求金額");
    // The composite wrapper itself is a valid named group, not a named bare div.
    const wrapper = document.getElementById("search_billing_amount")!;
    expect(wrapper).toHaveAttribute("role", "group");
    expect(wrapper).not.toHaveAttribute("aria-required");
  });

  it("names a nested plain Select trigger (role=combobox) after the field label", () => {
    const { getByRole } = renderWithUi(
      <FormField id="create_target_ym" label="対象年月">
        <Flex gap="sm" align="center">
          <Input id="create_year" inputMode="numeric" />
          <Select id="create_month" options={OPTIONS} placeholder="月" />
        </Flex>
      </FormField>,
    );
    expect(getByRole("combobox")).toHaveAccessibleName("対象年月");
    expect(getByRole("combobox")).toHaveAttribute("id", "create_month");
  });

  it("names a nested SearchSelect trigger after the field label", () => {
    const { getByRole } = renderWithUi(
      <FormField id="search_products_field" label="製品">
        <Flex gap="sm" align="center">
          <SearchSelect id="search_products_0" options={OPTIONS} />
        </Flex>
      </FormField>,
    );
    expect(getByRole("combobox")).toHaveAccessibleName("製品");
  });

  it("names a nested NumberInput (composed on Input) after the field label", () => {
    renderWithUi(
      <FormField id="search_qty" label="数量">
        <Flex gap="sm" align="center">
          <NumberInput id="search_qty_from" />
          <span aria-hidden="true">〜</span>
          <NumberInput id="search_qty_to" />
        </Flex>
      </FormField>,
    );
    expect(document.getElementById("search_qty_from")!).toHaveAccessibleName("数量");
    expect(document.getElementById("search_qty_to")!).toHaveAccessibleName("数量");
  });

  it("a nested control's OWN name always wins over the fallback", () => {
    renderWithUi(
      <FormField id="search_period" label="期間">
        <Flex gap="sm" align="center">
          <Input id="search_period_from" aria-label="開始日" />
          <Input id="search_period_to" aria-label="終了日" />
        </Flex>
      </FormField>,
    );
    expect(document.getElementById("search_period_from")!).toHaveAccessibleName("開始日");
    expect(document.getElementById("search_period_to")!).toHaveAccessibleName("終了日");
  });

  it("the single-direct-child contract is unchanged (labelledby from cloneElement, not context)", () => {
    renderWithUi(
      <FormField id="single" label="担当部署">
        <Input />
      </FormField>,
    );
    const input = document.getElementById("single")!;
    expect(input).toHaveAccessibleName("担当部署");
    expect(input).toHaveAttribute("aria-labelledby", "single-label");
  });

  it("the measured composite screen shape passes axe (label / button-name / aria-allowed-attr)", async () => {
    await expectNoA11yViolations(
      <>
        <FormField id="search_billing_amount" label="請求金額">
          <Flex gap="sm" align="center">
            <Input id="search_billing_amount_from" />
            <span aria-hidden="true">〜</span>
            <Input id="search_billing_amount_to" />
          </Flex>
        </FormField>
        <FormField id="create_target_ym" label="対象年月" required>
          <Flex gap="sm" align="center">
            <Input id="create_year" inputMode="numeric" />
            <Select id="create_month" options={OPTIONS} placeholder="月" />
          </Flex>
        </FormField>
      </>,
    );
  });
});
