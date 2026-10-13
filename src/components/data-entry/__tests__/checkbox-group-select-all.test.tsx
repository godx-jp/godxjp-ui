import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { AppProvider } from "@/app/app-provider";
import { render, renderWithUi, screen, userEvent } from "@/test/render";

import { CheckboxGroup } from "../checkbox-group";

/**
 * gh#1245 — `CheckboxGroup selectAll`: a leading select-all box whose state is DERIVED from the
 * group value (true / mixed / false), and a muted "{n} of {m} selected" count.
 *
 * The rules pinned here are the ones a screenshot cannot show: the mixed state is the ACCESSIBLE
 * state (`toBePartiallyChecked` reads the native input's `indeterminate`, which is how a real
 * checkbox exposes `aria-checked="mixed"`), one click is ONE `onValueChange`, and a disabled option
 * is outside the bulk path in both directions — the antd / DataTable locked-row rule.
 */
const options = [
  { label: "Invoice", value: "invoice" },
  { label: "Packing list", value: "packing" },
  { label: "MSDS", value: "msds" },
  { label: "Certificate", value: "cert", disabled: true },
];

function renderEn(ui: React.ReactElement) {
  return render(
    <AppProvider persist={false} defaultLocale="en" fallbackLocale="en">
      {ui}
    </AppProvider>,
  );
}

describe("CheckboxGroup selectAll (gh#1245)", () => {
  it("is mixed on a partial selection, and the count reads n of m over the enabled options", () => {
    renderEn(
      <CheckboxGroup aria-label="Docs" options={options} defaultValue={["invoice"]} selectAll />,
    );
    const all = screen.getByRole("checkbox", { name: "Select all" });
    expect(all).toBePartiallyChecked();
    expect(all).not.toBeChecked();
    // The disabled option is not part of the set the box controls, so the total is 3, not 4.
    expect(screen.getByText("1 of 3 selected")).toBeInTheDocument();
  });

  it("from mixed selects every enabled value in ONE onValueChange, then clears in one more", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderEn(
      <CheckboxGroup
        aria-label="Docs"
        options={options}
        defaultValue={["invoice"]}
        onValueChange={onValueChange}
        selectAll
      />,
    );
    const all = screen.getByRole("checkbox", { name: "Select all" });

    await user.click(all);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect([...onValueChange.mock.calls[0][0]].sort()).toEqual(["invoice", "msds", "packing"]);
    expect(all).toBeChecked();
    expect(all).not.toBePartiallyChecked();
    for (const name of ["Invoice", "Packing list", "MSDS"]) {
      expect(screen.getByRole("checkbox", { name })).toBeChecked();
    }
    expect(screen.getByRole("checkbox", { name: "Certificate" })).not.toBeChecked();
    expect(screen.getByText("3 of 3 selected")).toBeInTheDocument();

    await user.click(all);
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(all).not.toBeChecked();
    expect(all).not.toBePartiallyChecked();
    expect(screen.getByText("0 of 3 selected")).toBeInTheDocument();
  });

  it("leaves a disabled option exactly as it is when selecting all and when clearing", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderEn(
      <CheckboxGroup
        aria-label="Docs"
        options={options}
        defaultValue={["cert"]}
        onValueChange={onValueChange}
        selectAll
      />,
    );
    const all = screen.getByRole("checkbox", { name: "Select all" });
    // A checked disabled option alone is not a partial selection of what the box controls.
    expect(all).not.toBeChecked();
    expect(all).not.toBePartiallyChecked();

    await user.click(all);
    expect([...onValueChange.mock.calls[0][0]].sort()).toEqual([
      "cert",
      "invoice",
      "msds",
      "packing",
    ]);
    await user.click(all);
    expect(onValueChange).toHaveBeenLastCalledWith(["cert"]);
    expect(screen.getByRole("checkbox", { name: "Certificate" })).toBeChecked();
  });

  it("follows a controlled value and takes a custom label", () => {
    const { rerender } = renderEn(
      <CheckboxGroup
        aria-label="Docs"
        options={options}
        value={[]}
        selectAll={{ label: "All documents" }}
      />,
    );
    const all = screen.getByRole("checkbox", { name: "All documents" });
    expect(all).not.toBeChecked();
    rerender(
      <AppProvider persist={false} defaultLocale="en" fallbackLocale="en">
        <CheckboxGroup
          aria-label="Docs"
          options={options}
          value={["invoice", "packing", "msds"]}
          selectAll={{ label: "All documents" }}
        />
      </AppProvider>,
    );
    expect(screen.getByRole("checkbox", { name: "All documents" })).toBeChecked();
  });

  it("does not submit a value of its own, and is absent without the prop", () => {
    const { unmount } = renderWithUi(
      <CheckboxGroup aria-label="Docs" name="docs" options={options} selectAll />,
    );
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes).toHaveLength(5);
    // The select-all box is not a form value: no name, so a native submit never carries it.
    expect(boxes[0]).not.toHaveAttribute("name");
    unmount();
    renderWithUi(<CheckboxGroup aria-label="Docs" name="docs" options={options} />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(4);
  });

  it("is disabled with the group", () => {
    renderEn(<CheckboxGroup aria-label="Docs" options={options} disabled selectAll />);
    expect(screen.getByRole("checkbox", { name: "Select all" })).toBeDisabled();
  });

  it("formats the count with Intl.NumberFormat in the active locale (ja)", () => {
    // 1,200 so the total needs a group separator; a sub-1,000 count would pass with String(n).
    const many = Array.from({ length: 1200 }, (_, i) => ({ label: `#${i}`, value: String(i) }));
    render(
      <AppProvider persist={false} defaultLocale="ja" fallbackLocale="en">
        <CheckboxGroup
          id="many"
          aria-label="多数"
          options={many}
          defaultValue={["0", "1"]}
          selectAll
        />
      </AppProvider>,
    );
    const total = new Intl.NumberFormat("ja").format(1200);
    expect(total).toBe("1,200");
    expect(screen.getByText(`${total} 件中 2 件選択`)).toBeInTheDocument();
    expect(screen.getByText("すべて選択")).toBeInTheDocument();
    // Addressed by id, not getByRole / getByLabelText: both resolve the name of every one of the
    // 1,201 boxes, measured at ~28s for 480 in jsdom — the cost is the query's, not the component's.
    expect(document.getElementById("many-select-all")).toBePartiallyChecked();
  });
});
