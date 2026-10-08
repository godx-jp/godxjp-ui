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

describe("codemod v32 renames and moves (gh#1223)", () => {
  it("merges a renamed component into an existing import of the target and renames JSX", () => {
    const src = `import { Alert, Banner } from "@godxjp/ui/feedback";\nexport const A = () => <><Alert /><Banner title="x" /></>;\n`;
    const { out, notes } = transformSource("a.tsx", src);
    expect(out).toContain('import { Alert } from "@godxjp/ui/feedback";');
    expect(out).not.toContain("Banner");
    expect(out).toContain('<Alert title="x" />');
    expect(notes.join("\n")).toMatch(/variant="banner"/);
  });

  it("renames compound members (Callout.Title → Alert.Title) and keeps an alias", () => {
    const src = `import { Callout, HoverCard as HC } from "@godxjp/ui";\nexport const A = () => <><Callout><Callout.Title>t</Callout.Title></Callout><HC /></>;\n`;
    const { out } = transformSource("a.tsx", src);
    expect(out).toContain("<Alert><Alert.Title>t</Alert.Title></Alert>");
    expect(out).toContain("Popover as HC");
    expect(out).toContain("<HC />");
  });

  it("moves lab and chat components to their new packages, keeping the rest in place", () => {
    const src = `import { Card, Carousel, ChatBubble } from "@godxjp/ui/data-display";\n`;
    const { out } = transformSource("a.tsx", src);
    expect(out).toContain('import { Card } from "@godxjp/ui/data-display";');
    expect(out).toContain('import { Carousel } from "@godxjp/ui/lab";');
    expect(out).toContain('import { ChatBubble } from "@godxjp/chat";');
  });

  it("keeps type-only imports type-only, and reports removed parts without rewriting them", () => {
    const src = `import type { SpaceCompactProp } from "@godxjp/ui/layout";\nimport { SkeletonAvatar, Skeleton } from "@godxjp/ui/feedback";\n`;
    const { out, notes } = transformSource("a.tsx", src);
    expect(out).toContain("SkeletonAvatar");
    expect(notes.join("\n")).toMatch(/SkeletonAvatar was removed/);
  });

  it("does not touch a same-named export of another package", () => {
    const src = `import { Banner } from "some-other-lib";\nexport const A = () => <Banner />;\n`;
    expect(transformSource("a.tsx", src).changed).toBe(false);
  });

  it("is idempotent after renames", () => {
    const src = `import { Banner, TagInput } from "@godxjp/ui";\nexport const A = () => <><Banner /><TagInput /></>;\n`;
    const once = transformSource("a.tsx", src).out;
    expect(transformSource("a.tsx", once).changed).toBe(false);
  });
});
