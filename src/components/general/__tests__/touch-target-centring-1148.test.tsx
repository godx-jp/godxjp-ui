import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Star, X } from "lucide-react";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { SearchInput } from "../../data-entry/search-input";
import { Segmented } from "../../data-entry/segmented";
import { Toggle } from "../../data-entry/toggle";
import { Breadcrumb } from "../../layout/breadcrumb";
import { Button } from "../button";

/**
 * gh#1148 — a target is centred on its control, in BOTH directions. The coarse `::after` targets
 * used `inset: 0` + `margin: auto`, which centres on the block axis only (CSS 2.1 §10.3.7 sets a
 * negative inline-start auto margin to 0), so a box narrower than its target had the surplus on
 * one side; the overlay ✕ used a physical translate on a logical anchor, off by a box-width under
 * `dir="rtl"`. Also: a wrapped breadcrumb trail, and SearchInput's clear ✕. Chromium + touch.
 */
const controls = (
  <>
    <div data-p="icon-sm">
      <Button size="icon-sm" aria-label="Star">
        <Star />
      </Button>
    </div>
    <div data-p="xs">
      <Button size="xs">Open</Button>
    </div>
    <div data-p="sm">
      <Button size="sm">Open</Button>
    </div>
    <div data-p="toggle">
      <Toggle size="sm" aria-label="Star">
        <Star />
      </Toggle>
    </div>
    <div data-p="bare">
      <Button variant="bare" aria-label="Star">
        <Star />
      </Button>
    </div>
    <div data-p="close" style={{ position: "relative", width: 200, height: 80 }}>
      {/* ui-audit-disable-next-line no-raw-button — the overlay ✕'s own markup, isolated. */}
      <button type="button" className="ui-sheet-close ui-focus-ring">
        <X className="ui-sheet-close-icon" />
      </button>
    </div>
    <div data-p="segmented">
      <Segmented
        aria-label="View"
        options={[
          { value: "w", label: "Write" },
          { value: "p", label: "Preview" },
        ]}
        defaultValue="w"
      />
    </div>
    <div data-p="search" style={{ width: 300 }}>
      <SearchInput aria-label="Search" defaultValue="query text" />
    </div>
    <div data-p="trail" style={{ width: 150 }}>
      <Breadcrumb
        items={[
          { label: "Workspace", to: "/" },
          { label: "Collections", to: "/c" },
          { label: "Guides", to: "/c/g" },
          { label: "Page" },
        ]}
      />
    </div>
  </>
);

const page = (dir: "ltr" | "rtl") =>
  renderToStaticMarkup(
    <AppProvider persist={false} defaultLocale="en">
      <div dir={dir}>{controls}</div>
    </AppProvider>,
  );

