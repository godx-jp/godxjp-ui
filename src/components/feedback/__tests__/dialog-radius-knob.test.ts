/**
 * `--dialog-radius` — the corner of the dialog panel as its own knob. Consumer report (TCG-M): the
 * brand rounds cards at 8px and dialogs at 16px. The panel read `--radius-lg` → `--radius`, which
 * also sizes every control and card, so the only routes were a selector into `[data-slot="dialog-content"]`
 * or moving every control's radius with it.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");

describe("--dialog-radius", () => {
  it("the panel reads the knob, keeping the previous default as the fallback", () => {
    expect(read("../../../styles/dialog-layout.css")).toContain(
      "border-radius: var(--dialog-radius, var(--radius-lg, var(--radius)));",
    );
  });

  it("is declared `initial`, so the default resolves at the call site", () => {
    expect(read("../../../tokens/components/feedback.css")).toMatch(/--dialog-radius: initial;/);
  });
});
