import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "../menubar";

function Demo(props: {
  onCheckedChange?: (v: boolean) => void;
  onValueChange?: (v: string) => void;
  checked?: boolean;
  density?: string;
}) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>表示</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>表示オプション</MenubarLabel>
          <MenubarCheckboxItem checked={props.checked} onCheckedChange={props.onCheckedChange}>
            グリッド線
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup
            value={props.density ?? "comfortable"}
            onValueChange={props.onValueChange}
          >
            <MenubarRadioItem value="comfortable">広め</MenubarRadioItem>
            <MenubarRadioItem value="compact">狭め</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem inset>
            保存
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>詳細</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>サブ項目</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

const openMenu = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("menuitem", { name: "表示" }));

describe("Menubar — full item surface", () => {
  it("renders label, checkbox, radio, shortcut and inset items when open", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await openMenu(user);
    expect(screen.getByText("表示オプション")).toBeInTheDocument();
    expect(screen.getByRole("menuitemcheckbox", { name: "グリッド線" })).toBeInTheDocument();
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(2);
    expect(screen.getByText("⌘S")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /保存/ })).toBeInTheDocument();
  });

  it("toggling the checkbox item fires onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Demo checked={false} onCheckedChange={onCheckedChange} />);
    await openMenu(user);
    await user.click(screen.getByRole("menuitemcheckbox", { name: "グリッド線" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("a checked checkbox item reports aria-checked=true", async () => {
    const user = userEvent.setup();
    render(<Demo checked />);
    await openMenu(user);
    expect(screen.getByRole("menuitemcheckbox", { name: "グリッド線" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("choosing a radio item fires onValueChange with its value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo onValueChange={onValueChange} />);
    await openMenu(user);
    await user.click(screen.getByRole("menuitemradio", { name: "狭め" }));
    expect(onValueChange).toHaveBeenCalledWith("compact");
  });

  it("opening the submenu reveals its nested item", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: /詳細/ }));
    expect(await screen.findByRole("menuitem", { name: "サブ項目" })).toBeInTheDocument();
  });
});