async function measure(dir: "ltr" | "rtl", touch: boolean) {
  const markup = page(dir);
  const css = await compileRealCss(markup);
  const browser = await chromium.launch({ headless: true });
  try {
    const p = await (
      await browser.newContext({
        viewport: { width: 390, height: 1400 },
        hasTouch: touch,
        isMobile: touch,
      })
    ).newPage();
    await p.setContent(
      `<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>${css} body{margin:0;padding:48px} [data-p]{margin-block:48px}</style></head><body>${markup}</body></html>`,
    );
    return await p.evaluate(() => {
      const reach = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const owns = (x: number, y: number) => {
          const hit = document.elementFromPoint(x, y);
          return hit !== null && (el.contains(hit) || hit.closest("label") === el);
        };
        const out = (dx: number, dy: number, from: number) => {
          let d = 0;
          while (d < 40 && owns(cx + dx * (from + d + 0.5), cy + dy * (from + d + 0.5))) d++;
          return d;
        };
        // Reach BEYOND the painted box on each side, in px.
        return {
          left: out(-1, 0, r.width / 2),
          right: out(1, 0, r.width / 2),
          top: out(0, -1, r.height / 2),
          bottom: out(0, 1, r.height / 2),
          w: r.width,
          h: r.height,
        };
      };
      const q = (p: string, sel: string) =>
        document.querySelector<HTMLElement>(`[data-p="${p}"] ${sel}`)!;
      const field = q("search", "input");
      const clear = q("search", ".ui-search-input-clear");
      const fs = getComputedStyle(field);
      const rtl = getComputedStyle(field).direction === "rtl";
      const fr = field.getBoundingClientRect();
      // Where typed text stops, on the clear's side.
      const textEnd = rtl
        ? fr.left + parseFloat(fs.paddingLeft)
        : fr.right - parseFloat(fs.paddingRight);
      const links = [...document.querySelectorAll<HTMLElement>('[data-p="trail"] a[href]')];
      const tops = links.map((a) => Math.round(a.getBoundingClientRect().top));
      return {
        iconSm: reach(q("icon-sm", "button")),
        xs: reach(q("xs", "button")),
        sm: reach(q("sm", "button")),
        toggle: reach(q("toggle", "button")),
        bare: reach(q("bare", "button")),
        close: reach(q("close", "button")),
        segmented: reach(q("segmented", ".ui-segmented-item")),
        clear: reach(clear),
        clearRect: (() => {
          const r = clear.getBoundingClientRect();
          return { left: r.left, right: r.right };
        })(),
        textEnd,
        rtl,
        trail: {
          rows: new Set(tops).size,
          // Contiguous pixels the first crumb owns, scanned out from its TEXT centre. Its box is
          // already 44 tall (padding), so a later row covering it shows only from the inside.
          firstOwned: (() => {
            const a = links[0]!;
            const range = document.createRange();
            range.selectNodeContents(a);
            const t = range.getBoundingClientRect();
            const x = t.left + t.width / 2;
            const cy = t.top + t.height / 2;
            const along = (dy: number) => {
              let d = 0;
              while (d < 40 && a.contains(document.elementFromPoint(x, cy + dy * (d + 0.5)))) d++;
              return d;
            };
            return along(1) + along(-1);
          })(),
        },
      };
    });
  } finally {
    await browser.close();
  }
}

const centred = (r: { left: number; right: number; top: number; bottom: number }) => {
  expect(Math.abs(r.left - r.right)).toBeLessThanOrEqual(1);
  expect(Math.abs(r.top - r.bottom)).toBeLessThanOrEqual(1);
};

describe.each(["ltr", "rtl"] as const)(
  "touch targets are centred (Chromium, %s, gh#1148)",
  (dir) => {
    it("centres every coarse ::after target on its control and keeps 44px", async () => {
      const m = await measure(dir, true);
      for (const r of [m.iconSm, m.xs, m.sm, m.toggle, m.close, m.clear]) {
        centred(r);
        expect(r.w + r.left + r.right).toBeGreaterThanOrEqual(43);
        expect(r.h + r.top + r.bottom).toBeGreaterThanOrEqual(43);
      }
      centred(m.bare);
      // Segmented grows on the block axis only — never into its neighbour.
      // (≤1: elementFromPoint rounds a fractional box edge.)
      expect(m.segmented.left + m.segmented.right).toBeLessThanOrEqual(1);
      expect(m.segmented.h + m.segmented.top + m.segmented.bottom).toBeGreaterThanOrEqual(43);
    });

    it("stops SearchInput's text at the clear ✕'s 44px target, not at its 24px box", async () => {
      const m = await measure(dir, true);
      // The 44px target is centred on the ✕ (asserted above); its start edge is where text must stop.
      // From geometry, not the probe: elementFromPoint rounds a fractional edge by up to 1px.
      const centre = (m.clearRect.left + m.clearRect.right) / 2;
      if (m.rtl) expect(m.textEnd).toBeGreaterThanOrEqual(centre + 22 - 0.5);
      else expect(m.textEnd).toBeLessThanOrEqual(centre - 22 + 0.5);
    });

    it("keeps a wrapped breadcrumb row's 44px targets clear of the next row", async () => {
      const m = await measure(dir, true);
      expect(m.trail.rows).toBeGreaterThan(1);
      expect(m.trail.firstOwned).toBeGreaterThanOrEqual(43);
    });

    it("centres the always-on targets (bare Button, overlay ✕) under a mouse too", async () => {
      const m = await measure(dir, false);
      centred(m.bare);
      centred(m.close);
    });
  },
);
