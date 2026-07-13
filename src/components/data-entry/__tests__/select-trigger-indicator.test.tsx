import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";

// #175 — SelectTrigger had no supported way to hide its built-in chevron disclosure indicator,
// forcing specialized triggers (icon-only, etc.) to reach for consumer descendant CSS
// (`[data-slot=select-chevron] { display: none }`). `showIndicator={false}` removes the icon
// from the DOM outright — a real API, not a visual hide.

describe("SelectTrigger — showIndicator (#175)", () => {
  it("renders the chevron disclosure indicator by default", () => {
    const { container } = renderWithUi(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(container.querySelector('[data-slot="select-chevron"]')).toBeInTheDocument();
  });

  it("omits the chevron from the DOM (not merely CSS-hidden) when showIndicator=false", () => {
    const { container } = renderWithUi(
      <Select>
        <SelectTrigger showIndicator={false} aria-label="アイコンのみ">
          <span aria-hidden="true">★</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(container.querySelector('[data-slot="select-chevron"]')).not.toBeInTheDocument();
    // The consumer's own custom affordance is unaffected — no descendant CSS was needed for either.
    expect(screen.getByText("★")).toBeInTheDocument();
  });

  it("has no axe violations for an icon-only trigger with the indicator hidden", async () => {
    await expectNoA11yViolations(
      <Select>
        <SelectTrigger showIndicator={false} aria-label="アイコンのみ">
          <span aria-hidden="true">★</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
  });
});
