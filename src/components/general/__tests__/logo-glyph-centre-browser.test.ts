import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * `<Logo mark="glyph">` in Chromium: the PAINTED ink of the glyph is centred in its box, both
 * standalone and as the AppShell brand link (`<Logo asChild glyph="P"><a/></Logo>`).
 *
 * The AppShell case is the regression: `.app-topbar-logo > a { display: flex }` out-ranked
 * `.ui-logo { display: inline-grid; place-items: center }` when the anchor WAS the mark, so the
 * glyph lost inline centring and sat against the box's start edge (dx −7.75px at `md`).
 *
 * Measured from pixels, never from layout boxes: a 4x screenshot is decoded onto a canvas and
 * every pixel that differs from the box's fill is ink. Ink-box centre vs fill-box centre, ≤1px.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { Logo } from "./src/components/general/logo";
import { AppShell } from "./src/components/layout/app-shell";
const q = new URLSearchParams(location.search);
const glyph = q.get("glyph") ?? "P";
const shell = q.get("shell");
createRoot(document.getElementById("root")).render(
  shell ? (
    <AppShell
      topbarSpan="full"
      logo={
        <Logo asChild glyph={glyph} size={shell}>
          <a href="/" aria-label="Home" />
        </Logo>
      }
    >
      <p>body</p>
    </AppShell>
  ) : (
    <div style={{ padding: 24, display: "flex", gap: 24, alignItems: "center", background: "#fff" }}>
      {["xs", "sm", "md", "lg"].map((size) => (
        <Logo key={size} size={size} glyph={glyph} label={"mark-" + size} />
      ))}
    </div>
  ),
);
`;

const SCALE = 4;
const SIZES = ["xs", "sm", "md", "lg"] as const;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

type Measure = { size: string; dx: number; dy: number; ink: number };

async function measure(search: string): Promise<Measure[]> {
  const page = await fixture.open(search, { width: 800, height: 200 }, SCALE);
  await page.evaluate(() => document.fonts.ready);
  const boxes = await page.$$eval(".ui-logo", (els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { size: el.getAttribute("data-size") ?? "", x: r.x, y: r.y, w: r.width, h: r.height };
    }),
  );
  const png = (await page.screenshot({ type: "png" })).toString("base64");
  const out = await page.evaluate(
    async ({ png, boxes, scale }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${png}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      return boxes.map((b) => {
        // Inset past the rounded corners; the glyph never reaches them.
        const inset = Math.ceil(b.w * 0.12 * scale);
        const x0 = Math.round(b.x * scale) + inset;
        const y0 = Math.round(b.y * scale) + inset;
        const w = Math.round(b.w * scale) - 2 * inset;
        const h = Math.round(b.h * scale) - 2 * inset;
        const data = ctx.getImageData(x0, y0, w, h).data;
        const [fr, fg, fb] = [data[0]!, data[1]!, data[2]!]; // the fill, at the inset corner
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        let ink = 0;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const d =
              Math.abs(data[i]! - fr) + Math.abs(data[i + 1]! - fg) + Math.abs(data[i + 2]! - fb);
            if (d > 96) {
              ink++;
              minX = Math.min(minX, x);
              maxX = Math.max(maxX, x);
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
            }
          }
        }
        const inkCx = ((minX + maxX + 1) / 2 + inset) / scale;
        const inkCy = ((minY + maxY + 1) / 2 + inset) / scale;
        const r2 = (n: number) => Math.round(n * 100) / 100;
        return { size: b.size, dx: r2(inkCx - b.w / 2), dy: r2(inkCy - b.h / 2), ink };
      });
    },
    { png, boxes, scale: SCALE },
  );
  await page.close();
  return out;
}

function expectCentred(rows: Measure[], label: string) {
  for (const row of rows) {
    expect(row.ink, `${label} ${row.size}: no ink found`).toBeGreaterThan(0);
    expect(Math.abs(row.dx), `${label} ${row.size} dx=${row.dx}`).toBeLessThanOrEqual(1);
    expect(Math.abs(row.dy), `${label} ${row.size} dy=${row.dy}`).toBeLessThanOrEqual(1);
  }
}

describe("Logo glyph ink centre (Chromium)", { timeout: 60_000 }, () => {
  it.each(["P", "G", "GX", "g", "神"])("standalone %s: centred at every size", async (glyph) => {
    const rows = await measure(`?glyph=${encodeURIComponent(glyph)}`);
    expect(rows.map((r) => r.size)).toEqual([...SIZES]);
    expectCentred(rows, glyph);
  });

  it.each(SIZES)("AppShell brand link <Logo asChild glyph=P size=%s>: centred", async (size) => {
    const rows = await measure(`?glyph=P&shell=${size}`);
    expect(rows).toHaveLength(1);
    expectCentred(rows, `shell P`);
  });
});
