import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Badge } from "../badge";

describe("Badge — status without children", () => {
  it("renders an unknown status string verbatim with the neutral fallback", () => {
    // "vip" is not a key of STATUS_MAP → the `status in STATUS_MAP ? t() : status`
    // ternary takes its `: status` branch and shows the raw string.
    renderWithUi(<Badge status="vip" />);
    expect(screen.getByText("vip")).toBeInTheDocument();
  });

  it("translates a mapped status when no children are given (the t() branch)", () => {
    // "active" IS a STATUS_MAP key and no children are passed → the children-fallback
    // takes the `status in STATUS_MAP ? t(`status.active`)` branch (localized label).
    const { container } = renderWithUi(<Badge status="active" />);
    const text = container.textContent?.trim() ?? "";
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toBe("active"); // localized, not the raw key
  });
});
