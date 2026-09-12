import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A CHART LEGEND'S LABEL IS PROSE. recharts paints it in the SERIES colour, inline.
 *
 * `chart-layout.css` has set `.recharts-legend-item-text { color: hsl(var(--muted-foreground)) }`
 * since it was written, and it had never applied to a single legend in any consumer: recharts
 * writes the series colour as an INLINE STYLE on the label span —
 * `style="color: rgb(68, 136, 197); white-space: normal; …"` — and an inline style outranks every
 * stylesheet rule regardless of specificity. The axis half of that same selector DOES work, because
 * `.recharts-text` is SVG and recharts sets `fill` as a presentation attribute, which CSS beats.
 * One selector, two upstream mechanisms, and only one of them was ever reachable.
 *
 * Measured in Chromium on a real consumer screen — godx-task `/projects/PKG`, the project-home
 * status donut, 12.47px labels:
 *
 *   未対応    #ed8077 → 2.59:1      処理中    #4488c5 → 3.70:1
 *   処理済み  #5eb5a6 → 2.39:1      完了      #a1af2f → 2.37:1
 *
 * all four under AA, on every donut, pie and cartesian legend this library renders. A series colour
 * is a FILL, tuned to be a slice with nothing written on it; read as ink it fails. Same tier
 * confusion as gh#610 and gh#612, one layer out. After the fix, 13 legend labels on
 * `/isolate/data-display-charts` all compute to `rgb(104, 102, 94)` at 5.65:1.
 *
 * WHY IT SURVIVED, and the part worth keeping: `showLegend` defaults to TRUE, so every consumer
 * gets a legend — and every `showLegend` in this repo's own docs is `false`. Six occurrences, none
 * true. The legend had never been rendered by any route in the library, so nothing could have
 * measured it. The second test below is the one that keeps that from happening again.
 */
describe("chart legend label reads the text tier, not the series colour", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/chart-layout.css"), "utf8");

  it("overrides the inline series colour — nothing weaker can", () => {
    const rules = css.match(/\.ui-chart \.recharts-legend-item-text\s*\{[^}]*\}/g) ?? [];
    expect(rules.length, "no rule targets the legend label").toBeGreaterThan(0);
    const wins = rules.some((r) => /color:\s*hsl\(var\(--muted-foreground\)\)\s*!important/.test(r));
    expect(
      wins,
      "recharts sets the label colour inline; without !important this rule never applies",
    ).toBe(true);
  });

  it("does not force the AXIS colour — that half already wins on its own", () => {
    // `.recharts-text` is SVG with `fill` as a presentation attribute, which CSS already beats.
    // Blanket `!important` there would be cargo-culting the fix rather than answering the cause.
    const axis = css.match(/\.ui-chart \.recharts-text[^{]*\{[^}]*\}/g)?.join("\n") ?? "";
    expect(axis).toContain("fill: hsl(var(--muted-foreground))");
    expect(axis).not.toContain("!important");
  });

  it("at least one docs route RENDERS a legend, or none of this is measurable", () => {
    /*
     * The defect's real cause. `showLegend` defaults to true, so consumers see a legend the
     * library's own routes never drew: every occurrence in docs/ was `showLegend={false}`. A
     * default that no example exercises is a default nothing measures — the same hole gh#612's
     * three surfaces were.
     *
     * An example that OMITS `showLegend` counts: the default is what consumers get, and the
     * default is what went unmeasured.
     */
    const docs: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(join(process.cwd(), dir), { withFileTypes: true })) {
        const rel = `${dir}/${entry.name}`;
        if (entry.isDirectory()) walk(rel);
        else if (/\.tsx$/.test(entry.name)) docs.push(rel);
      }
    };
    walk("docs");

    const renders = docs.filter((file) => {
      const src = readFileSync(join(process.cwd(), file), "utf8");
      // A chart element whose props do not turn the legend off.
      return [...src.matchAll(/<(?:Pie|Bar|Line|Area)Chart\b([\s\S]*?)\/>/g)].some(
        (m) => !/showLegend=\{false\}/.test(m[1]!),
      );
    });

    expect(
      renders,
      "no docs example renders a chart legend, so the library cannot see its own default",
    ).not.toHaveLength(0);
  });
});
