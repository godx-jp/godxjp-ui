import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Select } from "../select";
import { TreeSelect } from "../tree-select";
import { Cascader } from "../cascader";
import { DatePicker } from "../date-picker";
import { TimePicker } from "../time-picker";
import { REGION_OPTIONS } from "../__fixtures__/tree-options";

/**
 * gh#691 — an antd-named prop takes antd's DEFAULT as well as its name (docs/DESIGN-AUTHORITY.md).
 * antd 6: Select / TreeSelect `allowClear` default false; Cascader / DatePicker / TimePicker
 * default true. A value is set in every case, so the only thing deciding the ✕ is the default.
 */

const OPTIONS = [
  { value: "1", label: "Bug" },
  { value: "2", label: "Task" },
];

const TREE = [
  { value: "fe", label: "Frontend" },
  { value: "be", label: "Backend" },
];

const selectClear = () => screen.queryByRole("button", { name: "Xóa lựa chọn" });

describe("Select — allowClear defaults to false (antd)", () => {
  it.each([
    ["plain", {}],
    ["searchable", { showSearch: true }],
  ])("%s: a selected value shows no ✕ unless asked", (_mode, extra) => {
    renderWithUi(
      <Select aria-label="種別" options={OPTIONS} value="1" onValueChange={() => {}} {...extra} />,
    );
    expect(selectClear()).toBeNull();
  });

  it.each([
    ["plain + allowClear", { allowClear: true }],
    ["plain + clearable", { clearable: true }],
    ["searchable + allowClear", { showSearch: true, allowClear: true }],
    ["searchable + clearable", { showSearch: true, clearable: true }],
  ])("%s shows the ✕", (_mode, extra) => {
    renderWithUi(
      <Select aria-label="種別" options={OPTIONS} value="1" onValueChange={() => {}} {...extra} />,
    );
    expect(selectClear()).toBeInTheDocument();
  });

  it('mode="multiple": no ✕ by default, one with allowClear', () => {
    const { rerender } = renderWithUi(
      <Select mode="multiple" aria-label="種別" options={OPTIONS} defaultValue={["1", "2"]} />,
    );
    expect(selectClear()).toBeNull();
    rerender(
      <Select
        mode="multiple"
        aria-label="種別"
        options={OPTIONS}
        defaultValue={["1", "2"]}
        allowClear
      />,
    );
    expect(selectClear()).toBeInTheDocument();
  });
});

describe("TreeSelect — allowClear defaults to false (antd)", () => {
  it("no ✕ by default, one with allowClear", () => {
    const { rerender } = renderWithUi(
      <TreeSelect treeData={TREE} aria-label="部署" value="fe" onValueChange={() => {}} />,
    );
    expect(selectClear()).toBeNull();
    rerender(
      <TreeSelect
        treeData={TREE}
        aria-label="部署"
        value="fe"
        onValueChange={() => {}}
        allowClear
      />,
    );
    expect(selectClear()).toBeInTheDocument();
  });
});

describe("pickers whose antd default is ON keep it", () => {
  it("Cascader shows the ✕ by default; allowClear={false} removes it", () => {
    const { rerender } = renderWithUi(
      <Cascader options={REGION_OPTIONS} aria-label="地域" defaultValue={["vn", "hcm", "q1"]} />,
    );
    expect(selectClear()).toBeInTheDocument();
    rerender(
      <Cascader
        options={REGION_OPTIONS}
        aria-label="地域"
        defaultValue={["vn", "hcm", "q1"]}
        allowClear={false}
      />,
    );
    expect(selectClear()).toBeNull();
  });

  it("DatePicker shows the ✕ by default", () => {
    renderWithUi(<DatePicker defaultValue={new Date(2026, 5, 15)} />);
    expect(screen.getByRole("button", { name: "Xóa" })).toBeInTheDocument();
  });

  it("TimePicker shows the ✕ by default", () => {
    renderWithUi(<TimePicker defaultValue="09:30" />);
    expect(screen.getByRole("button", { name: "Xóa" })).toBeInTheDocument();
  });
});
