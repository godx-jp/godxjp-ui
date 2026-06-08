import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../context-menu";

function Demo(props: {
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  value?: string;
  onValueChange?: (v: string) => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div data-testid="surface">右クリック領域</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>操作</ContextMenuLabel>
        <ContextMenuCheckboxItem checked={props.checked} onCheckedChange={props.onCheckedChange}>
          ブックマーク
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value={props.value ?? "list"} onValueChange={props.onValueChange}>
          <ContextMenuRadioItem value="list">リスト</ContextMenuRadioItem>
          <ContextMenuRadioItem value="grid">グリッド</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuItem inset>
          コピー
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>共有</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>メールで共有</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}

const open = () => fireEvent.contextMenu(screen.getByTestId("surface"));

describe("ContextMenu — full item surface", () => {
  it("renders label, checkbox, radios, shortcut and inset items when open", () => {
    render(<Demo />);
    open();
    expect(screen.getByText("操作")).toBeInTheDocument();
    expect(screen.getByRole("menuitemcheckbox", { name: "ブックマーク" })).toBeInTheDocument();
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(2);
    expect(screen.getByText("⌘C")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /コピー/ })).toBeInTheDocument();
  });

  it("toggling the checkbox item fires onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Demo checked={false} onCheckedChange={onCheckedChange} />);
    open();
    await user.click(screen.getByRole("menuitemcheckbox", { name: "ブックマーク" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("a checked checkbox item reports aria-checked=true", () => {
    render(<Demo checked />);
    open();
    expect(screen.getByRole("menuitemcheckbox", { name: "ブックマーク" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("choosing a radio item fires onValueChange with its value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo onValueChange={onValueChange} />);
    open();
    await user.click(screen.getByRole("menuitemradio", { name: "グリッド" }));
    expect(onValueChange).toHaveBeenCalledWith("grid");
  });

  it("opening the submenu reveals its nested item", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    open();
    await user.click(screen.getByRole("menuitem", { name: /共有/ }));
    expect(await screen.findByRole("menuitem", { name: "メールで共有" })).toBeInTheDocument();
  });
});
