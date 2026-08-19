import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { expectNoA11yViolations } from "@/test/a11y";

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
      <Avatar className="size-12" data-testid="a">
        <AvatarFallback>VB</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]');
    expect(root).toHaveClass("size-12");
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
