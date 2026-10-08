import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Popover, PopoverContent, PopoverTrigger } from "../popover";

/** `<Popover openOn="hover">` — the hover card (formerly `HoverCard`, v32 #1223). */
function Demo(props: { open?: boolean }) {
  return (
    <Popover openOn="hover" open={props.open}>
      <PopoverTrigger>株式会社ベトヤ</PopoverTrigger>
      <PopoverContent>取引先 · BTY-0012</PopoverContent>
    </Popover>
  );
}

describe('Popover openOn="hover"', () => {
  it("does not render the content while closed", () => {
    const { queryByText } = render(<Demo />);
    expect(queryByText("取引先 · BTY-0012")).toBeNull();
  });

  it("renders the rich content when open (controlled)", () => {
    const { getByText } = render(<Demo open />);
    expect(getByText("取引先 · BTY-0012")).toBeInTheDocument();
  });

  it("the open content carries the entrance animation + side data attributes", () => {
    const { getByText } = render(<Demo open />);
    const content = getByText("取引先 · BTY-0012").closest('[data-slot="hover-card-content"]')!;
    expect(content).toHaveAttribute("data-state", "open");
    expect(content.className).toContain("animate-in");
  });

  it("is supplementary content, not a dialog: no dialog role, no popup claim on the trigger", () => {
    const { getByText } = render(<Demo open />);
    const content = getByText("取引先 · BTY-0012").closest('[data-slot="hover-card-content"]')!;
    expect(content).not.toHaveAttribute("role", "dialog");
    expect(getByText("株式会社ベトヤ")).not.toHaveAttribute("aria-haspopup");
    // Without `asChild` the trigger is a link-like `<a>`, the element a hover card decorates.
    expect(getByText("株式会社ベトヤ").tagName).toBe("A");
  });
});
