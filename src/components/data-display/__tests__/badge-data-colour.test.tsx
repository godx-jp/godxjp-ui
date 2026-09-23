import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { renderWithUi } from "@/test/render";
import { Badge } from "../badge";

/**
 * The `color` prop — the entity's OWN colour, a third axis beside `variant`
 * (structure) and `tone` (meaning).
 *
 * Two things have to hold, and the second is the one that bites. First, the
 * colour reaches the element as `--badge-color` so the stylesheet can wash it.
 * Second, NO fill/tone utility may be emitted in this mode: a Tailwind utility
 * lands in `@layer utilities` and beats a `@layer components` rule whatever the
 * specificity, so a single `bg-primary` left on the element would paint over
 * the wash and the prop would be silently inert — the exact failure
 * documented for `--badge-font-size`.
 */
const layout = readFileSync(join(process.cwd(), "src/styles/badge-layout.css"), "utf8");
const tokens = readFileSync(join(process.cwd(), "src/tokens/components/badge.css"), "utf8");

function badge(node: React.ReactElement): HTMLElement {
  const { container } = renderWithUi(node);
  const el = container.querySelector('[data-slot="badge"]') as HTMLElement;
  expect(el).not.toBeNull();
  return el;
}

describe("Badge color (the record's own colour)", () => {
  it("puts the colour on the element as --badge-color and marks it tinted", () => {
    const el = badge(<Badge color="#4488c5">処理中</Badge>);

    expect(el.getAttribute("data-tinted")).toBe("");
    expect(el.style.getPropertyValue("--badge-color")).toBe("#4488c5");
    // `color` is taken over as a prop; it must not leak as an HTML attribute.
    expect(el.getAttribute("color")).toBeNull();
  });

  it("emits no fill, tone or text utility, so the components-layer wash is reachable", () => {
    const el = badge(
      <Badge color="#4488c5" tone="success" variant="default">
        処理中
      </Badge>,
    );

    const painting = Array.from(el.classList).filter((cls) =>
      /^(bg-|text-|border-(?!transparent$))/.test(cls),
    );

    expect(painting).toEqual([]);
    // The tone is not claimed either: `data-tone` would say a meaning it has not got.
    expect(el.getAttribute("data-tone")).toBeNull();
  });

  it("leaves the tone path untouched when no colour is given", () => {
    const el = badge(<Badge tone="success">承認済</Badge>);

    expect(el.getAttribute("data-tinted")).toBeNull();
    expect(el.getAttribute("data-tone")).toBe("success");
    expect(el.style.getPropertyValue("--badge-color")).toBe("");
  });

  it("keeps the caller's own style and shape", () => {
    const el = badge(
      <Badge color="#4488c5" shape="pill" style={{ maxWidth: "8rem" }}>
        処理中
      </Badge>,
    );

    expect(el.style.maxWidth).toBe("8rem");
    expect(el.style.getPropertyValue("--badge-color")).toBe("#4488c5");
    expect(el.getAttribute("data-shape")).toBe("pill");
  });

  it("washes the colour into the surface from the tokens, and keeps the surface's label", () => {
    const rule = layout.match(/\[data-slot="badge"\]\[data-tinted\]\s*\{([^}]*)\}/);

    expect(rule, "badge-layout.css must carry the [data-tinted] rule").not.toBeNull();

    /* SQUASHED — one line, no whitespace hugging a paren. Since gh#901 gave the role default its
     * opacity companion, this value is long enough that Prettier wraps it across four lines, and
     * an assertion carrying the line breaks asserts on Prettier's mood rather than on the token
     * graph. `status-surface-role-866.test.ts` solved the same problem the same way. */
    const body = rule![1].replace(/\s+/g, " ").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");

    // The fill is where the label sits; the edge carries no text and is free to
    // be the louder of the two.
    // The CALL SITE carries the whole fallback chain, and that is the point rather than a detail:
    // the knobs are `initial` at :root so a scope below root can move them (gh#877 / the :root
    // freeze rule). This test used to pin the bare `var(--badge-color)` reads, which is the shape
    // that FROZE — measured in a `.dark` region, the chip painted the light card at
    // `color(srgb 0.9933 …)` while the region's own `--card` was the dark one.
    expect(body).toContain(
      // Prettier wraps this value now that the role carries its opacity companion, so the
      // assertion is on the SQUASHED text rather than on where the line happens to break.
      "var(--badge-color, var(--badge-tint-surface, hsl(var(--card) / var(--card-alpha, 100%)))) var(--badge-tint-fill)",
    );
    expect(body).toContain(
      "var(--badge-color, var(--badge-tint-surface, hsl(var(--card) / var(--card-alpha, 100%)))) var(--badge-tint-edge)",
    );
    expect(body).toContain("var(--badge-tint-surface, hsl(var(--card) / var(--card-alpha, 100%)))");
    expect(body).toContain("color: var(--badge-tint-foreground, hsl(var(--card-foreground)))");

    // Surface first in BOTH mixes. A build targeting a browser without
    // color-mix synthesises a fallback from the first colour, and colour-first
    // would hand it the solid chip this wash exists to avoid.
    for (const knob of ["--badge-tint-fill", "--badge-tint-edge"]) {
      const mix = body.match(new RegExp(`color-mix\\([^;]*${knob}[^;]*\\)`, "s"));
      expect(mix, `the ${knob} mix must be present`).not.toBeNull();
      expect(mix![0].indexOf("--badge-tint-surface")).toBeLessThan(
        mix![0].indexOf("--badge-color"),
      );
    }
  });

  it("declares the four wash knobs with the measured defaults", () => {
    // 18/45 is not a taste: it is the pair that put the worst case across the
    // sRGB cube at 8.52:1 on both themes. Moving either moves that floor, so
    // the numbers are pinned where the reason for them is written down.
    expect(tokens).toContain("--badge-tint-fill: 18%");
    expect(tokens).toContain("--badge-tint-edge: 45%");
    // `initial`, NOT a :root binding — see the note at the call-site assertion above. A binding
    // here resolves against the ROOT's `--card` once, so every scope below inherits root's answer.
    expect(tokens).toContain("--badge-tint-surface: initial");
    expect(tokens).toContain("--badge-tint-foreground: initial");
    expect(tokens).toContain("--badge-color: initial");
    // And the shape that caused it must not come back, in any spelling.
    expect(tokens).not.toMatch(
      /--badge-(tint-surface|tint-foreground|color):\s*(?!initial)[^;]*var\(/,
    );
  });
});
