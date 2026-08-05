import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * Regression — `<ToggleGroup variant size>` must reach its ITEMS.
 *
 * The group used to stamp `data-variant`/`data-size` on the ROOT only; `ToggleGroupItem` read its
 * own props and `.ui-toggle-group` consumed neither attribute, so `<ToggleGroup size="lg">` alone
 * painted NOTHING — measured in Chromium, a group-only `data-size` of sm/md/lg all rendered the
 * same unstyled 25.8px item, against real tiers of 28/32/36px. A consumer had to repeat the prop
 * on every single item.
 *
 * Worse, the destructuring default was the literal `"default"`, which is NOT a member of the
 * declared `sm | md | lg` union, so an unset group stamped `data-size="default"` — an invalid
 * value for its own type.
 *
 * Fixed with the upstream shadcn React-context pattern. The contract pinned here:
 *  - group `variant`/`size` reach every item,
 *  - an EXPLICIT item prop still wins over the context (the only thing that worked before, and
 *    what the docs frames do — those must keep rendering identically),
 *  - an unset group emits NO `data-size`/`data-variant` (never an off-union literal).
 */

const SIZE_CLASS = {
  sm: "ui-toggle-sm",
  md: "ui-toggle-default-size",
  lg: "ui-toggle-lg",
} as const;

const VARIANT_CLASS = {
  default: "ui-toggle-default",
  outline: "ui-toggle-outline",
} as const;

function items(container: HTMLElement) {
  return [...container.querySelectorAll('[data-slot="toggle-group-item"]')];
}

describe("ToggleGroup variant/size propagation", () => {
  it.each(["sm", "md", "lg"] as const)("group size=%s reaches every item", (size) => {
    const { container } = render(
      <ToggleGroup type="single" size={size} aria-label="表示">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    const rendered = items(container);
    expect(rendered).toHaveLength(2);
    for (const item of rendered) {
      // The size CLASS is what carries the real --control-height tier.
      expect(item).toHaveClass(SIZE_CLASS[size]);
      expect(item).toHaveAttribute("data-size", size);
    }
  });

  it.each(["default", "outline"] as const)("group variant=%s reaches every item", (variant) => {
    const { container } = render(
      <ToggleGroup type="single" variant={variant} aria-label="表示">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    for (const item of items(container)) {
      expect(item).toHaveClass(VARIANT_CLASS[variant]);
      expect(item).toHaveAttribute("data-variant", variant);
    }
  });

  it("an EXPLICIT item prop still wins over the group context", () => {
    const { container } = render(
      <ToggleGroup type="single" size="sm" variant="default" aria-label="表示">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b" size="lg" variant="outline">
          B
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const [inherited, explicit] = items(container);
    expect(inherited).toHaveClass("ui-toggle-sm", "ui-toggle-default");
    expect(explicit).toHaveClass("ui-toggle-lg", "ui-toggle-outline");
    expect(explicit).not.toHaveClass("ui-toggle-sm");
    expect(explicit).toHaveAttribute("data-size", "lg");
  });

  it("repeating the prop on every item (the pre-fix idiom / the docs frames) is unchanged", () => {
    // Identical output whether the prop comes from the group, the items, or both.
    const groupOnly = render(
      <ToggleGroup type="single" size="lg" variant="outline" aria-label="表示">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const bothRepeated = render(
      <ToggleGroup type="single" size="lg" variant="outline" aria-label="表示">
        <ToggleGroupItem value="a" size="lg" variant="outline">
          A
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const itemsOnly = render(
      <ToggleGroup type="single" aria-label="表示">
        <ToggleGroupItem value="a" size="lg" variant="outline">
          A
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const cls = (r: { container: HTMLElement }) => items(r.container)[0].getAttribute("class");
    expect(cls(bothRepeated)).toBe(cls(groupOnly));
    expect(cls(itemsOnly)).toBe(cls(groupOnly));
  });

  it('an unset group emits NO data-size/data-variant (never the off-union "default")', () => {
    const { container } = render(
      <ToggleGroup type="single" aria-label="表示">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const root = container.querySelector('[data-slot="toggle-group"]')!;
    expect(root).not.toHaveAttribute("data-size");
    expect(root).not.toHaveAttribute("data-variant");
    // Whatever IS emitted must be a declared member of the union.
    for (const el of [root, ...items(container)]) {
      const size = el.getAttribute("data-size");
      if (size !== null) expect(["sm", "md", "lg"]).toContain(size);
    }
  });

  it("defaults stay inert — an unset group renders the cva defaults (md / default)", () => {
    const { container } = render(
      <ToggleGroup type="single" aria-label="表示">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    // toggleVariants' own defaultVariants supply md/default at the item — byte-identical to before.
    expect(items(container)[0]).toHaveClass(
      "ui-toggle",
      "ui-toggle-default",
      "ui-toggle-default-size",
    );
  });

  it("has no axe violations with a propagated size", async () => {
    await expectNoA11yViolations(
      <ToggleGroup type="single" size="lg" defaultValue="a" aria-label="表示">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
  });
});
