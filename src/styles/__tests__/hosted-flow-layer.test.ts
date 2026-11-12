/**
 * 33.30.2 — the hosted-flow rules (frosted auth bar, boxed code field, step bar, grouped radio list,
 * segmented progress, hero empty state, ErrorSurface's hosted shape, StepTransition) live in their
 * own layer: in `styles` and `styles/application`, NOT in `styles/core`, so a core consumer that
 * renders none of them does not ship them.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const styles = (file: string) => readFileSync(resolve(__dirname, "..", file), "utf8");
const imports = (file: string) =>
  [...styles(file).matchAll(/@import\s+"\.\/([\w-]+\.css)"/g)].map((m) => m[1]);
const CORE_LAYERS = imports("core.css").filter((f) => !f.startsWith("vendor"));
const HOSTED = [
  'data-appearance="boxed"',
  ".ui-steps-bar",
  ".ui-radio-list",
  ".ui-progress-step",
  ".ui-step-transition",
  '[data-variant="hero"]',
  '[data-bar="frosted"]',
  '.ui-error-surface[data-align="start"]',
];

describe("hosted-flow layer", () => {
  it("is imported by styles and styles/application, before icon-layout, and not by styles/core", () => {
    for (const entry of ["index.css", "application.css"]) {
      const list = imports(entry);
      expect(list, entry).toContain("hosted-flow-layout.css");
      expect(list.indexOf("hosted-flow-layout.css")).toBe(list.indexOf("icon-layout.css") - 1);
    }
    expect(imports("core.css")).not.toContain("hosted-flow-layout.css");
  });

  it("holds every hosted-flow selector, and no core layer still does", () => {
    const layer = styles("hosted-flow-layout.css");
    for (const selector of HOSTED) {
      expect(layer, selector).toContain(selector);
      for (const file of CORE_LAYERS) {
        expect(styles(file).includes(selector), `${file} still carries ${selector}`).toBe(false);
      }
    }
  });
});
