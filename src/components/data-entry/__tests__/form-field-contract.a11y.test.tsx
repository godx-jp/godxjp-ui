import type * as React from "react";
import { describe, expect, it } from "vitest";

import { FormField } from "../form-field";
import { Input } from "../input";
import { Textarea } from "../textarea";
import { NumberInput } from "../number-input";
import { Select } from "../select";
import { SearchSelect } from "../search-select";
import { SearchInput } from "../search-input";
import { DatePicker } from "../date-picker";
import { MonthPicker } from "../month-picker";
import { TimePicker } from "../time-picker";
import { DateRangePicker } from "../date-range-picker";
import { MonthRangePicker } from "../month-range-picker";
import { Cascader } from "../cascader";
import { TreeSelect } from "../tree-select";
import { ColorPicker } from "../color-picker";
import { CheckboxGroup } from "../checkbox-group";
import { RadioGroup } from "../radio";
import { Upload } from "../upload";
import { Transfer } from "../transfer";
import { expectNoA11yViolations } from "@/test/a11y";
import { renderWithUi } from "@/test/render";

// #164 — FormField wires a label (aria-labelledby), helper (aria-describedby) and error
// (aria-errormessage/aria-invalid, or folded into aria-describedby for group roles) onto its
// control child. This suite proves EVERY custom control forwards that contract to its real
// semantic focus target by asserting the COMPUTED accessible name / description on that element —
// not merely that an attribute was set on a wrapper.

const LABEL = "担当部署"; // "Department in charge"
const HELPER = "後で変更できます"; // "You can change this later"
const ERROR = "必須項目です"; // "This field is required"

const OPTIONS = [
  { value: "sales", label: "営業部" },
  { value: "dev", label: "開発部" },
];
const TREE = [
  {
    value: "jp",
    label: "日本",
    children: [
      { value: "tokyo", label: "東京" },
      { value: "osaka", label: "大阪" },
    ],
  },
];
const TRANSFER = [
  { key: "a", title: "項目A" },
  { key: "b", title: "項目B" },
];

/** Focus-target controls whose role exposes the full validation contract (aria-invalid + error). */
const WIDGET_CASES: Array<{
  name: string;
  role: string;
  render: (id: string) => React.ReactElement;
}> = [
  { name: "Input", role: "textbox", render: (id) => <Input id={id} /> },
  { name: "Textarea", role: "textbox", render: (id) => <Textarea id={id} /> },
  {
    name: "NumberInput",
    role: "spinbutton",
    render: (id) => <NumberInput id={id} onValueChange={() => {}} />,
  },
  {
    name: "Select (listbox)",
    role: "combobox",
    render: (id) => <Select id={id} options={OPTIONS} onValueChange={() => {}} />,
  },
  {
    name: "Select (showSearch)",
    role: "combobox",
    render: (id) => <Select id={id} options={OPTIONS} showSearch onValueChange={() => {}} />,
  },
  {
    name: "SearchSelect",
    role: "combobox",
    render: (id) => <SearchSelect id={id} options={OPTIONS} onValueChange={() => {}} />,
  },
  { name: "DatePicker", role: "combobox", render: (id) => <DatePicker id={id} /> },
  { name: "MonthPicker", role: "combobox", render: (id) => <MonthPicker id={id} /> },
  { name: "TimePicker", role: "combobox", render: (id) => <TimePicker id={id} /> },
  {
    name: "Cascader",
    role: "combobox",
    render: (id) => <Cascader id={id} options={TREE} onValueChange={() => {}} />,
  },
  {
    name: "TreeSelect",
    role: "combobox",
    render: (id) => <TreeSelect id={id} treeData={TREE} onValueChange={() => {}} />,
  },
  { name: "SearchInput", role: "searchbox", render: (id) => <SearchInput id={id} /> },
];

describe.each(WIDGET_CASES)("FormField contract → $name", ({ role, render }) => {
  it("computes its accessible name from the FormField label", () => {
    const { getByRole } = renderWithUi(
      <FormField id="f" label={LABEL}>
        {render("f")}
      </FormField>,
    );
    expect(getByRole(role)).toHaveAccessibleName(LABEL);
  });

  it("computes its accessible description from the FormField helper", () => {
    const { getByRole } = renderWithUi(
      <FormField id="f" label={LABEL} helper={HELPER}>
        {render("f")}
      </FormField>,
    );
    expect(getByRole(role)).toHaveAccessibleDescription(HELPER);
  });

  it("is marked invalid and points aria-errormessage at the FormField error", () => {
    const { getByRole, getByText } = renderWithUi(
      <FormField id="f" label={LABEL} error={ERROR}>
        {render("f")}
      </FormField>,
    );
    const control = getByRole(role);
    expect(control).toHaveAttribute("aria-invalid", "true");
    const errorEl = getByText(ERROR);
    expect(control.getAttribute("aria-errormessage")).toBe(errorEl.id);
  });

  it("marks required via aria-required", () => {
    const { getByRole } = renderWithUi(
      <FormField id="f" label={LABEL} required>
        {render("f")}
      </FormField>,
    );
    expect(getByRole(role)).toHaveAttribute("aria-required", "true");
  });

  it("has no axe violations (label + helper + error)", async () => {
    await expectNoA11yViolations(
      <FormField id="f" label={LABEL} required helper={HELPER} error={ERROR}>
        {render("f")}
      </FormField>,
    );
  });
});

