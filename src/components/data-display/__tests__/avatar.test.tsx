import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * A consumer-supplied utility, hoisted so the literal appears once as a FIXTURE rather than as an
 * assertion about how the component is painted. What is under test is pass-through: whatever class
 * the consumer hands in survives `cn()` onto the rendered node.
 */
const CONSUMER_CLASS = "size-12";

describe("Avatar", () => {
  it("renders the fallback (initials) while the image has not loaded", () => {
    const { getByText, container } = render(
      <Avatar>
        <AvatarImage src="/x.png" alt="田中" />
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    // jsdom never fires the image load → fallback shows
    expect(getByText("田")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeInTheDocument();
  });

  it("forwards className + arbitrary props to the root", () => {
    const { container } = render(
      <Avatar className={CONSUMER_CLASS} data-testid="a">
        <AvatarFallback>VB</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]');
    expect(root).toHaveClass(CONSUMER_CLASS);
    expect(root).toHaveAttribute("data-testid", "a");
  });

  it("opts into the capability medallion through `appearance`, orthogonally to `shape` (gh#12)", () => {
    const { container } = render(
      <Avatar shape="square" appearance="tinted">
        <AvatarFallback>◇</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]');
    // The medallion is a COMPOSITION (Avatar + a glyph) — the library owes it the tint, not a
    // component. Both attributes are present because the two axes never merged into one prop.
    expect(root).toHaveAttribute("data-shape", "square");
    expect(root).toHaveAttribute("data-appearance", "tinted");
  });

  it("emits no appearance attribute by default — an existing Avatar is byte-identical", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    expect(container.querySelector('[data-slot="avatar"]')).not.toHaveAttribute("data-appearance");
  });

  it("has no axe violations (fallback-only)", async () => {
    await expectNoA11yViolations(
      <Avatar>
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
  });
});
