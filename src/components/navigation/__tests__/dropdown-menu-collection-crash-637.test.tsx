import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Building2 } from "lucide-react";
import { Button } from "../../general/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

/**
 * gh#637 — a child React Aria's collection cannot build took the WHOLE APPLICATION down.
 *
 * RAC renders a menu's children into a fake `Document` that has `createElement` and neither
 * `createElementNS` nor `createTextNode`, so React 19 throws in `completeWork` and — an uncaught
 * error in render — unmounts the root. The reporter's consumer is Inertia: the root IS the page,
 * so a misplaced icon rendered a blank screen with nothing in the console.
 *
 * Measured here, on react-aria-components 1.21.1 / react-dom 19.2.8, WITHOUT the boundary:
 *   svg in Menu · bare string in Menu · component returning svg in Menu · svg in MenuSection ·
 *   svg in a radio MenuSection   → 5/5 TypeError, root emptied.
 * WITH it: 5/5 the menu is empty, the page is intact, and the console names the cause.
 *
 * These cases are ALSO the canary for the upstream fix: when `@react-aria/collections` gains the
 * two methods, the menus below stop being empty and these expectations are the ones that say so.
 */
function App({ children }: { children: React.ReactNode }) {
  return (
    <div data-testid="app-root">
      <p>trang vẫn còn</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Mở</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>{children}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function IconWrapper() {
  return <Building2 />;
}

const UNCOLLECTABLE: [string, React.ReactNode][] = [
  [
    "an <svg> beside the items",
    <>
      <svg key="i" viewBox="0 0 24 24" />
      <DropdownMenuItem key="a">Acme</DropdownMenuItem>
    </>,
  ],
  [
    "a bare string beside the items",
    <>
      {"Workspaces"}
      <DropdownMenuItem key="a">Acme</DropdownMenuItem>
    </>,
  ],
  [
    "a COMPONENT that returns an svg — the shape a consumer writes",
    <>
      <IconWrapper key="i" />
      <DropdownMenuItem key="a">Acme</DropdownMenuItem>
    </>,
  ],
  [
    "the same, inside a group",
    <DropdownMenuGroup key="g">
      <IconWrapper key="i" />
      <DropdownMenuItem key="a">Acme</DropdownMenuItem>
    </DropdownMenuGroup>,
  ],
  [
    "the same, inside a radio group — the workspace-switcher shape",
    <DropdownMenuRadioGroup key="g" value="a">
      <IconWrapper key="i" />
      <DropdownMenuRadioItem key="a" value="a">
        Acme
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>,
  ],
];

describe("DropdownMenu · a child the collection cannot build (gh#637)", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  for (const [name, children] of UNCOLLECTABLE) {
    it(`keeps the application mounted when the menu holds ${name}`, async () => {
      const user = userEvent.setup();
      renderWithUi(<App>{children}</App>);
      await user.click(screen.getByRole("button", { name: "Mở" }));

      // THE PAGE IS THE ASSERTION. Before the boundary this node was gone — React 19 unmounts the
      // root on an uncaught render error, which is the blank screen the issue was filed about.
      // Queried by test id and text rather than by role: an open modal popover marks the page
      // behind it `aria-hidden`, so a role query would report "missing" for a node that is there.
      const root = screen.getByTestId("app-root");
      expect(root).toBeInTheDocument();
      expect(root).toHaveTextContent("trang vẫn còn");
      expect(root.querySelector("button")).not.toBeNull();

      // …and it is never silent, in any build.
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("the menu could not be built and was left empty"),
        expect.anything(),
      );
    });
  }

  it("leaves a correctly composed menu — icons INSIDE the items — untouched", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <App>
        <DropdownMenuItem>
          <Building2 />
          Acme
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Building2 />
          Globex
        </DropdownMenuItem>
      </App>,
    );
    await user.click(screen.getByRole("button", { name: "Mở" }));

    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    expect(console.error).not.toHaveBeenCalled();
  });
});
