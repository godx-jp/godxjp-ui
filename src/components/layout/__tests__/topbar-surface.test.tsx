import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Topbar } from "../topbar";

describe("Topbar — product/project switcher", () => {
  it("a menuless product chip calls onProductOpen and shows the initial", async () => {
    const user = userEvent.setup();
    const onProductOpen = vi.fn();
    render(<Topbar product={{ name: "CoreBooks" }} onProductOpen={onProductOpen} />);
    expect(screen.getByText("C")).toBeInTheDocument(); // uppercased initial
    await user.click(screen.getByRole("button", { name: "CoreBooks" }));
    expect(onProductOpen).toHaveBeenCalled();
  });

  it("a product chip with a menu defers to the dropdown (no onProductOpen)", async () => {
    const user = userEvent.setup();
    const onProductOpen = vi.fn();
    render(
      <Topbar
        product={{ name: "CoreBooks" }}
        productMenu={<div data-testid="pm">menu</div>}
        onProductOpen={onProductOpen}
      />,
    );
    await user.click(screen.getByRole("button", { name: "CoreBooks" }));
    expect(onProductOpen).not.toHaveBeenCalled();
  });

  it("renders a named project chip + separator and calls onProjectOpen", async () => {
    const user = userEvent.setup();
    const onProjectOpen = vi.fn();
    render(
      <Topbar
        product={{ name: "P" }}
        project={{ name: "Q1 決算" }}
        onProjectOpen={onProjectOpen}
      />,
    );
    expect(screen.getByText("/")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Q1 決算" }));
    expect(onProjectOpen).toHaveBeenCalled();
  });

  it("omits the project chip + separator when there is no project or project menu", () => {
    render(<Topbar product={{ name: "P" }} />);
    expect(screen.queryByText("/")).toBeNull();
  });
});

describe("Topbar — toolbar actions", () => {
  it("toggle button reflects collapsed via aria-pressed and fires onToggleCollapsed", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { container, rerender } = render(
      <Topbar product={{ name: "P" }} onToggleCollapsed={onToggle} collapsed={false} />,
    );
    const toggle = container.querySelector("[aria-pressed]") as HTMLButtonElement;
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(onToggle).toHaveBeenCalled();
    rerender(<Topbar product={{ name: "P" }} onToggleCollapsed={onToggle} collapsed />);
    expect(container.querySelector("[aria-pressed]")).toHaveAttribute("aria-pressed", "true");
  });

  it("search button fires onSearchOpen", async () => {
    const user = userEvent.setup();
    const onSearchOpen = vi.fn();
    const { container } = render(<Topbar product={{ name: "P" }} onSearchOpen={onSearchOpen} />);
    await user.click(container.querySelector('[aria-keyshortcuts="Meta+K"]') as HTMLElement);
    expect(onSearchOpen).toHaveBeenCalled();
  });

  it("notifications show the unread dot only when unread, and fire onNotificationsOpen", async () => {
    const user = userEvent.setup();
    const onNotificationsOpen = vi.fn();
    const { container, rerender } = render(
      <Topbar product={{ name: "P" }} onNotificationsOpen={onNotificationsOpen} unread />,
    );
    const bell = container.querySelector(".tb-bell") as HTMLButtonElement;
    expect(bell.querySelector(".tb-bell-dot")).not.toBeNull();
    await user.click(bell);
    expect(onNotificationsOpen).toHaveBeenCalled();
    rerender(
      <Topbar product={{ name: "P" }} onNotificationsOpen={onNotificationsOpen} unread={false} />,
    );
    expect(container.querySelector(".tb-bell-dot")).toBeNull();
  });

  it("tweaks button fires onTweaksOpen", async () => {
    const user = userEvent.setup();
    const onTweaksOpen = vi.fn();
    const { container } = render(<Topbar product={{ name: "P" }} onTweaksOpen={onTweaksOpen} />);
    // with no collapse toggle, the only tb-icon-btn is the tweaks control
    await user.click(container.querySelector(".tb-icon-btn") as HTMLElement);
    expect(onTweaksOpen).toHaveBeenCalled();
  });

  it("renders the rightSlot and user slots", () => {
    render(
      <Topbar product={{ name: "P" }} rightSlot={<span>RIGHT</span>} user={<span>USER</span>} />,
    );
    expect(screen.getByText("RIGHT")).toBeInTheDocument();
    expect(screen.getByText("USER")).toBeInTheDocument();
  });
});
