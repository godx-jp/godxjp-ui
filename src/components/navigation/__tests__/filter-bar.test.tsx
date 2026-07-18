import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Toolbar, ToolbarGroup } from "../filter-bar";

describe("Toolbar", () => {
  it("renders a labelled toolbar with its children", () => {
    renderWithUi(
      <Toolbar>
        <span>child</span>
      </Toolbar>,
    );
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("shows the clear button when onClear + active filters, and fires it", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    renderWithUi(
      <Toolbar onClear={onClear} hasActiveFilters>
        <span />
      </Toolbar>,
    );
    const clear = screen.getByRole("button");
    await user.click(clear);
    expect(onClear).toHaveBeenCalled();
  });

  it("hides the clear button when there are no active filters", () => {
    renderWithUi(
      <Toolbar onClear={vi.fn()} hasActiveFilters={false}>
        <span />
      </Toolbar>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("hides the clear button when no onClear is given", () => {
    renderWithUi(
      <Toolbar hasActiveFilters>
        <span />
      </Toolbar>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("is not pinned by default", () => {
    renderWithUi(
      <Toolbar>
        <span />
      </Toolbar>,
    );
    expect(screen.getByRole("toolbar")).not.toHaveClass("ui-toolbar-sticky");
  });

  it("adds the sticky class when sticky is set (#197)", () => {
    renderWithUi(
      <Toolbar sticky>
        <span />
      </Toolbar>,
    );
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveClass("ui-toolbar");
    expect(toolbar).toHaveClass("ui-toolbar-sticky");
  });

  it("keeps a caller className alongside the sticky class", () => {
    renderWithUi(
      <Toolbar sticky className="custom-strip">
        <span />
      </Toolbar>,
    );
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveClass("ui-toolbar-sticky");
    expect(toolbar).toHaveClass("custom-strip");
  });
});

describe("ToolbarGroup", () => {
  it("wires aria-labelledby + a label node when label is provided", () => {
    renderWithUi(
      <ToolbarGroup label="ステータス">
        <span>filters</span>
      </ToolbarGroup>,
    );
    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("aria-labelledby");
    expect(screen.getByText("ステータス")).toBeInTheDocument();
  });

  it("omits the label wiring when no label is given", () => {
    renderWithUi(
      <ToolbarGroup label={undefined}>
        <span>only filters</span>
      </ToolbarGroup>,
    );
    const group = screen.getByRole("group");
    expect(group).not.toHaveAttribute("aria-labelledby");
    expect(group.querySelector(".ui-toolbar-label")).toBeNull();
  });
});
