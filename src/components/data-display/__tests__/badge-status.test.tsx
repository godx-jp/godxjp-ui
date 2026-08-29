import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { tonePrimaryClass } from "@/lib/control-styles";
import { Badge } from "../badge";

function badgeEl(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-slot="badge"]') as HTMLElement;
}

/**
 * The SHARED soft-tone bundle, imported rather than retyped. Asserting the constant (never the
 * `bg-primary/10` / `text-primary-strong` literals inside it) keeps the test about "the badge is
 * painted with the library's soft brand tone" — the thing that has to stay true when those
 * literals become tokens.
 */
const softBrandTone = tonePrimaryClass.split(" ");
const utilities = (el: HTMLElement) => el.className.split(/\s+/);

describe("Badge", () => {
  it("auto-maps a known lifecycle key to its tone + icon", () => {
    const { container } = renderWithUi(<Badge status="active">Active</Badge>);
    const badge = badgeEl(container);
    // "active" is a SUCCESS status — the mapping, not the colour that renders it.
    expect(badge).toHaveAttribute("data-tone", "success");
    expect(badge.querySelector('[data-slot="badge-icon"]')).not.toBeNull();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("falls back to the neutral tone for an unknown / localized status", () => {
    const { container } = renderWithUi(<Badge status="プレミアム" />);
    expect(badgeEl(container)).toHaveAttribute("data-tone", "neutral");
    expect(screen.getByText("プレミアム")).toBeInTheDocument();
  });

  it("honours an explicit tone override (escape hatch for tier labels)", () => {
    const { container } = renderWithUi(<Badge status="プレミアム" tone="success" />);
    // The override beats the status map's neutral fallback.
    expect(badgeEl(container)).toHaveAttribute("data-tone", "success");
  });

  it("hides the icon when icon={null} (category / tier badge)", () => {
    const { container } = renderWithUi(<Badge status="プレミアム" tone="info" icon={null} />);
    const badge = badgeEl(container);
    expect(badge.querySelector('[data-slot="badge-icon"]')).toBeNull();
    expect(badge).toHaveAttribute("data-tone", "info");
  });

  it("renders the brand `primary` tone as a SOFT pill (tinted fill + brand text)", () => {
    // The #120 case: a brand-coloured role pill with a soft/tinted background, not the
    // heavy solid-primary fill.
    const { container } = renderWithUi(
      <Badge tone="primary" icon={null}>
        Admin
      </Badge>,
    );
    const badge = badgeEl(container);
    expect(badge).toHaveAttribute("data-tone", "primary");
    // It is painted with the library's shared SOFT brand tone…
    expect(utilities(badge)).toEqual(expect.arrayContaining(softBrandTone));
    // …and therefore not with the solid fill: `cn`/tailwind-merge keeps one winner per property,
    // so the soft tint and brand text are present exactly because the default variant's
    // background and inverted foreground were merged away.
  });

  it("keeps a SOLID brand fill on the default variant (no tone)", () => {
    const { container } = renderWithUi(<Badge>Brand</Badge>);
    const badge = badgeEl(container);
    expect(badge).toHaveAttribute("data-tone", "default");
    // No tone bundle is layered over the variant, so the default variant's solid brand fill is
    // what survives — the mirror image of the soft pill above.
    expect(utilities(badge)).not.toEqual(expect.arrayContaining(softBrandTone));
  });
});
