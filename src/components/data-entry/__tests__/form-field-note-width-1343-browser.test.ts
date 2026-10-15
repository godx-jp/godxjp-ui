import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * gh#1343 — `controlWidth` caps the CONTROL, not the helper/error under it. The cap used to sit on
 * `.ui-form-field-control`, the column that also holds the notes, so a 120px region code squeezed
 * its helper to 3 lines while the field column had ~500px free. antd Form.Item draws `extra`/`help`
 * as wide as the wrapper col; so does this one now. Strings and widths are the reporter's (GoDX QC,
 * branch settings).
 */
const ROOT = process.cwd();
const FIELDS = [
  { id: "region", width: 120, helper: "Mã ISO 3166-2, ví dụ JP-13. Không bắt buộc." },
  { id: "gln", width: 200, helper: "Mã địa điểm toàn cầu GS1 (GLN), 13 chữ số. Không bắt buộc." },
  {
    id: "lang",
    width: 240,
    helper: "Mục tổ chức thêm phải có tên bằng ngôn ngữ này. Các ngôn ngữ khác không bắt buộc.",
  },
];
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Form, FormField, Input, Select } from "./src/components/data-entry";
const F = ${JSON.stringify(FIELDS)};
const layout = new URLSearchParams(location.hash.slice(1)).get("layout") || "horizontal";
function App() {
  return (
    <AppProvider defaultLocale="vi" persist={false}>
      <Form layout={layout}>
        <FormField id="region" label="Vùng" controlWidth={F[0].width} helper={F[0].helper}><Input /></FormField>
        <FormField id="gln" label="GLN" controlWidth={F[1].width} helper={F[1].helper} error="GLN phải có đúng 13 chữ số."><Input /></FormField>
        <FormField id="lang" label="Ngôn ngữ mặc định" controlWidth={F[2].width} helper={F[2].helper}>
          <Select placeholder="Chọn" options={[{ value: "vi", label: "Tiếng Việt" }, { value: "ja", label: "日本語" }]} />
        </FormField>
      </Form>
    </AppProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
`;

let css = "";
let js = "";
let browser: Browser;

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
      absWorkingDir: ROOT,
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

/** AppProvider writes `<html dir>` from the locale once on mount (no RTL locale is registered),
 * so RTL is set after it, the way a consumer's own RTL shell would. */
async function open(width: number, layout: string, dir = "ltr"): Promise<Page> {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body style="margin:0;padding:16px"><div id="root"></div></body></html>`,
  );
  await page.evaluate((l) => (location.hash = `layout=${l}`), layout);
  await page.addScriptTag({ content: js });
  await page.locator("#lang").waitFor();
  await page.evaluate((d) => (document.documentElement.dir = d), dir);
  return page;
}

/** Per field: the field column, the control box, and every note's width and line count. */
function measure(page: Page) {
  return page.evaluate(
    (ids) => {
      return ids.map((id) => {
        const field = document.getElementById(id)!.closest<HTMLElement>(".ui-form-field")!;
        const column = field.querySelector<HTMLElement>(":scope > .ui-form-field-control")!;
        const control = document.getElementById(id)!;
        const notes = [...column.querySelectorAll<HTMLElement>(":scope > .ui-form-field-note")].map(
          (n) => {
            const r = n.getBoundingClientRect();
            return {
              width: r.width,
              lines: Math.round(r.height / parseFloat(getComputedStyle(n).lineHeight)),
            };
          },
        );
        // The field's control TRACK — what the column is entitled to, whatever the column box does.
        const track = parseFloat(
          getComputedStyle(field).gridTemplateColumns.trim().split(/\s+/).pop()!,
        );
        const c = column.getBoundingClientRect();
        const k = control.getBoundingClientRect();
        return {
          id,
          track,
          column: c.width,
          columnRight: c.right,
          control: k.width,
          controlRight: k.right,
          notes,
        };
      });
    },
    FIELDS.map((f) => f.id),
  );
}

const CASES = [
  { name: "horizontal at 1280", width: 1280, layout: "horizontal" },
  { name: "vertical at 1280", width: 1280, layout: "vertical" },
  { name: "horizontal collapsed at 390", width: 390, layout: "horizontal" },
] as const;

describe("FormField controlWidth caps the control, not the helper/error (Chromium, gh#1343)", () => {
  for (const c of CASES) {
    it(`${c.name}: notes span the field column; the control is still capped`, async () => {
      const page = await open(c.width, c.layout);
      const rows = await measure(page);
      // Recorded in the issue as the before/after measurement.
      console.info(`[gh#1343] ${c.name}`, JSON.stringify(rows));
      for (const [i, row] of rows.entries()) {
        const cap = FIELDS[i]!.width;
        expect(
          Math.abs(row.control - Math.min(cap, row.track)),
          `${row.id} control`,
        ).toBeLessThanOrEqual(1);
        expect(row.notes.length, `${row.id} notes`).toBeGreaterThan(0);
        for (const note of row.notes) {
          expect(
            Math.abs(note.width - row.track),
            `${row.id} note = field track`,
          ).toBeLessThanOrEqual(1);
        }
      }
      await page.close();
    });
  }

  it("RTL: the capped control and the note both start at the inline-start (right) edge", async () => {
    const page = await open(1280, "horizontal", "rtl");
    const rows = await measure(page);
    for (const [i, row] of rows.entries()) {
      expect(Math.abs(row.control - FIELDS[i]!.width), `${row.id} control`).toBeLessThanOrEqual(1);
      expect(
        Math.abs(row.controlRight - row.columnRight),
        `${row.id} control at start`,
      ).toBeLessThanOrEqual(1);
      for (const note of row.notes) {
        expect(Math.abs(note.width - row.track), `${row.id} note`).toBeLessThanOrEqual(1);
      }
    }
    await page.close();
  });
});
