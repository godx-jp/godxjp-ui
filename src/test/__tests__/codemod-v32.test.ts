import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it, vi } from "vitest";

// @ts-expect-error — plain .mjs script module, no types
import { run, transformSource } from "../../../scripts/codemod.mjs";

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
    // The merge's own prop is written onto the element, not left as a note.
    expect(out).toContain('<Alert variant="banner" title="x" />');
    expect(notes).toEqual([]);
  });

  it("renames compound members (Callout.Title → Alert.Title) and keeps an alias", () => {
    const src = `import { Callout, HoverCard as HC } from "@godxjp/ui";\nexport const A = () => <><Callout><Callout.Title>t</Callout.Title></Callout><HC /></>;\n`;
    const { out } = transformSource("a.tsx", src);
    expect(out).toContain('<Alert variant="callout"><Alert.Title>t</Alert.Title></Alert>');
    expect(out).toContain("Popover as HC");
    // gh#1327: the alias is the Popover binding now, so it gets HoverCard's openOn too.
    expect(out).toContain('<HC openOn="hover" />');
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

  it("writes the merge props: maps AuthShell canonical, adds booleans and expressions, never duplicates", () => {
    const src = [
      'import { AuthShell, SpaceCompact } from "@godxjp/ui/layout";',
      'import { TagInput } from "@godxjp/ui/data-entry";',
      "export const A = () => (",
      "  <>",
      '    <AuthShell title="t">x</AuthShell>',
      '    <AuthShell variant="canonical" title="t">x</AuthShell>',
      "    <SpaceCompact><b /></SpaceCompact>",
      "    <TagInput value={v} />",
      '    <TagInput mode="tags" />',
      "  </>",
      ");",
    ].join("\n");
    const { out, notes } = transformSource("a.tsx", src);
    expect(out).toContain('<CenteredShell variant="auth" title="t">x</CenteredShell>');
    expect(out).toContain('<CenteredShell variant="auth-canonical" title="t">x</CenteredShell>');
    expect(out).toContain("<Flex attached><b /></Flex>");
    expect(out).toContain('<Select open={false} mode="tags" value={v} />');
    // An element that already carries the prop keeps its own value.
    expect(out).toContain('<Select open={false} mode="tags" />');
    expect(out).not.toMatch(/mode="tags"[^>]*mode=/);
    expect(notes.join("\n")).toMatch(/Select takes no ref/);
    expect(transformSource("a.tsx", out).changed).toBe(false);
  });

  it("narrows AppLocale to BuiltInLocale under --godx, and only reports it otherwise (gh#1219)", () => {
    const src = `import { useAppLocale, type AppLocale } from "@godxjp/ui/app";\nconst copy = { ja: "a", en: "b", vi: "c" };\nexport const f = (l: string) => copy[l as AppLocale];\n`;
    const godx = transformSource("a.tsx", src, { godx: true });
    expect(godx.out).toContain("type BuiltInLocale }");
    expect(godx.out).toContain("copy[l as BuiltInLocale]");
    expect(godx.out).not.toMatch(/\bAppLocale\b/);
    const plain = transformSource("a.tsx", src);
    expect(plain.out).toContain("AppLocale");
    expect(plain.notes.join("\n")).toMatch(/BuiltInLocale/);
    expect(transformSource("a.tsx", godx.out, { godx: true }).changed).toBe(false);
  });
});

describe("codemod v32 move table is complete (gh#1223)", () => {
  // Measured miss: the first table moved the chat COMPONENTS but not their prop types, so a
  // consumer's `import { type ChatMessageProp } from "@godxjp/ui/data-display"` (Platform's Dock)
  // still broke after the codemod. Every name the new homes export must have a move entry.
  const exported = (file: string) => {
    const src = readFileSync(file, "utf8");
    const out = new Set<string>();
    for (const m of src.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g))
      for (const p of m[1].split(",")) {
        const n = p
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)
          .pop()!
          .trim();
        if (n) out.add(n);
      }
    return out;
  };

  it("covers every export of @godxjp/chat and @godxjp/ui/lab, and each target really exports it", async () => {
    // @ts-expect-error — plain .mjs script module, no types
    const { RENAMES } = await import("../../../scripts/codemod.mjs");
    const moves = new Map<string, string>(
      (RENAMES as { from: [string[], string]; to: [string, string] }[]).map((r) => [
        r.to[1],
        r.to[0],
      ]),
    );
    for (const [file, mod] of [
      ["packages/chat/src/index.ts", "@godxjp/chat"],
      ["src/lab/index.ts", "@godxjp/ui/lab"],
    ] as const) {
      const names = exported(file);
      const missing = [...names].filter((n) => moves.get(n) !== mod);
      expect(missing, `${mod} exports with no codemod move`).toEqual([]);
    }
  });
});

