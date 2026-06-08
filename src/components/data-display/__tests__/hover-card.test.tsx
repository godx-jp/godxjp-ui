import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "../hover-card";
import { expectNoA11yViolations } from "@/test/a11y";

function Demo(props: { open?: boolean }) {
  return (
    <HoverCard open={props.open}>
      <HoverCardTrigger>株式会社ベトヤ</HoverCardTrigger>
      <HoverCardContent>取引先 · BTY-0012</HoverCardContent>
    </HoverCard>
  );
}

describe("HoverCard", () => {
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

  it("has no axe violations when open", async () => {
    await expectNoA11yViolations(<Demo open />);
  });
});
