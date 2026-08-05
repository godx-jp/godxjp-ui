import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CenteredShell } from "../centered-shell";
import { Flex } from "../flex";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
const shellCss = read("../../../styles/shell-layout.css");
const layoutCss = read("../../../styles/layout.css");
const shellTokens = read("../../../tokens/components/shell.css");

const shell = (container: HTMLElement) => container.querySelector('[data-slot="centered-shell"]')!;

describe("CenteredShell public-landing preset (gh#252)", () => {
  it("stays un-preset by default so every existing shell keeps its exact box", () => {
    const { container } = render(<CenteredShell>本文</CenteredShell>);

    expect(shell(container)).not.toHaveAttribute("data-preset");
  });

  it('preset="default" is a no-op that emits no attribute', () => {
    const { container } = render(<CenteredShell preset="default">本文</CenteredShell>);

    expect(shell(container)).not.toHaveAttribute("data-preset");
  });

  it("emits the attribute only for a real preset", () => {
    const { container } = render(<CenteredShell preset="public-landing">本文</CenteredShell>);

    expect(shell(container)).toHaveAttribute("data-preset", "public-landing");
  });

  it("never makes the default a selector — the inert-default contract (gh#231)", () => {
    expect(shellCss).not.toMatch(/\.ui-centered-shell\[data-preset="default"\]/);
  });

  it("owns the landing geometry through service-themeable tokens only", () => {
    for (const token of [
      "--centered-shell-landing-max-width",
      "--centered-shell-landing-inset-inline",
      "--centered-shell-landing-main-padding-block",
      "--centered-shell-landing-section-gap",
      "--centered-shell-landing-footer-padding-block",
      "--centered-shell-landing-card-shadow",
      "--centered-shell-landing-heading-size",
    ]) {
      expect(shellTokens).toContain(`${token}:`);
      expect(shellCss).toContain(`var(${token})`);
    }
  });

  it("declares the background knob `initial` with the role default at the call site", () => {
    // docs/TOKENS.md · role-mirror knobs: a `:root` binding would freeze at the :root role value
    // and a scoped [data-tenant]/.dark override of --background would never reach the landing.
    expect(shellTokens).toMatch(/--centered-shell-landing-background:\s*initial;/);
    expect(shellCss).toContain("hsl(var(--centered-shell-landing-background, var(--background)))");
  });

  it("shares ONE measure between the header bar, the column and the footer", () => {
    const barRule =
      shellCss.match(
        /\.ui-centered-shell\[data-preset="public-landing"\] \.ui-centered-shell-bar,[\s\S]*?\}/,
      )?.[0] ?? "";
    expect(barRule).toContain("--centered-shell-landing-max-width");
    expect(barRule).toContain("--centered-shell-landing-inset-inline");
    const columnRule =
      shellCss.match(
        /\.ui-centered-shell\[data-preset="public-landing"\] \.ui-centered-shell-column\s*\{[^}]*\}/,
      )?.[0] ?? "";
    expect(columnRule).toContain("max-width: var(--centered-shell-landing-max-width)");
    expect(columnRule).toContain("gap: var(--centered-shell-landing-section-gap)");
  });

  it("contains no literal geometry in the preset rules", () => {
    const presetRules = shellCss.slice(shellCss.indexOf('[data-preset="public-landing"]'));
    expect(presetRules).not.toMatch(/:\s*[\d.]+(px|rem|em)\b/);
  });
});

describe("Flex responsive region visibility (gh#252)", () => {
  it("emits no visibility attribute by default", () => {
    const { container } = render(<Flex>操作</Flex>);
    const flex = container.querySelector(".ui-flex")!;

    expect(flex).not.toHaveAttribute("data-hide-below");
    expect(flex).not.toHaveAttribute("data-hide-from");
  });

  it("reflects both steps as data attributes", () => {
    const { container } = render(
      <>
        <Flex hideBelow="md">ナビゲーション</Flex>
        <Flex hideFrom="md">メニュー</Flex>
      </>,
    );

    expect(container.querySelector('[data-hide-below="md"]')).toBeInTheDocument();
    expect(container.querySelector('[data-hide-from="md"]')).toBeInTheDocument();
  });

  it("hides only at the canonical package breakpoint steps", () => {
    // The same scale as --master-detail-collapse-below; a media query cannot read a var().
    for (const [step, width] of [
      ["sm", "40rem"],
      ["md", "48rem"],
      ["lg", "64rem"],
      ["xl", "80rem"],
    ] as const) {
      expect(layoutCss).toMatch(
        new RegExp(
          `@media \\(width < ${width}\\) \\{\\s*\\.ui-flex\\[data-hide-below="${step}"\\]`,
        ),
      );
      expect(layoutCss).toMatch(
        new RegExp(
          `@media \\(width >= ${width}\\) \\{\\s*\\.ui-flex\\[data-hide-from="${step}"\\]`,
        ),
      );
    }
  });

  it("never styles an unset Flex — the inert-default contract (gh#231)", () => {
    expect(layoutCss).not.toMatch(/\.ui-flex\[data-hide-below\]\s*\{/);
    expect(layoutCss).not.toMatch(/\.ui-flex\[data-hide-from\]\s*\{/);
    expect(layoutCss).not.toMatch(/data-hide-below="(?:false|none|auto)"/);
  });
});
