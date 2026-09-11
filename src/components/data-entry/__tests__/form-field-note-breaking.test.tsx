import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { FormField } from "../form-field";
import { Input } from "../input";

/**
 * A FIELD'S TWO PROSE LINES BREAK AT JAPANESE PHRASE BOUNDARIES, NOT BETWEEN ANY TWO CHARACTERS.
 *
 * Default CJK line breaking may break almost anywhere, so a Japanese helper is cut mid-word at
 * nearly every measure. Measured in Chromium on /isolate/data-entry-form-field-index, one helper
 * at a form-column measure:
 *
 *   180px  default 「監査報告は省令様式第8号で提｜出してください」  →  auto-phrase 「…第8号で｜提出してください」
 *   220px  default 「…第8号で提出してく｜ださい」                →  auto-phrase 「…第8号で｜提出してください」
 *
 * WHAT THIS FILE DOES NOT ASSERT, on purpose: where the lines actually fall. That is the browser's
 * phrase segmenter, it differs by Chrome version, and a gate on its output would be a gate on
 * someone else's data file — it would go red on a UA update that changed nothing here. The
 * measurements above are the evidence; what has to stay true in THIS repo is that the declaration
 * exists and that both prose nodes carry it. A class on one and not the other is the realistic
 * regression: the two `<p>`s are built in different branches of the same component.
 */
const FORM_CSS = readFileSync(join(__dirname, "../../../styles/form-layout.css"), "utf8");

describe("FormField — helper and error break as Japanese", () => {
  it("declares phrase-based breaking once, on a class both nodes can carry", () => {
    const rule = FORM_CSS.match(/\.ui-form-field-note\s*\{([^}]*)\}/);
    expect(rule, ".ui-form-field-note rule not found in form-layout.css").not.toBeNull();
    expect(rule![1]).toMatch(/word-break:\s*auto-phrase;/);
  });

  it("puts the class on the helper", () => {
    renderWithUi(
      <FormField label="監査報告" helper="監査報告は省令様式第8号で提出してください">
        <Input />
      </FormField>,
    );
    const helper = screen.getByText("監査報告は省令様式第8号で提出してください");
    expect(helper.className).toContain("ui-form-field-note");
  });

  it("puts the class on the error message too", () => {
    // The error `<p>` is built in a different branch from the helper `<p>`, which is exactly how
    // one of them would come to be styled and the other not.
    renderWithUi(
      <FormField label="監査報告" error="省令様式第8号の添付がありません">
        <Input />
      </FormField>,
    );
    const error = screen.getByText("省令様式第8号の添付がありません");
    expect(error.className).toContain("ui-form-field-note");
    expect(error.getAttribute("role")).toBe("alert");
  });

  it("keeps both prose nodes when helper and error coexist", () => {
    renderWithUi(
      <FormField label="監査報告" helper="様式は省令様式第8号" error="添付がありません">
        <Input />
      </FormField>,
    );
    const notes = document.querySelectorAll("p.ui-form-field-note");
    expect(notes).toHaveLength(2);
  });
});
