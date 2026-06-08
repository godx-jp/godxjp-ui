import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "../menubar";
import { expectNoA11yViolations } from "@/test/a11y";

function Demo(props: { onSelect?: () => void }) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>ファイル</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={props.onSelect}>新規作成</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>開く</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>編集</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>取り消し</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

describe("Menubar", () => {
  it("renders a menubar with top-level triggers", () => {
    render(<Demo />);
    expect(screen.getByRole("menubar")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "ファイル" })).toBeInTheDocument();
  });

  it("opening a menu reveals its items", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("menuitem", { name: "ファイル" }));
    expect(screen.getByRole("menuitem", { name: "新規作成" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "開く" })).toBeInTheDocument();
  });

  it("selecting an item fires onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Demo onSelect={onSelect} />);
    await user.click(screen.getByRole("menuitem", { name: "ファイル" }));
    await user.click(screen.getByRole("menuitem", { name: "新規作成" }));
    expect(onSelect).toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<Demo />);
  });
});
