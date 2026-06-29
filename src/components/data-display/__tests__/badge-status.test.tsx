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
    const { container } = renderWithUi(<Badge status="プレミアム" tone="success" />);
    expect(badgeEl(container).className).toContain("text-success");
  });

  it("hides the icon when icon={null} (category / tier badge)", () => {
    const { container } = renderWithUi(<Badge status="プレミアム" tone="info" icon={null} />);
    const badge = badgeEl(container);
    expect(badge.querySelector('[data-slot="badge-icon"]')).toBeNull();
    expect(badge.className).toContain("text-info");
  });

  it("renders the brand `primary` tone as a SOFT pill (tinted fill + brand text)", () => {
    // The #120 case: a brand-coloured role pill with a soft/tinted background, not the
    // heavy solid-primary fill. tone="primary" → bg-primary/10 + text-primary.
    const { container } = renderWithUi(
      <Badge tone="primary" icon={null}>
        Admin
      </Badge>,
    );
    const badge = badgeEl(container);
    expect(badge).toHaveAttribute("data-tone", "primary");
    expect(badge.className).toContain("text-primary");
    expect(badge.className).toContain("bg-primary/10");
    // It is NOT the solid-primary fill (that stays on the default variant).
    expect(badge.className).not.toContain("text-primary-foreground");
  });

  it("keeps a SOLID brand fill on the default variant (no tone)", () => {
    const { container } = renderWithUi(<Badge>Brand</Badge>);
    const badge = badgeEl(container);
    expect(badge).toHaveAttribute("data-tone", "default");
    expect(badge.className).toContain("bg-primary");
    expect(badge.className).toContain("text-primary-foreground");
  });
});
