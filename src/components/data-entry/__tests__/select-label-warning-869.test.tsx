import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { FormField } from "../form-field";
import { Flex } from "../../layout/flex";
import { AppSettingPicker } from "../../navigation/app-setting-picker";

/*
 * gh#869 — react-aria's `useLabel` warns once per render when the Select ROOT has neither
 * `aria-label` nor `aria-labelledby`, even though the TRIGGER is named correctly.
 *
 * This file is a MATRIX, not a single case: the warning depends on WHERE the name comes from, and
 * the two paths that name the trigger without ever touching the root are the two that warned.
 */

const OPTIONS = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

let warn: MockInstance<typeof console.warn>;

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
});

function labelWarnings() {
  return warn.mock.calls.filter((call) => /visible label/.test(String(call[0]))).length;
}

describe("gh#869 — the Select root must never trigger react-aria's missing-label warning", () => {
  it("names the trigger from the placeholder without warning (table-crud-list)", () => {
    renderWithUi(<Select options={OPTIONS} placeholder="部署" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-label", "部署");
    expect(labelWarnings()).toBe(0);
  });

  it("names the trigger from a nested FormField label without warning (caimono)", () => {
    renderWithUi(
      <FormField label="Sắp xếp">
        <Flex>
          <Select options={OPTIONS} />
        </Flex>
      </FormField>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-labelledby")).toBeTruthy();
    expect(labelWarnings()).toBe(0);
  });

  it("names the compound trigger from a nested FormField label without warning", () => {
    renderWithUi(
      <FormField label="Sắp xếp">
        <Flex>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">A</SelectItem>
            </SelectContent>
          </Select>
        </Flex>
      </FormField>,
    );
    expect(screen.getByRole("combobox").getAttribute("aria-labelledby")).toBeTruthy();
    expect(labelWarnings()).toBe(0);
  });

  it("names the AppSettingPicker trigger without warning (caimono)", () => {
    renderWithUi(<AppSettingPicker kind="locale" appearance="icon" />);
    expect(screen.getByRole("combobox").getAttribute("aria-label")).toBeTruthy();
    expect(labelWarnings()).toBe(0);
  });

  it("stays quiet on the paths that already reached the root", () => {
    renderWithUi(
      <>
        <Select options={OPTIONS} aria-label="Ngôn ngữ" />
        <FormField label="Giao nội địa tới">
          <Select options={OPTIONS} />
        </FormField>
      </>,
    );
    expect(labelWarnings()).toBe(0);
  });
});
