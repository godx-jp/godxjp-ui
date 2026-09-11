import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline } from "../data-display/timeline";
import type { TimelineItem } from "../data-display/timeline";

// Timeline renders an ordered list of events with the current step marked via
// aria-current; the list semantics and decorative icons must stay AT-friendly.
// A 3-state status tracker (done / current / pending) in the status variant.
const statusItems: TimelineItem[] = [
  { title: "Issued", status: "done" },
  { title: "Awaiting approval", status: "current" },
  { title: "Posted", status: "pending" },
];

describe("Timeline a11y", () => {
  it("sets aria-current='step' only on the current item", () => {
    render(<Timeline variant="status" items={statusItems} />);
    const current = screen.getByText("Awaiting approval").closest("li")!;
    expect(current).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Issued").closest("li")!).not.toHaveAttribute("aria-current");
    expect(screen.getByText("Posted").closest("li")!).not.toHaveAttribute("aria-current");
  });

  it("provides a screen-reader prefix for all three states", () => {
    render(<Timeline variant="status" items={statusItems} />);
    expect(screen.getByText("Issued").closest("li")!).toHaveTextContent("Completed:");
    expect(screen.getByText("Awaiting approval").closest("li")!).toHaveTextContent("Current:");
    expect(screen.getByText("Posted").closest("li")!).toHaveTextContent("Upcoming:");
  });
});
