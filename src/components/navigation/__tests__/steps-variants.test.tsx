import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Steps } from "../steps";

const ITEMS = [
  { title: "申込" },
  { title: "審査", subtitle: "1-2日", description: "書類確認" },
  { title: "完了", disabled: true },
];

describe("Steps — status resolution + default icons", () => {
  it("derives finish/process/wait from value and marks the current step", () => {
    const { container } = render(<Steps items={ITEMS} value={1} />);
    const lis = screen.getAllByRole("listitem");
    expect(lis[1]).toHaveAttribute("aria-current", "step");
    // step 1 is the current 'process' step → spinning loader icon
    expect(container.querySelector(".animate-spin")).not.toBeNull();
    // step 0 finished → a filled primary marker
    expect(container.querySelector('[class*="bg-primary"]')).not.toBeNull();
    // subtitle + description render
    expect(screen.getByText("1-2日")).toBeInTheDocument();
    expect(screen.getByText("書類確認")).toBeInTheDocument();
  });

  it("renders an explicit error status marker", () => {
    const { container } = render(<Steps items={[{ title: "失敗", status: "error" }]} />);
    expect(container.querySelector('[class*="bg-destructive"]')).not.toBeNull();
  });

  it("renders a custom icon when provided", () => {
    render(<Steps items={[{ title: "星", icon: <span data-testid="ic">★</span> }]} />);
    expect(screen.getByTestId("ic")).toBeInTheDocument();
  });
});

describe("Steps — dot type", () => {
  it("renders dot markers instead of status icons", () => {
    const { container } = render(<Steps items={ITEMS} value={1} type="dot" />);
    // no loader/check icons in dot mode
    expect(container.querySelector(".animate-spin")).toBeNull();
    // a small round dot marker exists
    expect(container.querySelector('[class*="size-2.5"]')).not.toBeNull();
  });
});

describe("Steps — interactivity", () => {
  it("interactive steps are buttons; disabled items can't be clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Steps items={ITEMS} value={0} onValueChange={onValueChange} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    expect(buttons[2]).toBeDisabled(); // 完了 is disabled
    await user.click(buttons[1]);
    expect(onValueChange).toHaveBeenCalledWith(1);
  });

  it("without onValueChange the steps are non-interactive (no buttons)", () => {
    render(<Steps items={ITEMS} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("vertical orientation stacks the list", () => {
    const { container } = render(<Steps items={ITEMS} orientation="vertical" />);
    expect(container.querySelector("ol")).toHaveClass("flex-col");
  });
});