describe("codemod v32 --godx imports the fonts once (gh#1228)", () => {
  it("adds only godx.css after styles (it already carries the fonts)", () => {
    const { out } = transformSource("a.css", '@import "@godxjp/ui/styles";\n', { godx: true });
    expect(out).toContain('@import "@godxjp/ui/themes/godx.css";');
    expect(out).not.toContain("styles/fonts");
  });

  it("adds the font-free godx-tokens.css after styles/core (the Dock's shadow root)", () => {
    const { out } = transformSource("dock.css", '@import "@godxjp/ui/styles/core";\n', {
      godx: true,
    });
    expect(out).toContain(
      '@import "@godxjp/ui/styles/core";\n@import "@godxjp/ui/themes/godx-tokens.css";',
    );
    expect(out).not.toMatch(/fonts|themes\/godx\.css/);
  });

  it("repairs a file the 32.0.0 codemod left with both fonts.css and godx.css", () => {
    const old =
      '@import "@godxjp/ui/styles";\n@import "@godxjp/ui/styles/fonts.css";\n@import "@godxjp/ui/themes/godx.css";\n';
    const { out } = transformSource("id.css", old, { godx: true });
    expect(out).toBe('@import "@godxjp/ui/styles";\n@import "@godxjp/ui/themes/godx.css";\n');
    expect(transformSource("id.css", out, { godx: true }).changed).toBe(false);
  });

  it("without --godx keeps adding the opt-in fonts after styles", () => {
    const { out } = transformSource("a.css", '@import "@godxjp/ui/styles";\n');
    expect(out).toContain('@import "@godxjp/ui/styles/fonts.css";');
  });
});

