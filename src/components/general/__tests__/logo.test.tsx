import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { Logo } from "../logo";

describe("Logo", () => {
  it("renders the default lettermark and the data-slot", () => {
    const { container } = renderWithUi(<Logo />);
    const mark = container.querySelector('[data-slot="logo"]');
    expect(mark).not.toBeNull();
    expect(mark).toHaveTextContent("G");
    expect(mark).toHaveAttribute("data-size", "md");
  });

  it("is an accessible image when label is set", () => {
    renderWithUi(<Logo label="GoDX" />);
    const mark = screen.getByRole("img", { name: "GoDX" });
    expect(mark).toBeInTheDocument();
  });

  it("is decorative (aria-hidden, no role) without a label", () => {
    const { container } = renderWithUi(<Logo />);
    const mark = container.querySelector('[data-slot="logo"]');
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).not.toHaveAttribute("role");
  });

  it("accepts a custom glyph and shape", () => {
    const { container } = renderWithUi(<Logo glyph="税" shape="pill" size="lg" />);
    const mark = container.querySelector('[data-slot="logo"]');
    expect(mark).toHaveTextContent("税");
    expect(mark).toHaveAttribute("data-shape", "pill");
    expect(mark).toHaveAttribute("data-size", "lg");
  });
});
