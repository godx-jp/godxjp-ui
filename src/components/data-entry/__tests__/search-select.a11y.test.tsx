import { describe, it } from "vitest";

import { SearchSelect } from "../search-select";
import { Label } from "../label";
import { expectNoA11yViolations } from "@/test/a11y";

describe("SearchSelect a11y", () => {
  it("has no axe violations (closed combobox trigger, associated Label)", async () => {
    await expectNoA11yViolations(
      <>
        <Label htmlFor="account">勘定科目</Label>
        <SearchSelect
          id="account"
          value=""
          onValueChange={() => undefined}
          options={[
            { value: "1", label: "現金", group: "資産" },
            { value: "2", label: "普通預金", group: "資産" },
            { value: "3", label: "売上", group: "収益" },
          ]}
        />
      </>,
    );
  });

  it("has no axe violations (selected value, clearable)", async () => {
    await expectNoA11yViolations(
      <>
        <Label htmlFor="acc2">科目</Label>
        <SearchSelect
          id="acc2"
          value="2"
          onValueChange={() => undefined}
          clearable
          options={[
            { value: "1", label: "現金" },
            { value: "2", label: "普通預金" },
          ]}
        />
      </>,
    );
  });

  it("has no axe violations (disabled)", async () => {
    await expectNoA11yViolations(
      <>
        <Label htmlFor="acc3">科目</Label>
        <SearchSelect
          id="acc3"
          value="1"
          onValueChange={() => undefined}
          disabled
          options={[{ value: "1", label: "現金" }]}
        />
      </>,
    );
  });
});
