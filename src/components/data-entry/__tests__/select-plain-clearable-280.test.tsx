import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUi } from "@/test/render";

import { Select } from "../select";

/**
 * gh#280 — the PLAIN (non-searchable) Select branch used to drop `clearable`
 * entirely: no clear affordance ever rendered despite the documented
 * default-true contract (the searchable branch got it from SearchSelect).
 * Clearing emits `onValueChange("", undefined)` so Radix shows the placeholder.
 */

const options = [
  { value: "10", label: "営業部" },
  { value: "20", label: "技術部" },
];

describe("plain Select clearable (gh#280)", () => {
  it("shows the X clear affordance while a controlled value is selected (default on)", async () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        id="dept"
        aria-label="所属"
        data-testid="dept"
        value="10"
        onValueChange={onValueChange}
        options={options}
      />,
    );

    const clear = screen.getByTestId("dept-clear");
    await userEvent.click(clear);
    expect(onValueChange).toHaveBeenCalledWith("", undefined);
  });

  it("hides the affordance when nothing is selected, and with clearable={false}", () => {
    const { rerender } = renderWithUi(
      <Select
        id="dept"
        aria-label="所属"
        data-testid="dept"
        value=""
        onValueChange={() => {}}
        options={options}
      />,
    );
    expect(screen.queryByTestId("dept-clear")).not.toBeInTheDocument();

    rerender(
      <Select
        id="dept"
        aria-label="所属"
        data-testid="dept"
        value="10"
        clearable={false}
        onValueChange={() => {}}
        options={options}
      />,
    );
    expect(screen.queryByTestId("dept-clear")).not.toBeInTheDocument();
  });

  it("never renders the affordance for disabled or uncontrolled selects", () => {
    const { rerender } = renderWithUi(
      <Select
        id="dept"
        aria-label="所属"
        data-testid="dept"
        value="10"
        disabled
        onValueChange={() => {}}
        options={options}
      />,
    );
    expect(screen.queryByTestId("dept-clear")).not.toBeInTheDocument();

    rerender(
      <Select id="dept" aria-label="所属" data-testid="dept" defaultValue="10" options={options} />,
    );
    expect(screen.queryByTestId("dept-clear")).not.toBeInTheDocument();
  });
});
