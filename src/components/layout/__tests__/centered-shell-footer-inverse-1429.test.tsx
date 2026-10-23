/**
 * gh#1429 — `CenteredShell footerTone="inverse"`: the footer as a brand band.
 *
 * Before: the public-landing footer was transparent and every kit child inside it read the page's
 * text roles, so a site whose footer is a dark brand band (ivory text, light links) could not be
 * built without a className — which the consumer cannot set, and which `ThemeScope` also needs.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CenteredShell } from "../centered-shell";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
const shellCss = read("../../../styles/shell-layout.css");
const shellTokens = read("../../../tokens/components/shell.css");

const footerOf = (container: HTMLElement) =>
  container.querySelector("footer.ui-centered-shell-footer")!;
const rule = (selector: string) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Every rule with exactly this selector, joined (a selector may be declared more than once).
  const bodies = [...shellCss.matchAll(new RegExp(`(?:^|[\\s}])${esc}\\s*\\{([^}]*)\\}`, "g"))].map(
    (m) => m[1],
  );
  return bodies.length ? bodies.join("\n") : null;
};

describe("CenteredShell footerTone (gh#1429)", () => {
  it('stamps data-tone="inverse" on the footer only when asked', () => {
    const inverse = render(
      <CenteredShell preset="public-landing" footer="© TCG-M" footerTone="inverse">
        本文
      </CenteredShell>,
    );
    expect(footerOf(inverse.container)).toHaveAttribute("data-tone", "inverse");

    const plain = render(<CenteredShell footer="© TCG-M">本文</CenteredShell>);
    expect(footerOf(plain.container)).not.toHaveAttribute("data-tone");
  });

  it("paints the band and re-points the text roles inside it, defaulting to the page's ink and canvas", () => {
    const band = rule('.ui-centered-shell-footer[data-tone="inverse"]');
    expect(band, "an inverse footer rule").not.toBeNull();
    expect(band).toMatch(
      /background:\s*hsl\(\s*var\(--centered-shell-footer-inverse-background,\s*var\(--centered-shell-page-ink\)\)\s*\)/,
    );
    for (const role of ["foreground", "muted-foreground", "border"]) {
      expect(band).toMatch(
        new RegExp(
          `--${role}:\\s*var\\(\\s*--centered-shell-footer-inverse-${role},\\s*var\\(--centered-shell-page-canvas\\)\\s*\\)`,
        ),
      );
    }
    expect(band).toMatch(/--text-link:\s*var\(--centered-shell-footer-inverse-link-color,/);
    expect(band).toMatch(/color:\s*hsl\(var\(--foreground\)\)/);
  });

  it("captures the page's ink and canvas on the shell, where the footer cannot overwrite them", () => {
    const capture = rule(".ui-centered-shell");
    expect(capture).toMatch(/--centered-shell-page-ink:\s*var\(--foreground\)/);
    expect(capture).toMatch(/--centered-shell-page-canvas:\s*var\(--background\)/);
  });

  it("declares the five knobs as role mirrors (initial)", () => {
    for (const knob of ["background", "foreground", "muted-foreground", "border", "link-color"]) {
      expect(shellTokens).toMatch(
        new RegExp(`--centered-shell-footer-inverse-${knob}:\\s*initial;`),
      );
    }
  });
});