describe("codemod v32 follows import bindings, never edits strings, leaves untouched files alone (gh#1327)", () => {
  // Measured on a Laravel+Inertia admin with 32.13.1: --godx added preset to the app's OWN
  // AppProvider (app.tsx + 5 tests), missed the real `AppProvider as DesignSystemProvider` call
  // site, rewrote an Error string, and reported 5 files changed where only blank lines were cut.
  const WRAPPER = `import { createContext, useContext, type ReactNode } from "react";
import { AppProvider as DesignSystemProvider } from "@godxjp/ui/app";
import { Button } from "@godxjp/ui";

const Ctx = createContext<string | null>(null);

// Renders <AppProvider> from the design system under its alias.
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <Ctx.Provider value="admin">
      <DesignSystemProvider persist={false}>{children}</DesignSystemProvider>
    </Ctx.Provider>
  );
}

export function useAppContext() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useAppContext must be used within <AppProvider>");
  return value;
}

export const hint = \`wrap the page in <AppProvider>, it's required\`;
export const Retry = () => <Button title="it's <AppProvider>">Don't retry</Button>;
`;
  const WRAPPER_FIXED = WRAPPER.replace(
    'import { Button } from "@godxjp/ui";\n',
    'import { Button } from "@godxjp/ui";\nimport { godxPreset } from "@godxjp/ui/themes/godx";\n',
  ).replace("<DesignSystemProvider persist", "<DesignSystemProvider preset={godxPreset} persist");
  // The app's own wrapper and its test: same JSX name, different binding. Must not change.
  const APP_TSX = `import { createRoot } from "react-dom/client";
import { Card } from "@godxjp/ui/data-display";
import { AppProvider } from "@/providers/app-provider";


createRoot(document.getElementById("app")!).render(
  <AppProvider>
    <Card>Admin</Card>
  </AppProvider>,
);
`;
  const APP_TEST = `import { render } from "@testing-library/react";
import { Button } from "@godxjp/ui";
import { AppProvider } from "../providers/app-provider";

it("renders", () => {
  render(<AppProvider><Button>Go</Button></AppProvider>);
});
`;
  // No rule applies, and it has runs of blank lines the old codemod collapsed.
  const UNTOUCHED = `import { Button } from "@godxjp/ui";



export default function Page() {
  return <Button>Save</Button>;
}


`;

  const dirs: string[] = [];
  afterAll(() => {
    for (const d of dirs) rmSync(d, { recursive: true, force: true });
  });
  const runIn = (files: Record<string, string>, args: string[]) => {
    const dir = mkdtempSync(path.join(tmpdir(), "codemod-1327-"));
    dirs.push(dir);
    for (const [rel, src] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      writeFileSync(path.join(dir, rel), src);
    }
    const log: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((line: string) => {
      log.push(line);
    });
    try {
      expect(run(["v32", dir, ...args])).toBe(0);
    } finally {
      spy.mockRestore();
    }
    return {
      log,
      read: (rel: string) => readFileSync(path.join(dir, rel), "utf8"),
      reported: (rel: string) => log.some((l) => l.includes(path.join(dir, rel))),
    };
  };

  it("--godx: preset goes on the aliased @godxjp/ui/app binding only; strings, comments, the app's own AppProvider and untouched files stay byte-identical and unreported", () => {
    const { read, reported, log } = runIn(
      {
        "providers/app-provider.tsx": WRAPPER,
        "app.tsx": APP_TSX,
        "providers/__tests__/app-provider.test.tsx": APP_TEST,
        "products/new/page.tsx": UNTOUCHED,
      },
      ["--godx"],
    );
    expect(read("providers/app-provider.tsx")).toBe(WRAPPER_FIXED);
    expect(reported("providers/app-provider.tsx")).toBe(true);
    for (const [rel, src] of [
      ["app.tsx", APP_TSX],
      ["providers/__tests__/app-provider.test.tsx", APP_TEST],
      ["products/new/page.tsx", UNTOUCHED],
    ] as const) {
      expect(read(rel), rel).toBe(src);
      expect(reported(rel), rel).toBe(false);
    }
    expect(log.at(-1)).toBe("1 file(s) changed.");
  });

  it("is idempotent on the wrapper", () => {
    const once = transformSource("p.tsx", WRAPPER, { godx: true }).out;
    expect(once).toBe(WRAPPER_FIXED);
    expect(transformSource("p.tsx", once, { godx: true }).changed).toBe(false);
  });

  it("without --godx reports the aliased binding, never the app's own AppProvider", () => {
    expect(transformSource("p.tsx", WRAPPER).notes.join("\n")).toMatch(/no defaultLocale/);
    expect(transformSource("app.tsx", APP_TSX).notes).toEqual([]);
    expect(transformSource("t.tsx", APP_TEST).notes).toEqual([]);
  });

  it("renames TagInput through an alias and adds its props, but never inside strings or comments", () => {
    const src = `import { TagInput as Tags } from "@godxjp/ui/data-entry";

// <TagInput /> was the old name


export const help = "Use <TagInput> or <Tags> for labels";
export const F = () => <Tags value={v} />;
`;
    const { out } = transformSource("f.tsx", src);
    expect(out).toBe(`import { Select as Tags } from "@godxjp/ui/data-entry";

// <TagInput /> was the old name


export const help = "Use <TagInput> or <Tags> for labels";
export const F = () => <Tags open={false} mode="tags" value={v} />;
`);
    expect(transformSource("f.tsx", out).changed).toBe(false);
  });

  it("reads JSX after `else return` as JSX, so an apostrophe in its text cannot hide the closing tag", () => {
    const src = `import { Callout } from "@godxjp/ui";
export function A({ x }: { x: boolean }) {
  if (x) return null;
  else return <Callout>Don't</Callout>;
}
`;
    expect(transformSource("a.tsx", src).out).toBe(
      `
export function A({ x }: { x: boolean }) {
  if (x) return null;
  else return <Alert variant="callout">Don't</Alert>;
}
`.replace(/^\n/, 'import { Alert } from "@godxjp/ui/feedback";\n'),
    );
  });

  it("drops an import emptied by a move without collapsing the blank lines elsewhere", () => {
    const src = `import { Carousel } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui";


export const C = () => <Carousel><Button /></Carousel>;
`;
    expect(transformSource("c.tsx", src).out).toBe(`import { Button } from "@godxjp/ui";
import { Carousel } from "@godxjp/ui/lab";


export const C = () => <Carousel><Button /></Carousel>;
`);
  });

  it("ignores a styles import inside a CSS comment or a JS template literal", () => {
    const css = `/*\n@import "@godxjp/ui/styles";\n*/\n@import "tailwindcss";\n`;
    expect(transformSource("a.css", css, { godx: true }).changed).toBe(false);
    const js = `import { Button } from "@godxjp/ui";\nexport const doc = \`\nimport "@godxjp/ui/styles";\n\`;\n`;
    expect(transformSource("a.tsx", js, { godx: true }).changed).toBe(false);
  });
});
