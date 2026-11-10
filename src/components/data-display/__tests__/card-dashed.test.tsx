import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "../card";

const css = readFileSync(resolve(process.cwd(), "src/styles/card-layout.css"), "utf8");
const tokens = readFileSync(resolve(process.cwd(), "src/tokens/components/card.css"), "utf8");

describe('Card variant="dashed" — an editing / drop area', () => {
  it("emits data-variant and paints a dashed, unfilled, flat perimeter from its knobs", () => {
    const { container } = render(<Card variant="dashed" accent="primary" />);
    expect(container.firstElementChild).toHaveAttribute("data-variant", "dashed");
    const rule = css.match(
      /\[data-slot="card"\]\[data-variant="dashed"\],\s*\[data-slot="card"\]\[data-variant="dashed"\]\[data-accent\]\s*\{([^}]*)\}/,
    )?.[1];
    expect(rule).toContain("border-style: dashed");
    expect(rule).toContain("border-color: var(--card-dashed-border-color, hsl(var(--border)))");
    expect(rule).toContain("background: transparent");
    expect(rule).toContain("box-shadow: none");
    // An accent retints the dash, declared AFTER the accent rail/perimeter rules it must beat.
    const tint = css.indexOf('[data-slot="card"][data-variant="dashed"][data-accent] {');
    expect(tint).toBeGreaterThan(
      css.indexOf('[data-slot="card"][data-accent][data-accent-placement="perimeter"] {'),
    );
    expect(tokens).toContain("--card-dashed-border-color: initial;");
  });
});
