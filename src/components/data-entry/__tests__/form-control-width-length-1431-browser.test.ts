import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * gh#1431 (gino-cloud) in Chromium, against the real stylesheet. `controlWidth` / `labelWidth` are
 * written into CSS as-is, so `controlWidth="md"` became `--form-control-width: md`: invalid at
 * computed-value time, the cap fell away and a Select spanned the whole column (1566px at a 1920px
 * viewport). The fix is the TYPE — `WidthProp` no longer accepts a bare word (see
 * `width-prop-css-length-1431.types.test.tsx`). This file pins the runtime half: every value the
 * narrowed type still accepts reaches the control as a width — on the Form, on the field, as a
 * number, a unit length, a percentage and a math expression.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Form, FormField, Select } from "./src/components/data-entry";
const opts = [{ value: "a", label: "Thực tập sinh kỹ năng số 1" }, { value: "b", label: "Số 2" }];
const width = new URLSearchParams(location.search).get("w");
const on = new URLSearchParams(location.search).get("on");
const parsed = /^\\d+$/.test(width) ? Number(width) : width;
function App() {
  return (
    <AppProvider defaultLocale="vi" persist={false}>
      <Form layout="horizontal" labelWidth="9rem" controlWidth={on === "form" ? parsed : undefined}>
        <FormField id="s" label="Loại hồ sơ" controlWidth={on === "field" ? parsed : undefined}>
          <Select id="s" placeholder="Chọn" options={opts} />
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

async function measure(on: "form" | "field" | "none", w = "") {
  const page = await browser.newPage({ viewport: { width: 1920, height: 600 } });
  await page.goto(`about:blank?on=${on}&w=${encodeURIComponent(w)}`);
  await page.setContent(
    `<!doctype html><html lang="vi"><head><style>${css}html,body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#s").waitFor();
  const result = await page.evaluate(() => {
    const control = document.getElementById("s")!;
    return {
      control: control.getBoundingClientRect().width,
      field: control.closest(".ui-form-field")!.getBoundingClientRect().width,
    };
  });
  await page.close();
  return result;
}

describe("Form / FormField controlWidth reaches the control as a length (Chromium, gh#1431)", () => {
  it("with no controlWidth the Select fills its column — the baseline the cap departs from", async () => {
    const { control } = await measure("none");
    expect(control).toBeGreaterThan(1500);
  });

  it.each([
    ["form", "20rem", 320],
    ["field", "20rem", 320],
    ["form", "320", 320],
    ["field", "calc(16rem + 4rem)", 320],
    ["field", "min(20rem, 50vw)", 320],
  ] as const)("on the %s, %s → %ipx", async (on, w, expected) => {
    const { control } = await measure(on, w);
    expect(Math.abs(control - expected), `${on} controlWidth=${w}`).toBeLessThanOrEqual(1);
  });
});
