/**
 * gh#712 — `Icon`, the one supported way to put a standalone glyph on the `--icon-size-*` scale.
 *
 * A lucide component ships `width="24" height="24"`, and only four rules in this library override
 * that (`.ui-button svg`, the menu row, the topbar cell, the ListRow leading slot). A consumer
 * measured 38 glyphs drawing at 24px beside 14px text, with no supported fix — `size-4` and
 * `w-[16px]` are what docs/CONSUMER-RULES.md §3/§8 forbid.
 *
 * jsdom does no layout and applies no author cascade, so the PIXELS are measured in Chromium (see
 * the issue for the run). What is pinned here is the contract that measurement depends on: the
 * markup the CSS keys off, the a11y switch, and that every step of the scale is declared and reads
 * a `--icon-size-*` token rather than a literal.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Lock, ShieldCheck } from "lucide-react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Button } from "../button";
import { Icon } from "../icon";
import { Text } from "../typography";
import { renderWithUi, screen } from "@/test/render";

const layout = readFileSync(resolve(__dirname, "../../../styles/icon-layout.css"), "utf8");

const STEPS = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const;

describe("Icon markup (gh#712)", () => {
  it("renders ONTO the glyph — the sized element is the <svg> itself", () => {
    const { container } = renderWithUi(<Icon as={Lock} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveClass("ui-icon");
    expect(svg).toHaveAttribute("data-slot", "icon");
    // No wrapper: a box around the glyph would enter every flex row that holds an icon, and would
    // put an element between Button and the `svg` its own rule targets.
    expect(container.firstElementChild).toBe(svg);
  });

  it.each(STEPS)("stamps data-size=%s, the attribute the sizing rule reads", (size) => {
    const { container } = renderWithUi(<Icon as={Lock} size={size} />);
    expect(container.querySelector("svg")).toHaveAttribute("data-size", size);
  });

  it("defaults to the md step — 16px, 'the default icon step'", () => {
    const { container } = renderWithUi(<Icon as={Lock} />);
    expect(container.querySelector("svg")).toHaveAttribute("data-size", "md");
  });

  it("is aria-hidden by default — a glyph beside a visible label announces nothing", () => {
    const { container } = renderWithUi(<Icon as={Lock} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
    expect(svg).not.toHaveAttribute("aria-label");
  });

  it("with a label it becomes a NAMED graphic — role=img + that name, and not hidden", () => {
    renderWithUi(<Icon as={ShieldCheck} label="二要素認証は有効です" />);
    const img = screen.getByRole("img", { name: "二要素認証は有効です" });
    expect(img.tagName.toLowerCase()).toBe("svg");
    expect(img).not.toHaveAttribute("aria-hidden");
  });

  it("treats an empty label as absent — '' is not an accessible name", () => {
    const { container } = renderWithUi(<Icon as={Lock} label="" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("stamps tone only when asked, so the resting glyph inherits currentColor", () => {
    const { container: bare } = renderWithUi(<Icon as={Lock} />);
    expect(bare.querySelector("svg")).not.toHaveAttribute("data-tone");
    const { container: toned } = renderWithUi(<Icon as={Lock} tone="muted" />);
    expect(toned.querySelector("svg")).toHaveAttribute("data-tone", "muted");
  });

  it("forwards ref to the glyph and merges className", () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = renderWithUi(<Icon as={Lock} ref={ref} className="extra" />);
    expect(ref.current).toBe(container.querySelector("svg"));
    expect(ref.current).toHaveClass("ui-icon", "extra");
  });

  it("composes inside Text and inside Button without changing either", () => {
    const { container } = renderWithUi(
      <Text size="sm">
        <Icon as={Lock} size="sm" /> 暗号化済み
      </Text>,
    );
    const svg = container.querySelector("svg");
    expect(svg?.parentElement).toHaveAttribute("data-slot", "text");
    expect(svg).toHaveAttribute("data-size", "sm");

    renderWithUi(
      <Button size="sm">
        <Icon as={Lock} size="lg" />
        書き出す
      </Button>,
    );
    const button = screen.getByRole("button", { name: "書き出す" });
    // The glyph stays a DIRECT child of the button, so `.ui-button svg` still applies — the step
    // wins on specificity (measured 20px in Chromium), not by breaking the button's own rule.
    expect(button.querySelector(":scope > svg")).toHaveAttribute("data-size", "lg");
  });
});

describe("Icon sizing rule (gh#712)", () => {
  it("declares all nine steps, each reading a scale token rather than a literal", () => {
    for (const step of STEPS) {
      const rule = new RegExp(
        `\\.ui-icon\\[data-size="${step}"\\]\\s*\\{\\s*--icon-glyph-size:\\s*var\\(\\s*--icon-size-${step}\\);`,
      );
      expect(layout, `${step} must read var(--icon-size-${step})`).toMatch(rule);
    }
    // Nothing on the icon axis may bake a length — that is what keeps the tier-2 escape hatch
    // (an inline `--icon-glyph-size` at the call site) reachable. See docs/TOKENS.md.
    expect(layout).not.toMatch(/(?:inline-size|block-size|width|height):\s*[\d.]+(?:rem|px|em)/);
  });

  it("qualifies the box rule three ways, which is what out-ranks every context rule", () => {
    // (0,3,1). `.ui-button svg` and the menu/topbar rules are (0,1,1); the ListRow leading rule is
    // (0,3,1) because of its `:not([class*="size-"])`, and THAT tie is broken by import order.
    expect(layout).toMatch(/svg\.ui-icon\[data-slot="icon"\]\s*\{/);
    for (const entry of ["index.css", "core.css"]) {
      const css = readFileSync(resolve(__dirname, `../../../styles/${entry}`), "utf8");
      const imports = [...css.matchAll(/@import "\.\/([\w-]+\.css)"/g)].map((m) => m[1]);
      expect(imports[imports.length - 1], `${entry} must import icon-layout.css LAST`).toBe(
        "icon-layout.css",
      );
    }
  });
});
