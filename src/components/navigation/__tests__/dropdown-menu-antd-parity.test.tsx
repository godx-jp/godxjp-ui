import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Button } from "../../general/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

/** Ant Design 6.6.2 parity, read off `antd/es/dropdown/dropdown.d.ts` (DropdownProps). */
function open(placementProps: React.ComponentProps<typeof DropdownMenuContent> = {}) {
  return renderWithUi(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button type="button">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...placementProps}>
        <DropdownMenuItem>Xuất CSV</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

describe("DropdownMenu — antd `placement`", () => {
  it("resolves an antd anchor into the Radix side + align it is made of", () => {
    open({ placement: "topEnd" });
    const content = screen.getByRole("menu").closest('[data-slot="dropdown-menu-content"]');
    expect(content).toHaveAttribute("data-side", "top");
    expect(content).toHaveAttribute("data-align", "end");
  });

  it("centres on the bare block anchors", () => {
    open({ placement: "bottom" });
    const content = screen.getByRole("menu").closest('[data-slot="dropdown-menu-content"]');
    expect(content).toHaveAttribute("data-side", "bottom");
    expect(content).toHaveAttribute("data-align", "center");
  });

  it("lets an explicitly passed Radix `side` win, so the two APIs can be mixed", () => {
    open({ placement: "topStart", side: "bottom" });
    const content = screen.getByRole("menu").closest('[data-slot="dropdown-menu-content"]');
    expect(content).toHaveAttribute("data-side", "bottom");
    // …while the half the caller did NOT override still comes from the antd anchor.
    expect(content).toHaveAttribute("data-align", "start");
  });

  it("changes nothing when it is not passed", () => {
    open();
    expect(screen.getByRole("menu").closest('[data-slot="dropdown-menu-content"]')).toHaveAttribute(
      "data-side",
      "bottom",
    );
  });
});

describe("DropdownMenu — antd `arrow`", () => {
  it("is off by default", () => {
    const { container } = open();
    expect(container.ownerDocument.querySelector('[data-slot="dropdown-menu-arrow"]')).toBeNull();
  });

  it("paints the pointer when asked", () => {
    const { container } = open({ arrow: true });
    const arrow = container.ownerDocument.querySelector('[data-slot="dropdown-menu-arrow"]');
    expect(arrow).not.toBeNull();
    // Decorative: it must never enter the accessible tree of the menu.
    expect(arrow).toHaveAttribute("aria-hidden", "true");
    expect(arrow?.tagName.toLowerCase()).toBe("svg");
  });
});

// The remaining antd Dropdown surface is already carried by the Radix primitives this component
// wraps; these lock that in so a future refactor cannot quietly drop it.
describe("DropdownMenu — the antd surface Radix already provides", () => {
  it("antd `open` / `onOpenChange` are the Root's controlled pair", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <DropdownMenu open onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button type="button">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Xuất CSV</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("antd `disabled` is the Trigger's own disabled state", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DropdownMenu>
        <DropdownMenuTrigger disabled>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Xuất CSV</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("antd `menu.selectable` + `selectedKeys` are the radio group", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button type="button">Sort</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="new" onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="new">Mới nhất</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="old">Cũ nhất</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByRole("menuitemradio", { name: "Mới nhất" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await user.click(screen.getByRole("menuitemradio", { name: "Cũ nhất" }));
    expect(onValueChange).toHaveBeenCalledWith("old");
  });
});
