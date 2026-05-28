import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Checkbox } from "../checkbox";

describe("Checkbox", () => {
  it("renders checkbox role", () => {
    renderWithUi(<Checkbox aria-label="accept" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-slot", "checkbox");
  });

  it("can be checked", async () => {
    const { userEvent } = await import("@/test/render");
    const user = userEvent.setup();
    renderWithUi(<Checkbox aria-label="accept" />);
    const box = screen.getByRole("checkbox");
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
  });
});
