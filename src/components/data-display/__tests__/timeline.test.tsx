import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Timeline } from "../timeline";
import type { TimelineItem } from "../timeline";

const ITEMS: TimelineItem[] = [
  { title: "出荷", location: "東京", time: "09:00", note: "倉庫A" },
  { title: "輸送中", current: true },
];

describe("Timeline", () => {
  it("renders one entry per item with full metadata", () => {
    render(<Timeline items={ITEMS} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("出荷")).toBeInTheDocument();
    expect(screen.getByText("東京")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("倉庫A")).toBeInTheDocument();
  });

  it("marks the current item with aria-current + data-current and the right prefix", () => {
    render(<Timeline items={ITEMS} />);
    const current = screen.getByText("輸送中").closest("li")!;
    expect(current).toHaveAttribute("aria-current", "step");
    expect(current.querySelector('[data-current="true"]')).not.toBeNull();
    expect(current).toHaveTextContent("Current:");
  });

  it("uses the completed prefix and no aria-current for past items", () => {
    render(<Timeline items={ITEMS} />);
    const past = screen.getByText("出荷").closest("li")!;
    expect(past).not.toHaveAttribute("aria-current");
    expect(past).toHaveTextContent("Completed:");
  });

  it("omits optional metadata nodes when absent", () => {
    render(<Timeline items={ITEMS} />);
    const current = screen.getByText("輸送中").closest("li")!;
    expect(current.querySelector(".ui-timeline-time")).toBeNull();
    expect(current.querySelector(".ui-timeline-location")).toBeNull();
    expect(current.querySelector(".ui-timeline-note")).toBeNull();
  });

  it("draws a connector line on every item except the last", () => {
    const { container } = render(<Timeline items={ITEMS} />);
    // 2 items → exactly 1 connector line
    expect(container.querySelectorAll(".ui-timeline-line")).toHaveLength(1);
  });
});
