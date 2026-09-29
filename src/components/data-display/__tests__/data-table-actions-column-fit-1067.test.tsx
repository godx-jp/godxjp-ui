import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Page } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Button } from "../../general/button";
import { Flex } from "../../layout/flex";
import { DataTable } from "../data-table";

/**
 * gh#1067 — found on godx-jp/id `/admin/operations/jobs` at 1440px. In `preset="action-collection"`
 * the `priority: "actions"` column was a fixed 3.5rem. A text Button ("Chạy lại") plus a `…` menu
 * overflowed it and, end-aligned, painted OVER the previous cell — a right-aligned attempts count
 * "3" disappeared under the button. The column now grows to its content when the content does not
 * fit, keeps the token measure when it does (icon-only), and a consumer `width` still wins.
 * `table-layout: fixed` is layout, and the fit is measured by a live hook: jsdom reports 0 for
 * every box, so the real DataTable is bundled and mounted in Chromium with the real stylesheet.
 */

const ROOT = process.cwd();

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { MoreHorizontal } from "lucide-react";
import { AppProvider } from "./src/app/app-provider";
import { Button } from "./src/components/general/button";
import { Flex } from "./src/components/layout/flex";
import { DataTable } from "./src/components/data-display/data-table";

const rows = [
  { id: "1", job: "SendInvoiceMail", queue: "mail", error: "SMTP timeout after 30s", attempts: 3, at: "2026-09-29 10:00" },
  { id: "2", job: "SyncDirectory", queue: "default", error: "Connection reset by peer", attempts: 12, at: "2026-09-29 10:05" },
];
const base = [
  { key: "job", header: "Job", priority: "primary" },
  { key: "queue", header: "Queue", priority: "secondary" },
  { key: "error", header: "Error" },
  { key: "at", header: "Failed at", priority: "meta" },
  { key: "attempts", header: "Attempts", align: "right", render: (r) => <span data-attempts="">{r.attempts}</span> },
];
const menu = <Button variant="ghost" size="sm" aria-label="More"><MoreHorizontal aria-hidden="true" /></Button>;
const withText = (extra) => [
  ...base,
  {
    key: "actions", header: "", ariaLabel: "Actions", priority: "actions", ...extra,
    render: () => <Flex gap="xs" justify="end"><Button variant="outline" size="sm">Chạy lại</Button>{menu}</Flex>,
  },
];
// The shape the docs' approval queue ships: one xs icon trigger, which fits the token measure.
const iconOnly = [
  ...base,
  {
    key: "actions", header: "", ariaLabel: "Actions", priority: "actions",
    render: () => <Button variant="ghost" size="xs" aria-label="More"><MoreHorizontal aria-hidden="true" /></Button>,
  },
];
const table = (id, columns) => (
  <div id={id}>
    <DataTable data={rows} columns={columns} getRowId={(r) => r.id} preset="action-collection" />
  </div>
);

createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="vi" persist={false}>
    {table("text", withText({}))}
    {table("icon", iconOnly)}
    {table("explicit", withText({ width: "11rem" }))}
  </AppProvider>,
);
`;

let css = "";
let js = "";
let browser: Awaited<ReturnType<typeof chromium.launch>>;

beforeAll(async () => {
  // Utility classes DataTable / Button / Flex emit, so the real sheet covers them.
  const markup = renderToStaticMarkup(
    <AppProvider defaultLocale="en" persist={false}>
      <DataTable
        preset="action-collection"
        data={[{ id: "1" }]}
        columns={[
          { key: "id", header: "ID", align: "right" },
          {
            key: "actions",
            header: "",
            ariaLabel: "Actions",
            priority: "actions",
            render: () => (
              <Flex gap="xs" justify="end">
                <Button variant="outline" size="sm">
                  Retry
                </Button>
                <Button variant="ghost" size="sm" aria-label="More">
                  x
                </Button>
              </Flex>
            ),
          },
        ]}
      />
    </AppProvider>,
  );
  css = await compileRealCss(markup);
  // esbuild's TextEncoder/Uint8Array check fails under jsdom's realm — see org-chart-geometry-1034.
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  let out: Awaited<ReturnType<typeof import("esbuild").build>>;
  try {
    const { build } = await import("esbuild");
    out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: join(ROOT),
    });
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  js = out.outputFiles![0]!.text;
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

async function mount(): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.setContent(
    `<!doctype html><html lang="vi"><head><style>${css} body { margin: 0; }</style></head><body><div id="root"></div></body></html>`,
  );
  await page.addScriptTag({ content: js });
  await page.waitForSelector("#explicit tbody tr", { state: "attached" });
  // Two frames: the fit is published from a ResizeObserver callback.
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null)))),
  );
  return page;
}

/** Per body row of table `id`: the actions cell, its content extent, and the previous cell. */
function measure(page: Page, id: string) {
  return page.evaluate((id) => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const head = document.querySelector<HTMLElement>(`#${id} th[data-priority="actions"]`)!;
    return {
      rem,
      headWidth: head.getBoundingClientRect().width,
      rows: [...document.querySelectorAll(`#${id} tbody tr`)].map((row) => {
        const cells = [...row.querySelectorAll<HTMLElement>("td")];
        const actions = cells.at(-1)!;
        const prev = cells.at(-2)!;
        const box = actions.getBoundingClientRect();
        const style = getComputedStyle(actions);
        const contentStart = box.left + parseFloat(style.paddingInlineStart);
        const contentEnd = box.right - parseFloat(style.paddingInlineEnd);
        const buttons = [...actions.querySelectorAll("button")].map((b) =>
          b.getBoundingClientRect(),
        );
        const count = prev.querySelector<HTMLElement>("[data-attempts]")!.getBoundingClientRect();
        // Is the count PAINTED where it sits, or does something from another cell cover it?
        const topmost = document.elementFromPoint(
          count.left + count.width / 2,
          count.top + count.height / 2,
        );
        return {
          contentStart,
          contentEnd,
          prevEnd: prev.getBoundingClientRect().right,
          buttonsStart: Math.min(...buttons.map((b) => b.left)),
          buttonsEnd: Math.max(...buttons.map((b) => b.right)),
          countVisible: !!topmost && prev.contains(topmost),
        };
      }),
    };
  }, id);
}

describe("DataTable action-collection: the actions column fits its content (Chromium, gh#1067)", () => {
  it("a text Button + icon menu stays inside the actions cell and never covers the previous cell at 1440px", async () => {
    const page = await mount();
    const { rows } = await measure(page, "text");
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.buttonsStart, "buttons start inside the actions cell").toBeGreaterThanOrEqual(
        row.contentStart - 1,
      );
      expect(row.buttonsEnd, "buttons end inside the actions cell").toBeLessThanOrEqual(
        row.contentEnd + 1,
      );
      expect(row.buttonsStart, "buttons clear the previous cell").toBeGreaterThanOrEqual(
        row.prevEnd - 1,
      );
      expect(row.countVisible, "the attempts count is painted, not covered").toBe(true);
    }
    await page.close();
  });

  it("an icon-only actions column keeps the 3.5rem token measure", async () => {
    const page = await mount();
    const { rem, headWidth, rows } = await measure(page, "icon");
    expect(Math.abs(headWidth - 3.5 * rem)).toBeLessThanOrEqual(1);
    for (const row of rows) {
      expect(row.buttonsStart).toBeGreaterThanOrEqual(row.contentStart - 1);
      expect(row.countVisible).toBe(true);
    }
    await page.close();
  });

  it("a consumer column `width` still wins over the content fit", async () => {
    const page = await mount();
    const { rem, headWidth } = await measure(page, "explicit");
    expect(Math.abs(headWidth - 11 * rem)).toBeLessThanOrEqual(1);
    await page.close();
  });
});
