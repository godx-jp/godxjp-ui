import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Page } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { OrgChart } from "../org-chart";

/**
 * OrgChart in a real browser (gh#1034). Everything asserted here is layout or focus, which jsdom
 * does not do: the connectors are CSS borders whose position only exists after layout, the dashed
 * edge is a computed style, the scroll region depends on a measured overflow, the narrow form is a
 * container query, and the keyboard moves real focus. So the component is bundled and mounted in
 * Chromium, with the package's real stylesheet.
 */

const ROOT = process.cwd();

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { OrgChart } from "./src/components/data-display/org-chart";

const data = [
  {
    key: "ceo", name: "Aiko Sato", title: "CEO",
    children: [
      {
        key: "cto", name: "Ben Ito", title: "CTO",
        children: [
          { key: "dev-agent", name: "Build Agent", title: "Code review", variant: "agent" },
          { key: "eng", name: "Chika Mori", title: "Engineer" },
        ],
      },
      {
        key: "coo", name: "Dan Kato", title: "COO",
        children: [{ key: "support-agent", name: "Support Agent", title: "Tier 1", variant: "agent" }],
      },
      { key: "cfo", name: "Emi Abe", title: "CFO" },
    ],
  },
];

const width = new URLSearchParams(location.hash.slice(1)).get("w") ?? "1200";
const dir = new URLSearchParams(location.hash.slice(1)).get("dir") ?? "ltr";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div dir={dir} style={{ width: width + "px" }}>
      <OrgChart data={data} label="Company" />
    </div>
  </AppProvider>,
);
`;

let css = "";
let js = "";
let browser: Awaited<ReturnType<typeof chromium.launch>>;

beforeAll(async () => {
  // Utility classes the Tree fallback and the focus ring emit, so the real sheet covers them.
  const markup = renderToStaticMarkup(
    <AppProvider defaultLocale="en" persist={false}>
      <OrgChart data={[{ key: "a", name: "A", children: [{ key: "b", name: "B" }] }]} />
    </AppProvider>,
  );
  css = await compileRealCss(markup);
  /* esbuild runs in-process and asserts `new TextEncoder().encode("") instanceof Uint8Array`, which
   * fails under jsdom: the environment swaps in its own `Uint8Array`. Node's own pair for the
   * length of the build, then jsdom's back. */
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

async function mount(width: number, dir: "ltr" | "rtl" = "ltr"): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto(`about:blank#w=${width}&dir=${dir}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div></body></html>`,
  );
  await page.addScriptTag({ content: js });
  await page.waitForSelector('[role="treeitem"]', { state: "attached" });
  // Let the scroll-region measurement settle (ResizeObserver → state).
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));
  return page;
}

/** Every connector's x against the box it must meet. Pseudo-elements, so from computed styles. */
function measureConnectors(page: Page) {
  return page.evaluate(() => {
    const center = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    };
    /** The x-centre of the vertical border of an absolutely positioned pseudo. */
    const verticalX = (host: Element, pseudo: "::before" | "::after") => {
      const cs = getComputedStyle(host, pseudo);
      const r = host.getBoundingClientRect();
      const left = r.left + parseFloat(cs.left);
      const rtl = cs.direction === "rtl";
      return rtl
        ? left + parseFloat(cs.width) - parseFloat(cs.borderRightWidth) / 2
        : left + parseFloat(cs.borderLeftWidth) / 2;
    };
    const out: { key: string; drop: number; box: number }[] = [];
    const stems: { key: string; stem: number; box: number }[] = [];
    const buses: { key: string; start: number; end: number; first: number; last: number }[] = [];
    for (const li of document.querySelectorAll(".ui-org-chart-children > .ui-org-chart-branch")) {
      const box = li.querySelector(":scope > .ui-org-chart-node")!;
      out.push({
        key: box.getAttribute("data-key")!,
        drop: verticalX(li, "::after"),
        box: center(box),
      });
    }
    for (const ul of document.querySelectorAll(".ui-org-chart-children")) {
      const parent = ul.parentElement!.querySelector(":scope > .ui-org-chart-node")!;
      stems.push({
        key: parent.getAttribute("data-key")!,
        stem: verticalX(ul, "::before"),
        box: center(parent),
      });
      const kids = [...ul.querySelectorAll(":scope > .ui-org-chart-branch")];
      if (kids.length < 2) continue;
      // The drawn bus: union of every horizontal border that is actually painted.
      const xs: number[] = [];
      for (const li of kids) {
        const r = li.getBoundingClientRect();
        for (const pseudo of ["::before", "::after"] as const) {
          const cs = getComputedStyle(li, pseudo);
          if (parseFloat(cs.borderTopWidth) === 0) continue;
          const left = r.left + parseFloat(cs.left);
          xs.push(left, left + parseFloat(cs.width));
        }
      }
      buses.push({
        key: parent.getAttribute("data-key")!,
        start: Math.min(...xs),
        end: Math.max(...xs),
        first: center(kids[0]!.querySelector(":scope > .ui-org-chart-node")!),
        last: center(kids.at(-1)!.querySelector(":scope > .ui-org-chart-node")!),
      });
    }
    return { drops: out, stems, buses };
  });
}

