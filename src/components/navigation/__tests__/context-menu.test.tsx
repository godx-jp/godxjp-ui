import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../context-menu";
import { expectNoA11yViolations } from "@/test/a11y";

function Demo(props: { onSelect?: () => void }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div data-testid="surface">右クリック領域</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>操作</ContextMenuLabel>
        <ContextMenuItem onSelect={props.onSelect}>編集</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">削除</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

describe("ContextMenu", () => {
  it("is closed until the surface is right-clicked", () => {
    render(<Demo />);
    expect(screen.queryByRole("menuitem", { name: "編集" })).toBeNull();
  });

  it("opens on contextmenu (right-click) and shows its items", () => {
    render(<Demo />);
    fireEvent.contextMenu(screen.getByTestId("surface"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "編集" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "削除" })).toBeInTheDocument();
  });

  it("selecting an item fires onSelect and closes the menu", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Demo onSelect={onSelect} />);
    fireEvent.contextMenu(screen.getByTestId("surface"));
    await user.click(screen.getByRole("menuitem", { name: "編集" }));
    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("has no axe violations when open", async () => {
    const { container } = render(<Demo />);
    fireEvent.contextMenu(screen.getByTestId("surface"));
    // axe over the whole document (menu is portalled)
    await expectNoA11yViolations(<Demo />);
    expect(container).toBeTruthy();
  });
});
