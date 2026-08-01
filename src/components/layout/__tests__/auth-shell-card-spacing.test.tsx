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

    // --card-space-solo-y is declared `initial`, NOT `var(--card-space-inset)`. Written as a
    // :root binding it substitutes once at :root, so a card carrying [data-density="tight"|"cozy"]
    // — which override --card-space-inset ON THE CARD — would keep the :root value and a solo body
    // would silently stop following its own card's inset. That is the freeze this repo hit for
    // real with --otp-slot-size (gh#233), and docs/TOKENS.md now states the call-site rule applies
    // to any re-scoped tier, not only colour roles. The default is preserved through the call-site
    // chain solo-y → shell-y → inset asserted below, so the rendered geometry is unchanged.
    expect(cardTokensCss).toMatch(/--card-space-solo-y:\s*initial;/);
    expect(shellLayoutCss).toMatch(
      // The mapping carries an explicit `, var(--auth-shell-compact-card-inset)` fallback (the same
      // one --card-space-shell-y uses). --auth-shell-card-padding-block-compact is `initial` at
      // :root, and without a fallback this declaration would be invalid-at-computed-value whenever
      // the knob is unset — correct in real CSS, but it makes the resting default depend on a
      // subtle rule rather than on something a reader can see. Spelled out instead.
      /\.ui-auth-shell\[data-density="compact"\]\s+\.ui-auth-shell-card\s*\{[^}]*--card-space-inset:\s*var\(--auth-shell-compact-card-inset\);[^}]*--card-space-solo-y:\s*var\(\s*--auth-shell-card-padding-block-compact,\s*var\(--auth-shell-compact-card-inset\)\s*\);/s,
    );
    expect(cardLayoutCss).toMatch(
      /\[data-slot="card-content"\]\s*\{[^}]*padding-inline:\s*var\(--card-space-inset\);/s,
    );
    expect(cardLayoutCss).toMatch(
      /\[data-slot="card-content"\]\[data-solo\]\s*\{[^}]*padding-block:\s*var\(--card-space-solo-y,\s*var\(--card-space-shell-y,\s*var\(--card-space-inset\)\)\);/s,
    );
  });
});
