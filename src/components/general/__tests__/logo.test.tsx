import { describe, expect, it } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";

import { Logo } from "../logo";

describe("Logo", () => {
  it("renders the default glyph at md size, decorative by default", () => {
    const { container } = render(<Logo />);
    const mark = container.querySelector('[data-slot="logo"]')!;
    expect(mark).toHaveTextContent("g");
    expect(mark).toHaveAttribute("data-size", "md");
    // No label → decorative: aria-hidden, no img role, no accessible name.
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).not.toHaveAttribute("role");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("accepts a custom glyph and size tier", () => {
    const { container } = render(<Logo glyph="MF" size="lg" />);
    const mark = container.querySelector('[data-slot="logo"]')!;
    expect(mark).toHaveTextContent("MF");
    expect(mark).toHaveAttribute("data-size", "lg");
  });

  // When the mark stands alone (no wordmark beside it) a label makes it a named image for AT.
  it("exposes an accessible image when label is provided", () => {
    render(<Logo label="CoreBooks" />);
    const img = screen.getByRole("img", { name: "CoreBooks" });
    expect(img).toBeInTheDocument();
    expect(img).not.toHaveAttribute("aria-hidden");
  });

  it("forwards ref and merges className onto the mark", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(<Logo ref={ref} className="shadow-sm" />);
    const mark = container.querySelector('[data-slot="logo"]')!;
    expect(ref.current).toBe(mark);
    expect(mark).toHaveClass("ui-logo", "shadow-sm");
  });
});
