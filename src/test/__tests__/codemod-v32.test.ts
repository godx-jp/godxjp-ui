import { describe, expect, it } from "vitest";

// @ts-expect-error — plain .mjs script module, no types
import { transformSource } from "../../../scripts/codemod.mjs";

/** The v32 codemod (docs/migrations/v32.md): mechanical, idempotent, and it reports what it cannot decide. */
const APP = `import "@godxjp/ui/styles";
import { AppProvider } from "@godxjp/ui/app";

export function Root() {
  return <AppProvider persist={false}><App /></AppProvider>;
}
`;

describe("codemod v32", () => {
  it("adds the opt-in fonts after the styles import, in CSS and in JS (gh#1221)", () => {
    const css = transformSource(
      "app.css",
      `@import "tailwindcss";\n@import "@godxjp/ui/styles";\n`,
    );
    expect(css.out).toContain(
      `@import "@godxjp/ui/styles";\n@import "@godxjp/ui/styles/fonts.css";`,
    );
    const js = transformSource("main.tsx", APP);
    expect(js.out).toContain(`import "@godxjp/ui/styles";\nimport "@godxjp/ui/styles/fonts.css";`);
  });

  it("with --godx: the preset stylesheet, preset={godxPreset} and its import (gh#1220)", () => {
    const { out } = transformSource("main.tsx", APP, { godx: true });
    expect(out).toContain(`import "@godxjp/ui/themes/godx.css";`);
    expect(out).toContain("<AppProvider preset={godxPreset} persist={false}>");
    expect(out).toContain(`import { godxPreset } from "@godxjp/ui/themes/godx";`);
  });

  it("without --godx it changes no locale, but reports an AppProvider that relied on the vi default (gh#1219)", () => {
    const { out, notes } = transformSource("main.tsx", APP);
    expect(out).not.toContain("preset=");
    expect(out).not.toContain("defaultLocale=");
    expect(notes.join("\n")).toMatch(/no defaultLocale and no preset/);
  });

  it("leaves an AppProvider that already chose a locale or a preset alone", () => {
    const chosen = APP.replace("persist={false}", 'defaultLocale="ja" persist={false}');
    expect(transformSource("main.tsx", chosen).notes).toEqual([]);
    const preset = APP.replace("persist={false}", "preset={myPreset} persist={false}");
    expect(transformSource("main.tsx", preset, { godx: true }).out).not.toContain("godxPreset");
  });

  it("is idempotent: a second run changes nothing", () => {
    const once = transformSource("main.tsx", APP, { godx: true }).out;
    const twice = transformSource("main.tsx", once, { godx: true });
    expect(twice.changed).toBe(false);
    const cssOnce = transformSource("a.css", `@import "@godxjp/ui/styles";\n`, { godx: true }).out;
    expect(transformSource("a.css", cssOnce, { godx: true }).changed).toBe(false);
  });

  it("does not touch a file that does not use the styles entry or AppProvider", () => {
    const src = `import { Button } from "@godxjp/ui";\nexport const B = () => <Button>Go</Button>;\n`;
    expect(transformSource("b.tsx", src, { godx: true }).changed).toBe(false);
  });
});
