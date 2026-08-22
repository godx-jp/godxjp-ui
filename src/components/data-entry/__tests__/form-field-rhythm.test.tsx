import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
const formCss = read("../../../styles/form-layout.css");
const formCssFlat = formCss.replace(/\s+/g, "");
const formTokens = read("../../../tokens/components/form.css");

describe("Form field-to-field row rhythm (gh#295)", () => {
  it("no longer uses flex `gap` on .ui-form — gap only reaches DIRECT children, dead once Form wraps CardContent", () => {
    const uiFormBlock = formCss.slice(
      formCss.indexOf(".ui-form {"),
      formCss.indexOf(".ui-form > * + *"),
    );
    expect(uiFormBlock).not.toMatch(/gap:\s*var\(--space-4\)/);
  });

  it("carries block-to-block rhythm via margin on ANY direct child pair (e.g. CardContent -> CardFooter)", () => {
    expect(formCssFlat).toContain(".ui-form>*+*{margin-block-start:var(--form-block-gap);}");
    expect(formTokens).toMatch(/--form-block-gap:\s*var\(--space-4\)/);
  });

  it("carries field-to-field rhythm via a MORE SPECIFIC margin rule on adjacent FormFields", () => {
    expect(formCssFlat).toContain(
      ".ui-form-field+.ui-form-field{margin-block-start:var(--form-field-row-gap);}",
    );
    expect(formTokens).toMatch(/--form-field-row-gap:\s*var\(--space-3\)/);
  });

  it("mirrors Descriptions.Item's row rhythm — a static value and a real Descriptions block read the same everywhere", () => {
    const descriptionsTokens = read("../../../tokens/components/descriptions.css");
    // Both resolve to the SAME underlying --space-3 primitive, not independently-tuned literals
    // that could drift apart.
    expect(formTokens).toMatch(/--form-field-row-gap:\s*var\(--space-3\)/);
    expect(descriptionsTokens).toMatch(/--descriptions-row-gap:\s*var\(--space-3\)/);
  });

  it("the field rule beats the block rule by CSS specificity (two classes > one), not by source order", () => {
    // .ui-form-field + .ui-form-field = 2 class selectors (specificity 0,2,0)
    // .ui-form > * + *               = 1 class selector, universal selectors don't count (0,1,0)
    // Higher specificity wins regardless of where each rule sits in the stylesheet, so a
    // FormField that happens to be Form's own DIRECT child never double-counts both rules.
    const blockRuleSelector = ".ui-form > * + *";
    const fieldRuleSelector = ".ui-form-field + .ui-form-field";
    const blockClassCount = (blockRuleSelector.match(/\.[a-z-]+/g) ?? []).length;
    const fieldClassCount = (fieldRuleSelector.match(/\.[a-z-]+/g) ?? []).length;
    expect(fieldClassCount).toBeGreaterThan(blockClassCount);
  });
});

describe("--form-label-font-size", () => {
  /**
   * The label column is already re-tunable by width; a service whose grid was drawn around a
   * smaller label had no matching knob for the type and had to hand-write font-size per label.
   * The token has to reach Label's OWN element — Label sets `text-sm` on itself, so a
   * font-size inherited from the wrapper never applies.
   */
  it("is declared with the body size as its default", () => {
    expect(formTokens).toMatch(/--form-label-font-size:\s*var\(--text-sm\)/);
  });

  it("is applied on the label element itself, not an ancestor", () => {
    const source = read("../form-field.tsx");
    const labelTag = source.slice(source.indexOf("<Label"), source.indexOf("<Label") + 320);
    expect(labelTag).toContain("text-[length:var(--form-label-font-size)]");
  });
});
