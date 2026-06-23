import { describe, expect, it } from "vitest";

import { Cascader, type TreeOption } from "../cascader";
import { Label } from "../label";
import { renderWithUi } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

// A multi-level path picker whose trigger is a role="combobox" button. A combobox
// takes its name "from author" (not from its text content), so it must be named via
// a real <Label htmlFor> bound to the trigger id.
const REGIONS: TreeOption[] = [
  {
    value: "vn",
    label: "ベトナム",
    children: [
      {
        value: "hcm",
        label: "ホーチミン",
        children: [
          { value: "q1", label: "1区" },
          { value: "q3", label: "3区" },
        ],
      },
    ],
  },
  {
    value: "jp",
    label: "日本",
    children: [
      {
        value: "osaka",
        label: "大阪",
        children: [{ value: "namba", label: "難波" }],
      },
    ],
  },
];

describe("Cascader a11y", () => {
  it("exposes the combobox role with the accessible name from its bound label", () => {
    const { getByRole } = renderWithUi(
      <>
        <Label htmlFor="region">地域</Label>
        <Cascader id="region" options={REGIONS} placeholder="地域を選択..." />
      </>,
    );
    expect(getByRole("combobox", { name: "地域" })).toBeInTheDocument();
  });

  it("has no axe violations (single, labelled, with value)", async () => {
    await expectNoA11yViolations(
      <>
        <Label htmlFor="region">地域</Label>
        <Cascader
          id="region"
          options={REGIONS}
          defaultValue={["vn", "hcm", "q1"]}
          showSearch
          placeholder="地域を選択..."
        />
      </>,
    );
  });

  it("has no axe violations (multiple selection)", async () => {
    await expectNoA11yViolations(
      <>
        <Label htmlFor="regions">複数地域</Label>
        <Cascader
          id="regions"
          options={REGIONS}
          multiple
          defaultValue={[["vn", "hcm", "q1"]]}
          showSearch
          placeholder="地域を選択..."
        />
      </>,
    );
  });

  it("has no axe violations (disabled)", async () => {
    await expectNoA11yViolations(
      <>
        <Label htmlFor="region-disabled">地域</Label>
        <Cascader id="region-disabled" options={REGIONS} disabled placeholder="地域を選択..." />
      </>,
    );
  });
});
