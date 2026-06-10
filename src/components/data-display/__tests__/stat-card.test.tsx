import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatCard } from "../card";

const root = (c: HTMLElement) => c.querySelector("[data-stat-card]") as HTMLElement;

describe("StatCard — delta tone", () => {
  it("a +delta is positive (success), a -delta is negative (destructive)", () => {
    const { rerender } = render(<StatCard label="売上" value="¥1,000" delta="+12%" />);
    let delta = screen.getByText("+12%");
    expect(delta).toHaveAttribute("data-delta-tone", "positive");
    expect(delta).toHaveClass("text-success");

    rerender(<StatCard label="売上" value="¥900" delta="-5%" />);
    delta = screen.getByText("-5%");
    expect(delta).toHaveAttribute("data-delta-tone", "negative");
    expect(delta).toHaveClass("text-destructive");
  });

  it("inverse flips the semantics (lower is better)", () => {
    render(<StatCard label="離脱率" value="3%" delta="+10" inverse />);
    expect(screen.getByText("+10")).toHaveAttribute("data-delta-tone", "negative");
  });

  it("a sign-less delta carries no tone but still renders", () => {
    const { container } = render(<StatCard label="x" value="1" delta="12" />);
    const delta = screen.getByText("12");
    expect(delta).not.toHaveAttribute("data-delta-tone");
    expect(container.querySelector('[data-slot="stat-card-delta"]')).not.toBeNull();
  });

  it("omits the delta slot entirely when no delta is given", () => {
    const { container } = render(<StatCard label="x" value="1" />);
    expect(container.querySelector('[data-slot="stat-card-delta"]')).toBeNull();
  });
});

describe("StatCard — layout / align / hint", () => {
  it("reflects layout + align on the card and shows the hint after the value (stacked)", () => {
    const { container } = render(
      <StatCard label="x" value="1" hint="前月比" layout="stacked" align="end" />,
    );
    expect(root(container)).toHaveAttribute("data-stat-layout", "stacked");
    expect(root(container)).toHaveAttribute("data-stat-align", "end");
    expect(screen.getByText("前月比")).toBeInTheDocument();
  });

  it("shows the hint inside the body for the inline layout", () => {
    const { container } = render(<StatCard label="x" value="1" hint="補足" layout="inline" />);
    expect(root(container)).toHaveAttribute("data-stat-layout", "inline");
    const body = container.querySelector('[data-slot="stat-card-body"]')!;
    expect(body.querySelector('[data-slot="stat-card-hint"]')).not.toBeNull();
  });
});

describe("StatCard — accent rail", () => {
  it("forwards accent to the underlying Card as the semantic rail", () => {
    const { container } = render(<StatCard label="修理未完了" value="227" accent="destructive" />);
    expect(root(container)).toHaveAttribute("data-accent", "destructive");
  });

  it("renders no rail attribute when accent is omitted", () => {
    const { container } = render(<StatCard label="x" value="1" />);
    expect(root(container)).not.toHaveAttribute("data-accent");
  });
});
