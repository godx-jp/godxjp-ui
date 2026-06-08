import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToggleGroup, ToggleGroupItem } from "../toggle-group";
import { expectNoA11yViolations } from "@/test/a11y";

function SingleGroup(props: { onValueChange?: (v: string) => void; defaultValue?: string }) {
  return (
    <ToggleGroup type="single" aria-label="表示" {...props}>
      <ToggleGroupItem value="day">日</ToggleGroupItem>
      <ToggleGroupItem value="week">週</ToggleGroupItem>
      <ToggleGroupItem value="month">月</ToggleGroupItem>
    </ToggleGroup>
  );
}

describe("ToggleGroup", () => {
  it("single mode: selecting an item fires onValueChange + sets pressed state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole } = render(<SingleGroup onValueChange={onValueChange} />);
    const week = getByRole("radio", { name: "週" });
    await user.click(week);
    expect(onValueChange).toHaveBeenCalledWith("week");
    expect(week).toHaveAttribute("aria-checked", "true");
  });

  it("single mode honours defaultValue", () => {
    const { getByRole } = render(<SingleGroup defaultValue="month" />);
    expect(getByRole("radio", { name: "月" })).toHaveAttribute("aria-checked", "true");
  });

  it("multiple mode: items toggle independently (array value)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <ToggleGroup type="multiple" onValueChange={onValueChange} aria-label="書式">
        <ToggleGroupItem value="bold">B</ToggleGroupItem>
        <ToggleGroupItem value="italic">I</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(getByRole("button", { name: "B" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["bold"]);
    await user.click(getByRole("button", { name: "I" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["bold", "italic"]);
    await user.click(getByRole("button", { name: "B" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["italic"]);
  });

  it("a disabled item cannot be toggled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <ToggleGroup type="single" onValueChange={onValueChange} aria-label="表示">
        <ToggleGroupItem value="a" disabled>
          A
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(getByRole("radio", { name: "A" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("forwards variant/size data attributes to the root", () => {
    const { container } = render(
      <ToggleGroup type="single" variant="outline" size="sm" aria-label="表示">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const root = container.querySelector('[data-slot="toggle-group"]')!;
    expect(root).toHaveAttribute("data-variant", "outline");
    expect(root).toHaveAttribute("data-size", "sm");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<SingleGroup defaultValue="day" />);
  });
});