describe("OrgChart (gh#1034, Chromium)", () => {
  it.each(["ltr", "rtl"] as const)(
    "%s: every connector meets the centre of its box (±1px)",
    async (dir) => {
      const page = await mount(1200, dir);
      const m = await measureConnectors(page);
      expect(m.drops).toHaveLength(6);
      expect(m.stems).toHaveLength(3);
      expect(m.buses).toHaveLength(2);
      for (const d of m.drops)
        expect(Math.abs(d.drop - d.box), JSON.stringify(d)).toBeLessThanOrEqual(1);
      for (const s of m.stems)
        expect(Math.abs(s.stem - s.box), JSON.stringify(s)).toBeLessThanOrEqual(1);
      for (const b of m.buses) {
        const [lo, hi] = [Math.min(b.first, b.last), Math.max(b.first, b.last)];
        expect(Math.abs(b.start - lo), JSON.stringify(b)).toBeLessThanOrEqual(1);
        expect(Math.abs(b.end - hi), JSON.stringify(b)).toBeLessThanOrEqual(1);
      }
      await page.close();
    },
  );

  it("an agent box is dashed, a person box is solid, and the agent says so in its name", async () => {
    const page = await mount(1200);
    const styles = await page.evaluate(() =>
      [...document.querySelectorAll(".ui-org-chart-tree [role='treeitem']")].map((el) => {
        const labelledBy = el.getAttribute("aria-labelledby") ?? "";
        return {
          key: el.getAttribute("data-key"),
          style: getComputedStyle(el).borderTopStyle,
          name: labelledBy
            .split(" ")
            .map((id) => document.getElementById(id)?.textContent)
            .join(" "),
        };
      }),
    );
    const agents = styles.filter((s) => s.key!.endsWith("agent"));
    const people = styles.filter((s) => !s.key!.endsWith("agent"));
    expect(agents.map((s) => s.style)).toEqual(["dashed", "dashed"]);
    expect(new Set(people.map((s) => s.style))).toEqual(new Set(["solid"]));
    expect(agents[0]!.name).toBe("Build Agent Code review AI agent");
    expect(people[0]!.name).toBe("Aiko Sato CEO");
    await page.close();
  });

  it("the scroll region exists only when the chart is wider than its container", async () => {
    const read = (page: Page) =>
      page.evaluate(() => {
        const el = document.querySelector(".ui-org-chart-scroll") as HTMLElement;
        return {
          role: el.getAttribute("role"),
          name: el.getAttribute("aria-label"),
          tabIndex: el.getAttribute("tabindex"),
          overflows: el.scrollWidth > el.clientWidth,
        };
      });
    const wide = await mount(1200);
    expect(await read(wide)).toEqual({ role: null, name: null, tabIndex: null, overflows: false });
    await wide.close();

    const tight = await mount(700);
    expect(await read(tight)).toEqual({
      role: "region",
      name: "Scrollable organization chart",
      tabIndex: "0",
      overflows: true,
    });
    await tight.close();
  });

  it("a narrow container renders the same data as a Tree, and hides the boxes", async () => {
    const page = await mount(400);
    const m = await page.evaluate(() => {
      const shown = (sel: string) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        return el ? el.getClientRects().length > 0 : false;
      };
      const visibleTrees = [...document.querySelectorAll("[role='tree']")].filter(
        (el) => el.getClientRects().length > 0,
      );
      return {
        boxes: shown(".ui-org-chart-scroll"),
        list: shown(".ui-org-chart-list"),
        trees: visibleTrees.map((el) => ({
          cls: el.className,
          name: el.getAttribute("aria-label"),
          items: el.querySelectorAll("[role='treeitem']").length,
        })),
      };
    });
    expect(m.boxes).toBe(false);
    expect(m.list).toBe(true);
    expect(m.trees).toEqual([{ cls: "ui-tree", name: "Company", items: 7 }]);
    await page.close();
  });

  it("arrow keys move focus through the chart (APG tree view, one tab stop)", async () => {
    const page = await mount(1200);
    const focused = () => page.evaluate(() => document.activeElement?.getAttribute("data-key"));
    const tabStops = () =>
      page.evaluate(
        () =>
          document.querySelectorAll(".ui-org-chart-tree [role='treeitem'][tabindex='0']").length,
      );
    await page.keyboard.press("Tab");
    expect(await focused()).toBe("ceo");
    await page.keyboard.press("ArrowDown");
    expect(await focused()).toBe("cto");
    await page.keyboard.press("ArrowRight");
    expect(await focused()).toBe("dev-agent");
    await page.keyboard.press("ArrowDown");
    expect(await focused()).toBe("eng");
    await page.keyboard.press("ArrowLeft");
    expect(await focused()).toBe("cto");
    await page.keyboard.press("End");
    expect(await focused()).toBe("cfo");
    await page.keyboard.press("ArrowUp");
    expect(await focused()).toBe("support-agent");
    await page.keyboard.press("Home");
    expect(await focused()).toBe("ceo");
    expect(await tabStops()).toBe(1);
    await page.close();
  });
});
