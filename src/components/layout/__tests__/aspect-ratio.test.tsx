import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { AspectRatio } from "../aspect-ratio";
import { expectNoA11yViolations } from "@/test/a11y";

describe("AspectRatio", () => {
  it("renders its children inside the ratio box", () => {
    const { getByTestId, container } = render(
      <AspectRatio ratio={16 / 9}>
        <img data-testid="media" src="/x.png" alt="building" />
      </AspectRatio>,
    );
    expect(container.querySelector('[data-slot="aspect-ratio"]')).toBeInTheDocument();
    expect(getByTestId("media")).toBeInTheDocument();
  });

  it("applies a custom ratio (1:1) without crashing + forwards className", () => {
    const { container } = render(
      <AspectRatio ratio={1} className="rounded-md">
        <div>square</div>
      </AspectRatio>,
    );
    const root = container.querySelector('[data-slot="aspect-ratio"]');
    expect(root).toBeInTheDocument();
    // Radix wraps the ratio box; the className lands on the slotted root
    expect(container.textContent).toContain("square");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <AspectRatio ratio={4 / 3}>
        <img src="/x.png" alt="決算書類のサムネイル" />
      </AspectRatio>,
    );
  });
});
