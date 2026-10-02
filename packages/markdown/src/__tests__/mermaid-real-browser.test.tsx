import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * THE GATE AGAINST REAL MERMAID (gh#1108). The unit tests prove the gate rejects what it must; this
 * proves it does not reject what mermaid actually emits — otherwise every diagram would quietly
 * stay a code block. The real `mermaid` package and `MermaidDiagram` are bundled and rendered in
 * Chromium, one fence per common diagram type.
 */
const ROOT = process.cwd();

export const DIAGRAMS: Record<string, string> = {
  flowchart: "graph TD\n  A[開始] --> B{判定}\n  B -->|はい| C[完了]\n  B -->|いいえ| A",
  sequence: "sequenceDiagram\n  participant U as User\n  U->>API: POST /pages\n  API-->>U: 201",
  class:
    "classDiagram\n  class Page {\n    +String title\n    +publish()\n  }\n  Page <|-- Snapshot",
  state: "stateDiagram-v2\n  [*] --> draft\n  draft --> published\n  published --> [*]",
  er: "erDiagram\n  PAGE ||--o{ VERSION : has\n  VERSION { int number }",
  gantt: "gantt\n  dateFormat YYYY-MM-DD\n  section P1\n  Design :a1, 2026-10-01, 5d",
  pie: 'pie title Files\n  "md" : 70\n  "png" : 30',
};

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { MermaidDiagram } from "./packages/markdown/src/mermaid";
const DIAGRAMS = ${JSON.stringify(DIAGRAMS)};
createRoot(document.getElementById("root")).render(
  <>{Object.entries(DIAGRAMS).map(([name, source]) => (
    <div key={name} id={name} style={{ width: 600 }}><MermaidDiagram source={source} label={name} /></div>
  ))}</>,
);
`;

let js = "";
let browser: Awaited<ReturnType<typeof chromium.launch>>;

beforeAll(async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: join(ROOT),
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  browser = await chromium.launch({ headless: true });
}, 120_000);

afterAll(async () => {
  await browser?.close();
});

describe("MermaidDiagram with real mermaid (Chromium, gh#1108)", () => {
  it("every common diagram type renders as a diagram, with no HTML-in-SVG", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    try {
      await page.setContent('<!doctype html><html><body><div id="root"></div></body></html>');
      await page.addScriptTag({ content: js });
      await page
        .waitForFunction(
          (n) => document.querySelectorAll('figure[data-mermaid="diagram"]').length === n,
          Object.keys(DIAGRAMS).length,
          { timeout: 30_000 },
        )
        .catch(() => undefined);
      const state = await page.evaluate(
        (names) =>
          names.map((name) => {
            const figure = document.querySelector(`#${name} figure`)!;
            return {
              name,
              mode: figure.getAttribute("data-mermaid"),
              svg: !!figure.querySelector("svg"),
              foreignObject: figure.querySelectorAll("foreignObject").length,
              script: figure.querySelectorAll("script").length,
              text: figure.querySelector("svg")?.textContent ?? "",
            };
          }),
        Object.keys(DIAGRAMS),
      );
      expect(state.map(({ text: _text, ...rest }) => rest)).toEqual(
        Object.keys(DIAGRAMS).map((name) => ({
          name,
          mode: "diagram",
          svg: true,
          foreignObject: 0,
          script: 0,
        })),
      );
      // The labels are SVG text and survive the gate (htmlLabels: false), CJK included.
      const text = Object.fromEntries(state.map((s) => [s.name, s.text]));
      expect(text.flowchart).toContain("開始");
      expect(text.flowchart).toContain("はい");
      expect(text.sequence).toContain("POST /pages");
      expect(text.class).toContain("Page");
      expect(text.er).toContain("VERSION");
      expect(errors).toEqual([]);
    } finally {
      await page.close();
    }
  }, 60_000);
});
