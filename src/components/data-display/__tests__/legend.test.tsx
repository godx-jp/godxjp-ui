import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";

import { Legend } from "../legend";

const ITEMS = [
  { tone: "destructive", label: "期限超過" },
  { tone: "warning", label: "期限間近" },
  { tone: "success", label: "対応済" },
] as const;

/**
 * Legend — the key that lets a colour-coded surface satisfy WCAG 1.4.1.
 *
 * The consumer move it replaces was a `Badge` per key, which says the right words in the wrong
 * shape (a chip you could click), or a hand-rolled 10px square, which `ui-audit` blocks three ways
 * at once: no-hand-rolled-surface, no-arbitrary-hex, no-arbitrary-size.
 */
describe("Legend", () => {
  it("is a list of the labels — the words, in order", () => {
    render(<Legend items={[...ITEMS]} />);

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "期限超過",
      "期限間近",
      "対応済",
    ]);
  });

  it("draws one swatch per key, in the tone that key explains", () => {
    const { container } = render(<Legend items={[...ITEMS]} />);
    const tones = [...container.querySelectorAll(".ui-legend-swatch")].map((swatch) =>
      swatch.getAttribute("data-tone"),
    );

    expect(tones).toEqual(["destructive", "warning", "success"]);
  });

  /**
   * The swatch carries no information the label does not. Announcing it would make a screen reader
   * say the key twice — and there is nothing useful for it to say about a coloured square.
   */
  it("hides the swatch from assistive tech", () => {
    const { container } = render(<Legend items={[...ITEMS]} />);

    for (const swatch of container.querySelectorAll(".ui-legend-swatch")) {
      expect(swatch).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("accepts a name so a key can say what it is a key FOR", () => {
    render(<Legend items={[...ITEMS]} aria-label="コンプライアンス状況の凡例" />);

    expect(screen.getByRole("list")).toHaveAccessibleName("コンプライアンス状況の凡例");
  });

  /**
   * Read from the stylesheet: every tone in the vocabulary needs a fill, or a legend drawn in a
   * tone nobody tested is an invisible swatch next to a label — the failure the component exists
   * to prevent, in its own markup.
   */
  it("the stylesheet fills a swatch for every tone in the vocabulary", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");

    for (const tone of ["default", "success", "warning", "destructive", "info", "muted", "neutral"]) {
      expect(css).toMatch(new RegExp(`\\.ui-legend-swatch\\[data-tone="${tone}"\\]`));
    }
  });

  /** A square, not a pill: the mark is a SAMPLE of the bar's colour, not a chip. */
  it("the swatch takes its size and corner from the tokens", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
    const scoped = css.match(/\.ui-legend-swatch\s*\{[^}]*\}/)?.[0] ?? "";

    expect(scoped).toMatch(/inline-size:\s*var\(--legend-swatch-size\)/);
    expect(scoped).toMatch(/block-size:\s*var\(--legend-swatch-size\)/);
    expect(scoped).toMatch(/border-radius:\s*var\(--legend-swatch-radius\)/);
  });
});
