// gh#1275 — a quiet Toggle is a mark beside content (a comment star, a reaction); a "0" beside an
// unstarred star is noise, so `variant="quiet"` hides a zero count unless `showZero` asks for it.
// Every other variant keeps Button's default (`showZero` true) — "Open 0" on a filter chip is data.
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Toggle } from "../toggle";
import { ToggleGroup, ToggleGroupItem } from "../toggle-group";

const pill = (container: HTMLElement) => container.querySelector(".ui-toggle-count");

describe("Toggle zero count (gh#1275)", () => {
  it("quiet hides a zero count by default", () => {
    const { container } = render(
      <Toggle variant="quiet" count={0} aria-label="Star">
        Star
      </Toggle>,
    );
    expect(pill(container)).toBeNull();
  });

  it("quiet still shows a non-zero count, and a zero one with showZero", () => {
    const one = render(
      <Toggle variant="quiet" count={3} aria-label="Star">
        Star
      </Toggle>,
    );
    expect(pill(one.container)?.textContent).toBe("3");
    const zero = render(
      <Toggle variant="quiet" count={0} showZero aria-label="Star">
        Star
      </Toggle>,
    );
    expect(pill(zero.container)?.textContent).toBe("0");
  });

  it("every other variant keeps showing a zero count", () => {
    for (const variant of ["default", "outline", "soft"] as const) {
      const { container } = render(
        <Toggle variant={variant} count={0} aria-label="Open">
          Open
        </Toggle>,
      );
      expect(pill(container)?.textContent, variant).toBe("0");
    }
  });

  it("a quiet ToggleGroup hides a zero count on its items", () => {
    const { container } = render(
      <ToggleGroup type="multiple" variant="quiet" aria-label="Reactions">
        <ToggleGroupItem value="like" count={0}>
          Like
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(pill(container)).toBeNull();
  });
});
