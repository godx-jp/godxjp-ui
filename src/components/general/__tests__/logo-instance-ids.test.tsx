import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo } from "../logo";

/**
 * The master artwork carries a clipPath and eight gradients, referenced by `url(#…)`. SVG ids are
 * unique per DOCUMENT, so a fixed prefix would make every <Logo> on a page emit the same ones.
 *
 * WHAT THIS IS NOT: a rendering bug. Measured in Chromium — two lockups, remove the first,
 * screenshot the second — shared ids and unique ids give byte-identical pixels, because each
 * instance carries its own identical <defs> and `url(#…)` just resolves to the first copy. The
 * first version of this guard claimed a visible break and was wrong.
 *
 * What it IS: document validity. Duplicate ids break getElementById, in-page anchors and any
 * aria/label reference that lands on one, and they multiply with every Logo rendered.
 */
describe("every Logo instance owns its artwork ids", () => {
  it("emits no duplicate id across two instances of the same mark", () => {
    const { container } = render(
      <>
        <Logo mark="godx-lockup" />
        <Logo mark="godx-lockup" />
      </>,
    );
    const ids = [...container.querySelectorAll("[id]")].map((n) => n.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("emits no duplicate id across DIFFERENT marks either", () => {
    const { container } = render(
      <>
        <Logo mark="godx" />
        <Logo mark="godx-lockup" />
      </>,
    );
    const ids = [...container.querySelectorAll("[id]")].map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every url(#…) pointing INSIDE its own svg", () => {
    // A reference that escaped its instance would still render today (the neighbouring copy is
    // identical) and would rot the moment the artworks diverge — so it is checked structurally.
    const { container } = render(<Logo mark="godx-lockup" />);
    for (const svg of container.querySelectorAll("svg")) {
      const own = new Set([...svg.querySelectorAll("[id]")].map((n) => n.id));
      for (const [, ref] of svg.innerHTML.matchAll(/url\(#([^)]+)\)/g)) {
        expect(own.has(ref)).toBe(true);
      }
    }
  });
});