// role="radiogroup" IS a widget → full validation contract.
describe("FormField contract → RadioGroup", () => {
  const render = (id: string) => <RadioGroup id={id} options={OPTIONS} onValueChange={() => {}} />;

  it("names the radiogroup and announces helper + error", () => {
    const { getByRole, getByText } = renderWithUi(
      <FormField id="f" label={LABEL} helper={HELPER} error={ERROR}>
        {render("f")}
      </FormField>,
    );
    const group = getByRole("radiogroup");
    expect(group).toHaveAccessibleName(LABEL);
    expect(group).toHaveAccessibleDescription(HELPER);
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group.getAttribute("aria-errormessage")).toBe(getByText(ERROR).id);
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <FormField id="f" label={LABEL} required helper={HELPER} error={ERROR}>
        {render("f")}
      </FormField>,
    );
  });
});

// Group-container controls (role="group") — validation error is folded into the description
// because aria-invalid / aria-errormessage are invalid on a non-widget group per ARIA 1.2.
const GROUP_CASES: Array<{ name: string; render: (id: string) => React.ReactElement }> = [
  {
    name: "CheckboxGroup",
    render: (id) => <CheckboxGroup id={id} options={OPTIONS} onValueChange={() => {}} />,
  },
  {
    name: "DateRangePicker",
    render: (id) => <DateRangePicker id={id} onValueChange={() => {}} />,
  },
  {
    name: "MonthRangePicker",
    render: (id) => <MonthRangePicker id={id} onValueChange={() => {}} />,
  },
  {
    name: "Transfer",
    render: (id) => (
      <Transfer id={id} dataSource={TRANSFER} targetKeys={[]} onValueChange={() => {}} />
    ),
  },
];

describe.each(GROUP_CASES)("FormField contract → $name (group)", ({ render }) => {
  it("names the group from the FormField label", () => {
    const { getByRole } = renderWithUi(
      <FormField id="f" label={LABEL}>
        {render("f")}
      </FormField>,
    );
    expect(getByRole("group")).toHaveAccessibleName(LABEL);
  });

  it("folds helper AND error into the group description", () => {
    const { getByRole } = renderWithUi(
      <FormField id="f" label={LABEL} helper={HELPER} error={ERROR}>
        {render("f")}
      </FormField>,
    );
    const group = getByRole("group");
    expect(group).toHaveAccessibleDescription(new RegExp(`${HELPER}.*${ERROR}`));
    // aria-invalid / aria-errormessage are widget-only — never leak onto a role="group".
    expect(group).not.toHaveAttribute("aria-invalid");
    expect(group).not.toHaveAttribute("aria-errormessage");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <FormField id="f" label={LABEL} required helper={HELPER} error={ERROR}>
        {render("f")}
      </FormField>,
    );
  });
});

// ColorPicker's <input type="color"> and Upload's <input type="file"> have no ARIA role, so query
// them structurally and assert the COMPUTED accessible name/description reached them.
describe("FormField contract → ColorPicker", () => {
  it("names the color swatch input and describes it from the helper", () => {
    const { container } = renderWithUi(
      <FormField id="f" label={LABEL} helper={HELPER}>
        <ColorPicker id="f" onValueChange={() => {}} />
      </FormField>,
    );
    const swatch = container.querySelector<HTMLInputElement>('input[type="color"]');
    expect(swatch).toBeTruthy();
    expect(swatch!).toHaveAccessibleName(LABEL);
    expect(swatch!).toHaveAccessibleDescription(HELPER);
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <FormField id="f" label={LABEL} required helper={HELPER} error={ERROR}>
        <ColorPicker id="f" onValueChange={() => {}} />
      </FormField>,
    );
  });
});

describe("FormField contract → Upload", () => {
  it("names the native file input from the FormField label", () => {
    const { container } = renderWithUi(
      <FormField id="f" label={LABEL} helper={HELPER}>
        <Upload id="f" onValueChange={() => {}} />
      </FormField>,
    );
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(fileInput).toBeTruthy();
    expect(fileInput!).toHaveAccessibleName(LABEL);
    expect(fileInput!).toHaveAccessibleDescription(HELPER);
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <FormField id="f" label={LABEL} required helper={HELPER}>
        <Upload id="f" onValueChange={() => {}} />
      </FormField>,
    );
  });
});
