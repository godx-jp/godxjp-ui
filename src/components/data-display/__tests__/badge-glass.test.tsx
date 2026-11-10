import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "../badge";

const css = readFileSync(resolve(process.cwd(), "src/styles/badge-layout.css"), "utf8");

describe('Badge variant="glass" + leading', () => {
  it("marks the glass chip, renders a decorative leading tile before the label", () => {
    const { container } = render(
      <Badge variant="glass" leading={<span className="tile">T</span>}>
        GoDX タスク
      </Badge>,
    );
    const chip = container.firstElementChild!;
    expect(chip).toHaveAttribute("data-variant", "glass");
    const lead = chip.querySelector('[data-slot="badge-leading"]')!;
    expect(lead).toHaveAttribute("aria-hidden", "true");
    expect(lead.nextElementSibling).toHaveAttribute("data-slot", "badge-label");
    expect(screen.getByText("GoDX タスク")).toBeTruthy();
    // Painted from the surface's own ink, so a re-scoped --foreground (a brand band) keeps it legible.
    const rule =
      css.match(/\[data-slot="badge"\]\[data-variant="glass"\]\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toContain(
      "background-color: hsl(var(--foreground) / var(--badge-glass-background-alpha))",
    );
    expect(rule).toContain("color: hsl(var(--foreground))");
  });

  it("other variants emit no data-variant and no leading slot", () => {
    const { container } = render(<Badge variant="outline">x</Badge>);
    expect(container.firstElementChild).not.toHaveAttribute("data-variant");
    expect(container.querySelector('[data-slot="badge-leading"]')).toBeNull();
  });
});
