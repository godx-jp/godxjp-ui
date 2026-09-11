import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Inside `MobileShell`, EVERY size of control follows the shell's touch tier — not just the default.
 *
 * Measured in Chromium at 393px before the fix: with the shell's `--control-height` at 44px, a
 * `size="sm"` Button was 28px, `size="lg"` 36px (smaller than the default beside it), `size="xs"`
 * 24px, `icon-sm` 28px, a `size="sm"` Segmented item 24px. gino-cloud's `/ui-review` found it.
 *
 * The cause is WHERE the ladder is declared, which is also why this test reads declarations rather
 * than resolving values: `--control-height-sm` is a `calc()` over `--control-height`, substituted at
 * the element that DECLARES it and inherited as a frozen length. A resolver that substitutes lazily
 * at the leaf (as `css-token-resolve` does) computes 40px with or without the fix, so it cannot see
 * the defect. The pixels are measured in Chromium; this pins the two facts they rest on.
 */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const shell = stripComments(
  readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8"),
);
const controlTokens = stripComments(
  readFileSync(resolve(process.cwd(), "src/tokens/components/control.css"), "utf8"),
);

/** The declarations of the first rule whose selector is exactly `selector`. */
function ruleBody(css: string, selector: string): string {
  const match = new RegExp(
    `(?:^|[}\\s])${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^{}]*)\\}`,
  ).exec(css);
  expect(match, `rule not found: ${selector}`).not.toBeNull();
  return match![1];
}

/** Every `:root` block in `css`, joined — a token file declares several. */
function allRootBodies(css: string): string {
  return [...css.matchAll(/(?:^|[}\s]):root\s*\{([^{}]*)\}/g)].map((m) => m[1]).join("\n");
}

function declared(body: string, token: string): string | undefined {
  return new RegExp(`${token}:\\s*([^;]+);`).exec(body)?.[1].replace(/\s+/g, " ").trim();
}

const controlStyles = stripComments(
  readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8"),
);

const STEPS = ["--control-height-sm", "--control-height-lg", "--control-height-xs"] as const;

describe("MobileShell — the control ladder follows the shell's tier", () => {
  const shellRule = ruleBody(shell, ".ui-mobile-shell");
  const rootRule = () => ruleBody(controlTokens, ":root");

  it("rebinds the tier on the shell root", () => {
    expect(declared(shellRule, "--control-height")).toBe("var(--mobile-shell-control-height)");
  });

  it.each(STEPS)(
    "re-declares %s on the same element, so it re-resolves against the tier",
    (step) => {
      expect(
        declared(shellRule, step),
        `${step} is not declared on .ui-mobile-shell`,
      ).toBeDefined();
    },
  );

  it.each(STEPS)("uses the :root formula for %s byte for byte — the two cannot drift", (step) => {
    expect(declared(rootRule(), step)).toBeDefined();
    expect(declared(shellRule, step)).toBe(declared(rootRule(), step));
  });
  /**
   * The same freeze, one level down: `--button-xs-height: var(--control-height-xs)` at :root was
   * substituted there (24px), so re-declaring the ladder on the shell never reached `size="xs"`.
   * Measured: every other size moved to the touch ladder and `xs` stayed 24px.
   */
  it("reads the xs Button's height from the live ladder step at the button, not a :root alias", () => {
    expect(ruleBody(controlStyles, ".ui-button--xs")).toMatch(
      /height:\s*var\(--button-xs-height,\s*var\(--control-height-xs\)\);/,
    );
    expect(declared(allRootBodies(controlTokens), "--button-xs-height")).toBe("initial");
  });
});
