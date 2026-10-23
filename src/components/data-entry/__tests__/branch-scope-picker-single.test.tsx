import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { BranchScopePicker } from "../branch-scope-picker";

const branches = [
  { id: "all", name: "Tokyo" },
  { id: "b", name: "Osaka" },
];

describe("BranchScopePicker single navigation scope (#1389)", () => {
  it("offers one compact branch control instead of subset radios", () => {
    renderWithUi(<BranchScopePicker branches={branches} selectionMode="single" />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });
  it("hides a settled single-branch scope without emitting a change", () => {
    const onValueChange = vi.fn();
    const { container } = renderWithUi(
      <BranchScopePicker
        branches={branches.slice(0, 1)}
        selectionMode="single"
        hideWhenSingle
        onValueChange={onValueChange}
      />,
    );
    expect(container.querySelector('[data-slot="branch-scope-picker"]')).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
  });
  it("disallows All in record fields and commits exactly one concrete id", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <BranchScopePicker
        branches={branches}
        selectionMode="single"
        allowAll={false}
        allLabel="Every branch"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("option", { name: "Every branch" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Tokyo" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ mode: "selected", branchIds: ["all"] });
  });
});

describe("BranchScopePicker single state contract", () => {
  it("searches by keyboard, commits one id, then returns to All", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <BranchScopePicker
        branches={branches}
        selectionMode="single"
        allLabel="Every branch"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const search = screen.getByPlaceholderText("Tìm chi nhánh");
    await user.type(search, "Osaka");
    expect(search).toHaveValue("Osaka");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith({ mode: "selected", branchIds: ["b"] });
    expect(screen.getByRole("combobox")).toHaveTextContent("Osaka");
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Every branch" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ mode: "all" });
  });
  it("mirrors controlled changes and keeps the parent's value until it changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = renderWithUi(
      <BranchScopePicker
        branches={branches}
        selectionMode="single"
        value={{ mode: "all" }}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Osaka" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ mode: "selected", branchIds: ["b"] });
    expect(screen.getByRole("combobox")).not.toHaveTextContent("Osaka");
    rerender(
      <BranchScopePicker
        branches={branches}
        selectionMode="single"
        value={{ mode: "selected", branchIds: ["b"] }}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Osaka");
  });
  it.each(["disabled", "readOnly"] as const)("honors %s without opening", async (state) => {
    const user = userEvent.setup();
    renderWithUi(
      <BranchScopePicker
        branches={branches}
        selectionMode="single"
        defaultValue={{ mode: "selected", branchIds: ["b"] }}
        {...{ [state]: true }}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveTextContent("Osaka");
    expect(screen.queryByRole("option")).toBeNull();
  });
  it("does not hide loading, collection failures, or validation", () => {
    const one = branches.slice(0, 1);
    const { rerender } = renderWithUi(
      <BranchScopePicker branches={one} selectionMode="single" hideWhenSingle loading />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<BranchScopePicker branches={one} selectionMode="single" hideWhenSingle listError />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(
      <BranchScopePicker
        branches={one}
        selectionMode="single"
        hideWhenSingle
        error="Required"
        id="branch"
        aria-describedby="help"
      />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-errormessage", "branch-error");
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-describedby", "help");
  });
  it("omits All from the legacy multiple editor too", () => {
    renderWithUi(
      <BranchScopePicker branches={branches} allowAll={false} allLabel="Every branch" />,
    );
    expect(screen.queryByRole("radio", { name: "Every branch" })).toBeNull();
    expect(screen.getByRole("checkbox", { name: "Tokyo" })).toBeInTheDocument();
  });
});
