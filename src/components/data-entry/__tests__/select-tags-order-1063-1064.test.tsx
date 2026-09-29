import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";
import { FormField } from "../form-field";
import { Select } from "../select";

/*
 * Select mode="tags" — never inert for want of options (gh#1063), and while text is typed the
 * create row / exact match is the FIRST and ACTIVE row, never a picked tag (gh#1064).
 */

const createRow = () => document.querySelector('[data-slot="select-create"]');
const listRows = () => within(screen.getByRole("listbox")).getAllByRole("option");
const activeRow = () => {
  const id = screen.getByRole("textbox").getAttribute("aria-activedescendant");
  return id ? document.getElementById(id) : null;
};

/** godx-task #395's TagPicker shape: controlled value AND search, server-filtered rows. */
function ConsumerTagPicker({
  options = [],
  initial = [],
  onValueChange,
  ...extra
}: {
  options?: { value: string; label: string }[];
  initial?: string[];
  onValueChange?: (next: string[]) => void;
} & Record<string, unknown>) {
  const [value, setValue] = React.useState<string[]>(initial);
  const [search, setSearch] = React.useState("");
  return (
    <Select
      aria-label="タグ"
      mode="tags"
      options={options}
      value={value}
      onValueChange={(next: string[]) => {
        setValue(next);
        onValueChange?.(next);
      }}
      filterOption={() => true}
      search={search}
      onSearchChange={setSearch}
      tokenSeparators={[",", "、"]}
      maxCount={20}
      loading={false}
      disabled={false}
      placeholder="Add tags"
      {...extra}
    />
  );
}

describe("gh#1063 — a tags Select is never disabled for having no options", () => {
  it('`<Select mode="tags" />` with no `options` prop at all is a working tags field (antd\'s canonical call)', async () => {
    const onValueChange = vi.fn();
    renderWithUi(<Select aria-label="タグ" mode="tags" onValueChange={onValueChange} />);
    const combobox = screen.getByRole("combobox");
    expect(combobox).not.toHaveAttribute("aria-disabled");
    const user = userEvent.setup();
    await user.click(combobox);
    await user.type(screen.getByRole("textbox"), "ci");
    await waitFor(() => expect(createRow()).not.toBeNull());
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith(["ci"], expect.anything());
  });

  it("inside a FormField, with no `options` prop", () => {
    renderWithUi(
      <FormField label="タグ">
        <Select mode="tags" />
      </FormField>,
    );
    expect(screen.getByRole("combobox", { name: "タグ" })).not.toHaveAttribute("aria-disabled");
  });

  it("the consumer's controlled shape with `options={[]}` takes the first tag", async () => {
    const onValueChange = vi.fn();
    renderWithUi(<ConsumerTagPicker onValueChange={onValueChange} />);
    const combobox = screen.getByRole("combobox");
    expect(combobox).not.toHaveAttribute("aria-disabled");
    const user = userEvent.setup();
    await user.click(combobox);
    await user.type(screen.getByRole("textbox"), "ci");
    await waitFor(() => expect(createRow()).not.toBeNull());
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["ci"]);
  });

  it("an explicit `disabled` still disables it", () => {
    renderWithUi(<Select aria-label="タグ" mode="tags" options={[]} disabled />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-disabled", "true");
  });
});

const TAGS = [
  { value: "bug", label: "bug" },
  { value: "feature", label: "feature" },
  { value: "CI", label: "CI" },
  { value: "docs", label: "docs" },
];

describe("gh#1064 — typed text puts the create row / exact match first and active", () => {
  it("picked FREE-TEXT tags never precede the create row; Enter creates and keeps them picked", async () => {
    const onValueChange = vi.fn();
    renderWithUi(<ConsumerTagPicker initial={["alpha", "beta"]} onValueChange={onValueChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "ci");
    await waitFor(() => expect(createRow()).not.toBeNull());
    await waitFor(() => expect(listRows()[0]).toContainElement(createRow() as HTMLElement));
    expect(activeRow()).toBe(listRows()[0]);
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["alpha", "beta", "ci"]);
  });

  it("picked tags the SERVER still returns sit after the create row (consumer's server-filtered rows)", async () => {
    const onValueChange = vi.fn();
    // `filterOption={() => true}` keeps every row, as a server-filtered list does.
    renderWithUi(
      <ConsumerTagPicker
        options={TAGS}
        initial={["bug", "feature"]}
        onValueChange={onValueChange}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "ci2");
    await waitFor(() => expect(createRow()).not.toBeNull());
    await waitFor(() => expect(listRows()[0]).toContainElement(createRow() as HTMLElement));
    expect(activeRow()).toBe(listRows()[0]);
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["bug", "feature", "ci2"]);
  });

  it("a consumer-supplied first row stays first and active — picked tags are appended, not prepended", async () => {
    const onValueChange = vi.fn();
    // godx-task's 31.7 stopgap: its own create row as the first option, kit creation off.
    renderWithUi(
      <ConsumerTagPicker
        options={[{ value: "new:a", label: "Create a" }]}
        initial={["alpha"]}
        allowCreate={false}
        onValueChange={onValueChange}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "a");
    await waitFor(() =>
      expect(listRows().map((row) => row.textContent?.trim())).toEqual(["Create a", "alpha"]),
    );
    expect(activeRow()).toBe(listRows()[0]);
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["alpha", "new:a"]);
  });

  it("an exact (case-folded) match of an UNPICKED option is first and active, ahead of picked tags", async () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="タグ"
        mode="tags"
        options={[
          { value: "circle", label: "circle" },
          { value: "CI", label: "CI" },
        ]}
        defaultValue={["alpha", "beta"]}
        onValueChange={onValueChange}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "ci");
    await waitFor(() => expect(listRows()[0]).toHaveTextContent("CI"));
    expect(createRow()).toBeNull();
    expect(activeRow()).toBe(listRows()[0]);
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["alpha", "beta", "CI"], expect.anything());
  });

  it("picked tags that do not match the typed text are filtered out, as rc-select filters its tag rows", async () => {
    renderWithUi(<Select aria-label="タグ" mode="tags" defaultValue={["alpha", "beta"]} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "alp");
    await waitFor(() => expect(createRow()).not.toBeNull());
    await waitFor(() =>
      expect(listRows().map((row) => row.textContent)).toEqual([
        expect.stringMatching(/alp/),
        expect.stringMatching(/alpha/),
      ]),
    );
  });

  it("with nothing typed, the picked free-text tags are still listed (after the options) so they can be toggled", async () => {
    renderWithUi(
      <Select
        aria-label="タグ"
        mode="tags"
        options={[{ value: "bug", label: "bug" }]}
        defaultValue={["alpha"]}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await waitFor(() =>
      expect(listRows().map((row) => row.textContent?.trim())).toEqual([
        expect.stringMatching(/bug/),
        expect.stringMatching(/alpha/),
      ]),
    );
  });
});
