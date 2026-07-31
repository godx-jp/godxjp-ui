import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { Card, CardContent } from "../../data-display/card";
import { AuthShell } from "../auth-shell";

describe("AuthShell compact card spacing", () => {
  it("composes canonical AuthShell with solo CardContent without consumer selectors", () => {
    const { container } = renderWithUi(
      <AuthShell variant="canonical">
        <Card>
          <CardContent solo>Login form</CardContent>
        </Card>
      </AuthShell>,
    );

    const shell = container.querySelector('[data-slot="auth-shell"]');
    const content = screen.getByText("Login form");

    expect(shell).toHaveAttribute("data-density", "compact");
    expect(content).toHaveAttribute("data-slot", "card-content");
    expect(content).toHaveAttribute("data-solo", "");
    expect(content.closest(".ui-auth-shell-card")).toBeInTheDocument();
  });

  it("maps the public AuthShell block token independently from the Card inline inset", () => {
    const shellLayoutCss = readFileSync(
      join(__dirname, "../../../styles/shell-layout.css"),
      "utf8",
    );
    const cardLayoutCss = readFileSync(join(__dirname, "../../../styles/card-layout.css"), "utf8");
    const cardTokensCss = readFileSync(
      join(__dirname, "../../../tokens/components/card.css"),
      "utf8",
    );

    expect(cardTokensCss).toMatch(
      /--card-space-solo-y:\s*var\(--card-space-inset\);/,
    );
    expect(shellLayoutCss).toMatch(
      /\.ui-auth-shell\[data-density="compact"\]\s+\.ui-auth-shell-card\s*\{[^}]*--card-space-inset:\s*var\(--auth-shell-compact-card-inset\);[^}]*--card-space-solo-y:\s*var\(--auth-shell-card-padding-block-compact\);/s,
    );
    expect(cardLayoutCss).toMatch(
      /\[data-slot="card-content"\]\s*\{[^}]*padding-inline:\s*var\(--card-space-inset\);/s,
    );
    expect(cardLayoutCss).toMatch(
      /\[data-slot="card-content"\]\[data-solo\]\s*\{[^}]*padding-block:\s*var\(--card-space-solo-y\);/s,
    );
  });
});
