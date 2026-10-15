import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1273 in Chromium, against the real stylesheet — an inline control or pill in a DataTable cell
 * must not grow the row past the plain-text row of the same density, for EVERY inline component a
 * cell commonly holds (the consumer asked for the whole set, not the two it first reported). The
 * row-selection checkbox (baseline-aligned inline-flex) made a compact row 38.08px and a Badge
 * (middle) 36.42px, against a 35.72px plain-text floor.
 */
const ROOT = process.cwd();
/** Every inline component a cell commonly holds, one per row-kind (gh#1273). */
const KINDS = [
  "plain",
  "select",
  "checkbox",
  "badge",
  "badge-outline",
  "avatar-xs",
  "avatar-sm",
  "button-xs",
  "button-icon-xs",
  "button-sm",
  "toggle-xs",
  "switch-sm",
  "link",
  "text-link",
  "icon",
  "swatch",
  "progress-sm",
  "tooltip-button-xs",
] as const;
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { Star, Pencil } from "lucide-react";
import { AppProvider } from "./src/app/app-provider";
import { DataTable } from "./src/components/data-display/data-table";
import { Badge } from "./src/components/data-display/badge";
import { Avatar, AvatarFallback } from "./src/components/data-display/avatar";
import { Swatch } from "./src/components/data-display/swatch";
import { Progress } from "./src/components/data-display/progress";
import { Button } from "./src/components/general/button";
import { Icon } from "./src/components/general/icon";
import { Text } from "./src/components/general/typography";
import { Checkbox } from "./src/components/data-entry/checkbox";
import { Toggle } from "./src/components/data-entry/toggle";
import { Switch } from "./src/components/data-entry/switch";
import { Tooltip, TooltipTrigger, TooltipContent } from "./src/components/feedback/tooltip";
import { Flex } from "./src/components/layout/flex";
const q = new URLSearchParams(location.search);
const kind = q.get("kind");
const cell = {
  plain: null,
  select: null,
  checkbox: <Checkbox aria-label="Done" />,
  badge: <Badge>Open</Badge>,
  "badge-outline": <Badge variant="outline">Open</Badge>,
  "avatar-xs": <Avatar size="xs"><AvatarFallback>AL</AvatarFallback></Avatar>,
  "avatar-sm": <Avatar size="sm"><AvatarFallback>AL</AvatarFallback></Avatar>,
  "button-xs": <Button size="xs" variant="outline">Edit</Button>,
  "button-icon-xs": <Button size="icon-xs" variant="ghost" aria-label="Edit"><Pencil aria-hidden="true" /></Button>,
  "button-sm": <Button size="sm" variant="outline">Edit</Button>,
  "toggle-xs": <Toggle size="xs" aria-label="Star"><Star aria-hidden="true" /></Toggle>,
  "switch-sm": <Switch size="sm" aria-label="On" />,
  link: <a href="#x">Issue title</a>,
  "text-link": <Text truncate><a href="#x">Issue title</a></Text>,
  icon: <Icon as={Star} size="sm" />,
  swatch: <Swatch color="#2563eb" aria-label="Blue" />,
  // The in-cell bar is named by its column (aria-label); a visible label prop is a caption ABOVE the
  // bar, i.e. two lines of content, which a row legitimately grows for.
  "progress-sm": <Progress value={40} size="sm" aria-label="Done" />,
  "buttons-wrap": (
    <Flex wrap gap="xs">
      {["Edit", "Assign", "Close", "Delete"].map((l) => <Button key={l} size="xs" variant="outline">{l}</Button>)}
    </Flex>
  ),
  "badge-stack": (
    <Flex direction="col" gap="none">
      <Badge>On track</Badge>
      <Text size="xs">Last 2026/10/06</Text>
    </Flex>
  ),
  "tooltip-button-xs": (
    <Tooltip><TooltipTrigger asChild><Button size="xs" variant="ghost">Info</Button></TooltipTrigger><TooltipContent>More</TooltipContent></Tooltip>
  ),
}[kind];
const data = [{ id: "1", a: "Plain text" }, { id: "2", a: "Plain text" }];
const columns = [
  { key: "a", header: "Subject" },
  { key: "b", header: "Other", width: kind === "buttons-wrap" ? "120px" : undefined, render: () => cell ?? <span>Text</span> },
];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div id="ready">
      <DataTable rowKey="id" data={data} columns={columns} selectable={kind === "select"} density={q.get("d")} />
    </div>
  </AppProvider>,
);
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

async function rowHeight(kind: string, density: string): Promise<number> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("pageerror", (e) => {
    throw new Error(`${kind}: ${e.message}`);
  });
  await page.goto(`about:blank?kind=${kind}&d=${density}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("tbody tr").first().waitFor();
  const h = await page
    .locator("tbody tr")
    .first()
    .evaluate((el) => el.getBoundingClientRect().height);
  await page.close();
  return h;
}

/** Which component, in which density, made a row taller than the plain-text row — and by how much. */
describe("DataTable rows stay at the text line (gh#1273)", { timeout: 300_000 }, () => {
  for (const density of ["compact", "default", "comfortable"]) {
    it(`${density}: no inline component makes a row taller than a plain-text row`, async () => {
      const floor = await rowHeight("plain", density);
      const taller: string[] = [];
      for (const kind of KINDS.slice(1)) {
        const h = await rowHeight(kind, density);
        if (h - floor > 0.05) taller.push(`${kind} ${h.toFixed(2)} (floor ${floor.toFixed(2)})`);
      }
      expect(taller).toEqual([]);
    });
  }
});

describe("a wrapping container keeps its lines apart (gh#1273 scope)", { timeout: 60_000 }, () => {
  it("Buttons in a Flex wrap that breaks onto several lines never overlap", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto("about:blank?kind=buttons-wrap&d=compact");
    await page.setContent(
      `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
    );
    await page.locator("tbody tr").first().waitFor();
    const rects = await page
      .locator('tbody tr:first-child [data-slot="button"]')
      .evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect()).map((r) => [r.top, r.bottom]),
      );
    const lines = [...new Set(rects.map(([top]) => Math.round(top)))].sort((a, b) => a - b);
    expect(lines.length).toBeGreaterThan(1);
    const bottomOf = (top: number) =>
      Math.max(...rects.filter(([t]) => Math.round(t) === top).map(([, b]) => b));
    for (let i = 1; i < lines.length; i += 1)
      expect(lines[i]!).toBeGreaterThanOrEqual(bottomOf(lines[i - 1]!) - 0.5);
    await page.close();
  });
});

/**
 * gino-cloud 特定技能届出: a status Badge stacked over a muted date line in `Flex direction="col"`.
 * The one-wrapper-deep negative margin pulled the date 7.36px up under the Badge. A column stack is
 * two lines of content — the row grows for it, like the wrapping container above.
 */
describe("a column stack keeps its lines apart", { timeout: 60_000 }, () => {
  it("a Badge over a text line in Flex direction=col does not overlap the text", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto("about:blank?kind=badge-stack&d=default");
    await page.setContent(
      `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
    );
    await page.locator("tbody tr").first().waitFor();
    const [badgeBottom, textTop] = await page
      .locator("tbody tr:first-child")
      .evaluate((row) => [
        row.querySelector('[data-slot="badge"]')!.getBoundingClientRect().bottom,
        row.querySelector('[data-slot="badge"] + *')!.getBoundingClientRect().top,
      ]);
    expect(textTop).toBeGreaterThanOrEqual(badgeBottom - 0.5);
    await page.close();
  });
});
