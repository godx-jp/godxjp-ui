import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

const TRIGGERS = [
  "components/data-entry/cascader.tsx",
  "components/data-entry/tree-select.tsx",
  "components/data-entry/search-select.tsx",
  "components/data-entry/select.tsx",
] as const;

describe("picker triggers all sit on the control chrome (gh#348)", () => {
  // Two spellings satisfy the SAME contract — the chrome comes from lib/control-styles, never
  // hand-rolled at the call site. `controlSurfaceTriggerClass` is `controlTriggerClass` with the
  // border/background utilities withheld so the antd `variant` × `status` matrix in control.css can
  // own the surface; a utility there would outrank every `[data-variant]` rule (gh#366).
  it.each(TRIGGERS)("%s uses a control-styles trigger class", (file) => {
    expect(read(`src/${file}`)).toMatch(/\b(controlTriggerClass|controlSurfaceTriggerClass)\b/);
  });

  it.each(TRIGGERS)("%s takes its surface from tokens, not from border/bg utilities", (file) => {
    const source = read(`src/${file}`);
    if (!source.includes("controlSurfaceTriggerClass")) return;
    // The withheld pair must not creep back in on the trigger's own class list.
    expect(source).not.toMatch(/["'`][^"'`]*\bborder-input\b/);
    expect(source).not.toMatch(/["'`][^"'`]*\bbg-background\b/);
  });

  it.each(TRIGGERS.slice(0, 3))("%s no longer wears the button chrome", (file) => {
    const source = read(`src/${file}`);
    // A Button would bring .ui-button: its own border, shadow, radius and 2px solid focus ring.
    expect(source).not.toContain('variant="outline"');
    expect(source).not.toContain('from "../general/button"');
  });

  it("a trigger reads the control tokens, never the button ones", () => {
    const styles = read("src/styles/control.css");
    const trigger = styles.match(/\.ui-control-trigger\s*\{[^}]*\}/)?.[0] ?? "";
    expect(trigger).toContain("cursor: pointer");
    const control = styles.match(/\n {2}\.ui-control \{[^}]*\}/)?.[0] ?? "";
    expect(control).toContain("var(--control-border-width)");
    expect(control).toContain("var(--control-shadow)");
  });

  it("a choice mark keeps its own border knob, separate from the control one", () => {
    expect(read("src/tokens/components/control.css")).toContain("--checkbox-border-width:");
    const mark =
      read("src/styles/control.css").match(/\.ui-checkbox,\s*\n\s*\.ui-radio\s*\{[^}]*\}/)?.[0] ??
      "";
    expect(mark).toContain("var(--checkbox-border-width)");
    expect(mark).not.toContain("var(--control-border-width)");
  });
});
