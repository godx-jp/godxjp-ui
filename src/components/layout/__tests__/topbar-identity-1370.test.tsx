import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Topbar } from "../topbar";
import { TopbarItem } from "../topbar-item";

describe("Topbar identity and truncation", () => {
  it("retains full text/title and overrides label hiding", async () => {
    const user = userEvent.setup();
    render(
      <Topbar
        identity={
          <TopbarItem truncate labelHideBelow="sm">
            Demo Barista
          </TopbarItem>
        }
      />,
    );
    const cell = screen.getByRole("button", { name: "Demo Barista" });
    expect(cell).toHaveAttribute("title", "Demo Barista");
    expect(screen.getByText("Demo Barista")).toHaveAttribute("dir", "auto");
    expect(screen.getByText("Demo Barista")).not.toHaveAttribute("data-hide-below");
    await user.tab();
    expect(cell).toHaveFocus();
  });
  it("supports asChild and explicit title", () => {
    render(
      <TopbarItem asChild truncate title="Account: Demo Barista">
        <a href="#account">Demo Barista</a>
      </TopbarItem>,
    );
    expect(screen.getByText("Demo Barista")).toHaveAttribute("dir", "auto");
    expect(screen.getByRole("link", { name: "Demo Barista" })).toHaveAttribute(
      "title",
      "Account: Demo Barista",
    );
  });
  it("forwards the button ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <TopbarItem truncate ref={ref}>
        Demo Barista
      </TopbarItem>,
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "Demo Barista" }));
  });
  it("children override every slot, including identity", () => {
    render(<Topbar identity={<TopbarItem>Identity</TopbarItem>}>Custom content</Topbar>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Custom content")).toBeInTheDocument();
  });
});
