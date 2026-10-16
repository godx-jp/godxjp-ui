import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1362 in Chromium, against the real stylesheet. The list-page filter strip (typed model:
 * `search` + a `filters` Select + a `ToolbarGroup` holding a Switch + the clear button) used to
 * BOTTOM-align its cells, so a control shorter than `--control-height` (Switch 20px, clear 28px)
 * sat off-centre against the 32px inputs — measured +6px / +2px — and the Switch group's label sat
 * 12px below the filter's.
 *
 * Contract: every control's vertical centre is equal (±0.5px) and every group label's top is
 * equal — with and without labels, in RTL, at each `--control-height` step a bar can be scoped to
 * (sm/md/lg/touch), and, once the bar stacks at 390, each control centred in its own cell.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Toolbar, ToolbarGroup } from "./src/components/navigation/toolbar";
import { Select } from "./src/components/data-entry/select";
import { Switch } from "./src/components/data-entry/switch";
import { Button } from "./src/components/general/button";
const q = new URLSearchParams(location.search);
const labels = q.get("labels") !== "0";
const step = q.get("step");
const size = q.get("size") || undefined;
const options = [{ value: "active", label: "Active" }, { value: "retired", label: "Retired" }];
const switchGroup = (
  <ToolbarGroup label={labels ? "Archived" : undefined}>
    <Switch aria-label="Show archived" />
  </ToolbarGroup>
);
const search = {
  ariaLabel: "Search staff",
  placeholder: "Search",
  label: q.get("searchLabel") ? "Keyword" : undefined,
};
const view =
  q.get("mode") === "compose" ? (
    <Toolbar
      search={search}
      onClear={() => {}}
      hasActiveFilters
      actions={<Button size={size}>Export</Button>}
    >
      <ToolbarGroup label={labels ? "Status" : undefined}>
        <Select aria-label="Status" size={size} options={options} placeholder="All" />
      </ToolbarGroup>
      {switchGroup}
    </Toolbar>
  ) : (
    <Toolbar
      search={search}
      filters={[{ value: "status", label: labels ? "Status" : undefined, options, placeholder: "All" }]}
      onClear={() => {}}
      hasActiveFilters
    >
      {switchGroup}
    </Toolbar>
  );
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div
      id="ready"
      dir={q.get("dir") || "ltr"}
      style={step ? { "--control-height": "var(--control-height-" + step + ")" } : undefined}
    >
      {view}
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

type Control = {
  name: string;
  top: number;
  centre: number;
  height: number;
  width: number;
  /** Bottom edge of the bar item (direct child of `.ui-toolbar`) that holds this control. */
  itemBottom: number;
};
type Geometry = {
  controls: Control[];
  labels: { name: string; top: number }[];
  searchLabelTop: number | null;
};

async function measure(params: string, width: number): Promise<Geometry> {
  const page: Page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.goto(`about:blank?${params}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready .ui-toolbar").waitFor();
  const geometry = await page.evaluate(() => {
    const bar = document.querySelector("#ready .ui-toolbar")!;
    const item = (el: Element) => {
      let node: Element = el;
      while (node.parentElement && node.parentElement !== bar) node = node.parentElement;
      return node;
    };
    const probes: [string, Element | null][] = [
      ["search", bar.querySelector(".ui-search-input-field")],
      ["select", bar.querySelector(".ui-control-trigger")],
      ["switch", bar.querySelector(".ui-switch")],
      ["clear", bar.querySelector(".ui-toolbar-clear")],
      ["action", bar.querySelector(".ui-filter-bar-actions .ui-button")],
    ];
    const controls = probes
      .filter((entry): entry is [string, Element] => entry[1] != null)
      .map(([name, el]) => {
        const r = el.getBoundingClientRect();
        return {
          name,
          top: r.top,
          centre: r.top + r.height / 2,
          height: r.height,
          width: r.width,
          itemBottom: item(el).getBoundingClientRect().bottom,
        };
      });
    const labels = [...bar.querySelectorAll(".ui-toolbar-label")].map((el) => ({
      name: el.textContent ?? "",
      top: el.getBoundingClientRect().top,
    }));
    const searchLabel = bar.querySelector(".ui-search-input-label");
    return {
      controls,
      labels,
      searchLabelTop: searchLabel ? searchLabel.getBoundingClientRect().top : null,
    };
  });
  await page.close();
  return geometry;
}

const spread = (values: number[]) => Math.max(...values) - Math.min(...values);
const round = (n: number) => Math.round(n * 100) / 100;
const summary = (g: Geometry) =>
  JSON.stringify({
    centres: Object.fromEntries(g.controls.map((c) => [c.name, round(c.centre)])),
    widths: Object.fromEntries(g.controls.map((c) => [c.name, round(c.width)])),
    labelTops: Object.fromEntries(g.labels.map((l) => [l.name, round(l.top)])),
    searchLabelTop: g.searchLabelTop,
  });

const cases: { name: string; params: string }[] = [
  { name: "typed model, labelled (the issue)", params: "mode=typed" },
  { name: "typed model, unlabelled", params: "mode=typed&labels=0" },
  { name: "typed model, labelled, RTL", params: "mode=typed&dir=rtl" },
  { name: "composition, bar at step sm", params: "mode=compose&step=sm" },
  { name: "composition, bar at step md", params: "mode=compose" },
  { name: "composition, bar at step lg", params: "mode=compose&step=lg" },
  { name: "composition, bar at step touch", params: "mode=compose&step=touch&size=touch" },
  // A per-instance step SHORTER than the bar centres in the bar's cell too.
  { name: "composition, md bar holding size=sm controls", params: "mode=compose&size=sm" },
];

describe("Toolbar centres every control in its row (gh#1362)", { timeout: 120_000 }, () => {
  for (const c of cases) {
    it(`${c.name} at 1512: control centres equal ±0.5px, label tops equal`, async () => {
      const g = await measure(c.params, 1512);
      process.stderr.write(`[1362] ${c.name} @1512 ${summary(g)}\n`);
      expect(g.controls.length).toBeGreaterThanOrEqual(4);
      expect(spread(g.controls.map((x) => x.top))).toBeLessThan(64); // one visual row
      expect(spread(g.controls.map((x) => x.centre))).toBeLessThanOrEqual(0.5);
      if (g.labels.length > 1) expect(spread(g.labels.map((l) => l.top))).toBeLessThanOrEqual(0.5);
    });
  }

  for (const params of ["mode=typed", "mode=typed&dir=rtl", "mode=typed&labels=0"]) {
    it(`stacked at 390 (${params}): each control centred in a cell as tall as the inputs`, async () => {
      const g = await measure(params, 390);
      process.stderr.write(`[1362] ${params} @390 ${summary(g)}\n`);
      const cell = g.controls.find((c) => c.name === "search")!.height;
      expect(g.controls).toHaveLength(4);
      for (const c of g.controls) {
        expect({ name: c.name, offset: round(c.itemBottom - c.centre) }).toEqual({
          name: c.name,
          offset: cell / 2,
        });
      }
    });
  }

  it("with a visible search label: controls stay centred, group labels share one top", async () => {
    const g = await measure("mode=typed&searchLabel=1", 1512);
    process.stderr.write(`[1362] typed model + search label @1512 ${summary(g)}\n`);
    expect(spread(g.controls.map((x) => x.centre))).toBeLessThanOrEqual(0.5);
    expect(spread(g.labels.map((l) => l.top))).toBeLessThanOrEqual(0.5);
  });
});
