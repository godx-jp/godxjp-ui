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

  it("keeps the legacy icon variant pixel-identical (done dot for past items)", () => {
    const { container } = render(<Timeline items={ITEMS} />);
    expect(container.querySelector(".ui-timeline")).toHaveAttribute("data-variant", "icon");
    const past = screen.getByText("出荷").closest("li")!;
    expect(past.querySelector('[data-status="done"]')).not.toBeNull();
    // No explicit status set → resolves to done, not pending.
    expect(past).not.toHaveTextContent("Upcoming:");
  });

  it("variant=ordinal renders the 1-based index as every glyph", () => {
    render(<Timeline variant="ordinal" items={[{ title: "A" }, { title: "B" }, { title: "C" }]} />);
    const a = screen.getByText("A").closest("li")!;
    const c = screen.getByText("C").closest("li")!;
    expect(a.querySelector(".ui-timeline-ordinal")).toHaveTextContent("1");
    expect(c.querySelector(".ui-timeline-ordinal")).toHaveTextContent("3");
  });

  it("variant=status picks glyph by status (check / pip / number)", () => {
    const { container } = render(
      <Timeline
        variant="status"
        items={[
          { title: "done", status: "done" },
          { title: "now", status: "current" },
          { title: "later", status: "pending" },
        ]}
      />,
    );
    const done = screen.getByText("done").closest("li")!;
    const now = screen.getByText("now").closest("li")!;
    const later = screen.getByText("later").closest("li")!;
    // done → an svg check glyph
    expect(done.querySelector(".ui-timeline-dot svg")).not.toBeNull();
    // current → a filled pip, not a number
    expect(now.querySelector(".ui-timeline-pip")).not.toBeNull();
    expect(now.querySelector(".ui-timeline-ordinal")).toBeNull();
    // pending → the step number (index 2 → "3")
    expect(later.querySelector(".ui-timeline-ordinal")).toHaveTextContent("3");
    expect(container.querySelector('[data-status="pending"]')).not.toBeNull();
  });

  it("per-item icon overrides the variant/status auto-glyph", () => {
    const Star = (props: Record<string, unknown>) => <svg data-testid="star" {...props} />;
    render(<Timeline variant="ordinal" items={[{ title: "X", icon: Star as never }]} />);
    const x = screen.getByText("X").closest("li")!;
    expect(x.querySelector('[data-testid="star"]')).not.toBeNull();
    // The ordinal number is replaced by the override.
    expect(x.querySelector(".ui-timeline-ordinal")).toBeNull();
  });

  it("status:'current' behaves like current:true (aria-current + emphasis)", () => {
    render(<Timeline items={[{ title: "p" }, { title: "live", status: "current" }]} />);
    const live = screen.getByText("live").closest("li")!;
    expect(live).toHaveAttribute("aria-current", "step");
    expect(live).toHaveAttribute("data-status", "current");
    expect(live).toHaveTextContent("Current:");
  });

  it("emits a Pending SR prefix for pending items", () => {
    render(<Timeline variant="ordinal" items={[{ title: "soon", status: "pending" }]} />);
    const soon = screen.getByText("soon").closest("li")!;
    expect(soon).toHaveTextContent("Upcoming:");
    expect(soon).not.toHaveAttribute("aria-current");
  });
});
