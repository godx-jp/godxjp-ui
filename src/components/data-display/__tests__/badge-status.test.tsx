import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { Badge } from "../badge";

function badgeEl(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-slot="badge"]') as HTMLElement;
}

describe("Badge", () => {
  it("auto-maps a known lifecycle key to its tone + icon", () => {
    const { container } = renderWithUi(<Badge status="active">Active</Badge>);
    const badge = badgeEl(container);
    expect(badge.className).toContain("text-success");
    expect(badge.querySelector('[data-slot="badge-icon"]')).not.toBeNull();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("falls back to the neutral tone for an unknown / localized status", () => {
    const { container } = renderWithUi(<Badge status="プレミアム" />);
    expect(badgeEl(container).className).toContain("text-muted-foreground");
    expect(screen.getByText("プレミアム")).toBeInTheDocument();
  });

  it("honours an explicit tone override (escape hatch for tier labels)", () => {
    const { container } = renderWithUi(<Badge status="プレミアム" variant="success" />);
    expect(badgeEl(container).className).toContain("text-success");
  });

  it("hides the icon when icon={null} (category / tier badge)", () => {
    const { container } = renderWithUi(<Badge status="プレミアム" variant="info" icon={null} />);
    const badge = badgeEl(container);
    expect(badge.querySelector('[data-slot="badge-icon"]')).toBeNull();
    expect(badge.className).toContain("text-info");
  });
});
