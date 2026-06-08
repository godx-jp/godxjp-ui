import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SidebarHeader, SidebarItem, SidebarSection } from "../sidebar";

const Icon = () => <svg data-testid="icon" />;
const item = (over: Record<string, unknown> = {}) => ({
  id: "dash",
  label: "ダッシュボード",
  icon: Icon,
  ...over,
});

describe("SidebarItem", () => {
  it("renders icon + label, marks active and fires onActivate", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<SidebarItem item={item()} active onActivate={onActivate} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-active", "true");
    expect(btn).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("ダッシュボード")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    await user.click(btn);
    expect(onActivate).toHaveBeenCalledWith("dash");
  });

  it("shows a badge when present and omits it otherwise", () => {
    const { rerender, container } = render(<SidebarItem item={item({ badge: "9" })} />);
    expect(container.querySelector(".sb-badge")).toHaveTextContent("9");
    rerender(<SidebarItem item={item()} />);
    expect(container.querySelector(".sb-badge")).toBeNull();
  });

  it("a sub item drops the icon and takes the sub modifier class", () => {
    const { container } = render(<SidebarItem item={item()} sub />);
    expect(container.querySelector(".sb-nav-item--sub")).not.toBeNull();
    expect(screen.queryByTestId("icon")).toBeNull(); // no icon for sub rows
  });

  it("a disabled item ignores clicks and is aria-disabled", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<SidebarItem item={item({ disabled: true })} onActivate={onActivate} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-disabled", "true");
    await user.click(btn);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("renders custom content via renderItem instead of the default row", () => {
    render(<SidebarItem item={item()} renderItem={(i) => <span>custom-{i.id}</span>} />);
    expect(screen.getByText("custom-dash")).toBeInTheDocument();
    expect(screen.queryByTestId("icon")).toBeNull();
  });
});

describe("SidebarHeader + SidebarSection", () => {
  it("SidebarHeader renders its children", () => {
    render(<SidebarHeader>BRAND</SidebarHeader>);
    expect(screen.getByText("BRAND")).toBeInTheDocument();
  });

  it("SidebarSection shows its label only when not collapsed", () => {
    const { rerender, container } = render(
      <SidebarSection label="メイン">
        <div>item</div>
      </SidebarSection>,
    );
    expect(container.querySelector(".sb-section-label")).toHaveTextContent("メイン");
    rerender(
      <SidebarSection label="メイン" collapsed>
        <div>item</div>
      </SidebarSection>,
    );
    expect(container.querySelector(".sb-section-label")).toBeNull();
  });
});
