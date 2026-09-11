import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, waitFor, userEvent } from "@/test/render";

import { Button } from "../../general/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

/**
 * Ant Design `trigger` — `('click' | 'hover' | 'contextMenu')[]`, default `['click']` here.
 *
 * WHAT THESE CAN AND CANNOT SEE. jsdom has no layout, so WHERE a context menu lands is measured in a
 * real browser, not here. What jsdom can prove is the part that is pure behaviour: which gesture
 * opens the menu, which one is refused, that the browser's own menu is suppressed, that the keyboard
 * route exists in every mode, and — via `data-align`, which the component derives from whether the
 * menu is anchored to a POINT — that a stale cursor position is not reused by a later click.
 */
function Menu({
  trigger,
  disabled,
  mouseEnterDelay = 0,
  mouseLeaveDelay = 0,
}: {
  trigger?: ("click" | "hover" | "contextMenu")[];
  disabled?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
}) {
  return (
    <DropdownMenu
      trigger={trigger}
      disabled={disabled}
      mouseEnterDelay={mouseEnterDelay}
      mouseLeaveDelay={mouseLeaveDelay}
    >
      <DropdownMenuTrigger asChild>
        <Button type="button">Thao tác</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Đổi tên</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const triggerEl = () => screen.getByRole("button", { name: "Thao tác" });
const menuOpen = () => screen.queryByRole("menu") !== null;
const surface = () =>
  screen.getByRole("menu").closest('[data-slot="dropdown-menu-content"]') as HTMLElement;

describe("DropdownMenu — antd `trigger`", () => {
  it("defaults to click: a left click opens it", async () => {
    const user = userEvent.setup();
    renderWithUi(<Menu />);
    await user.click(triggerEl());
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("defaults to click: a right click does NOT open it, and the browser keeps its own menu", () => {
    renderWithUi(<Menu />);
    const event = fireEvent.contextMenu(triggerEl());
    expect(menuOpen()).toBe(false);
    // Not prevented: suppressing the native menu without offering one is the worst of both.
    expect(event).toBe(true);
  });

  it('trigger={["contextMenu"]}: a right click opens it and suppresses the native menu', async () => {
    renderWithUi(<Menu trigger={["contextMenu"]} />);
    const prevented = !fireEvent.contextMenu(triggerEl(), { clientX: 120, clientY: 90 });
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(prevented).toBe(true);
  });

  it('trigger={["contextMenu"]}: a left click does nothing', async () => {
    const user = userEvent.setup();
    renderWithUi(<Menu trigger={["contextMenu"]} />);
    await user.click(triggerEl());
    expect(menuOpen()).toBe(false);
  });

  it('trigger={["contextMenu"]}: the trigger stops claiming it opens a menu on activation', () => {
    renderWithUi(<Menu trigger={["contextMenu"]} />);
    // A context-menu target is not a menu button: activating it opens nothing, so announcing
    // aria-haspopup would be a lie (react-aria strips it in this mode).
    expect(triggerEl()).not.toHaveAttribute("aria-haspopup");
  });

  it.each([
    ["Shift+F10", { key: "F10", shiftKey: true }],
    ["the ContextMenu key", { key: "ContextMenu" }],
  ])('trigger={["contextMenu"]}: %s opens it — the keyboard is never left out', async (_n, key) => {
    renderWithUi(<Menu trigger={["contextMenu"]} />);
    triggerEl().focus();
    const notPrevented = fireEvent.keyDown(triggerEl(), key);
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    // The native menu is the DEFAULT ACTION of this very keydown on the platforms that have the
    // gesture, so opening ours has to prevent it or both appear.
    expect(notPrevented).toBe(false);
  });

  it("combines gestures: click AND right click both open the same menu", async () => {
    const user = userEvent.setup();
    renderWithUi(<Menu trigger={["click", "contextMenu"]} />);

    await user.click(triggerEl());
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(menuOpen()).toBe(false));

    fireEvent.contextMenu(triggerEl(), { clientX: 40, clientY: 40 });
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  /**
   * react-stately never clears `state.point` once a right click has set it, so without the fix a
   * later click-open would anchor the menu at wherever the cursor was several interactions ago.
   * `data-align` is the observable side of that decision: `start` = anchored to the pointer,
   * `center` = anchored to the trigger.
   */
  it("does not reuse a stale cursor position for a later click-open", async () => {
    const user = userEvent.setup();
    renderWithUi(<Menu trigger={["click", "contextMenu"]} />);

    fireEvent.contextMenu(triggerEl(), { clientX: 300, clientY: 200 });
    await screen.findByRole("menu");
    expect(surface()).toHaveAttribute("data-align", "start");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(menuOpen()).toBe(false));

    await user.click(triggerEl());
    await screen.findByRole("menu");
    expect(surface()).toHaveAttribute("data-align", "center");
  });
});

describe("DropdownMenu — antd `hover`", () => {
  it("opens on pointer hover and closes again when the pointer leaves", async () => {
    const user = userEvent.setup();
    renderWithUi(<Menu trigger={["hover"]} />);

    await user.hover(triggerEl());
    expect(await screen.findByRole("menu")).toBeInTheDocument();

    await user.unhover(triggerEl());
    await waitFor(() => expect(menuOpen()).toBe(false));
  });

  it("stays open while the pointer is on the MENU, so the gap can be crossed", async () => {
    const user = userEvent.setup();
    // A REAL leave delay is the point of the test: the close is an intent that the menu surface
    // must be able to cancel. (At 0ms the timer fires before the pointer can arrive anywhere —
    // which is the same reason antd ships a non-zero mouseLeaveDelay.)
    renderWithUi(<Menu trigger={["hover"]} mouseLeaveDelay={0.2} />);

    await user.hover(triggerEl());
    const item = await screen.findByRole("menuitem", { name: "Đổi tên" });
    await user.unhover(triggerEl());
    await user.hover(item);
    // Past the delay: had arriving on the surface not cancelled the close, it would have closed.
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(menuOpen()).toBe(true);
  });

  it("does not steal focus — hovering must not yank the caret out of what you were typing", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <>
        <Menu trigger={["hover"]} />
        <input aria-label="Ghi chú" />
      </>,
    );
    const input = screen.getByRole("textbox", { name: "Ghi chú" });
    input.focus();

    await user.hover(triggerEl());
    await screen.findByRole("menu");
    expect(document.activeElement).toBe(input);
  });

  it("still opens from the keyboard, so hover is never the only way in (WCAG 2.1.1)", async () => {
    const user = userEvent.setup();
    renderWithUi(<Menu trigger={["hover"]} />);

    triggerEl().focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });
});

describe("DropdownMenu — the trigger's own handlers survive", () => {
  it("chains the caller's handlers instead of replacing them", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const onContextMenu = vi.fn();
    renderWithUi(
      <DropdownMenu trigger={["click", "contextMenu"]}>
        <DropdownMenuTrigger asChild>
          <Button type="button" onKeyDown={onKeyDown} onContextMenu={onContextMenu}>
            Thao tác
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Đổi tên</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = triggerEl();
    fireEvent.contextMenu(trigger);
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    // Wiring a gesture onto someone's element must not swallow what they already put there.
    expect(onContextMenu).toHaveBeenCalled();

    // Close first: while the modal menu is open the background is hidden, so the trigger is not
    // reachable by role — the same reason a consumer cannot interact with it either.
    await user.keyboard("{Escape}");
    await waitFor(() => expect(menuOpen()).toBe(false));

    fireEvent.keyDown(trigger, { key: "F10", shiftKey: true });
    expect(onKeyDown).toHaveBeenCalled();
  });

  it("lets the caller opt out of a gesture with preventDefault", () => {
    renderWithUi(
      <DropdownMenu trigger={["contextMenu"]}>
        <DropdownMenuTrigger asChild>
          <Button type="button" onKeyDown={(event) => event.preventDefault()}>
            Thao tác
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Đổi tên</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    triggerEl().focus();
    fireEvent.keyDown(triggerEl(), { key: "F10", shiftKey: true });
    expect(menuOpen()).toBe(false);
  });
});

describe("DropdownMenu — antd `disabled`", () => {
  it("refuses every gesture, the way antd empties the trigger list", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <DropdownMenu
        disabled
        trigger={["click", "hover", "contextMenu"]}
        mouseEnterDelay={0}
        onOpenChange={onOpenChange}
      >
        <DropdownMenuTrigger asChild>
          <Button type="button">Thao tác</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Đổi tên</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(triggerEl());
    fireEvent.contextMenu(triggerEl());
    await user.hover(triggerEl());
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(menuOpen()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
