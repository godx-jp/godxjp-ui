import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// @ts-expect-error — plain ESM script without a declaration file
import { collectInPage } from "../../scripts/visual-audit.mjs";

type Target = { name: string; width: number; height: number; exempt: string | null };
type Collected = { targets: Target[]; rows: { name: string; heights: number[] }[] };

/**
 * GDX-2343 — `target-size-min` measured a target's PAINT, not the region that takes the pointer.
 * NumberInput's steppers paint 24x15 and carry a 24x24 `::after` each, anchored away from the
 * sibling so the two hit areas meet without overlapping (control.css, gh#506). The collector read
 * 24x15 with centres 16px apart and reported both steppers on a consumer's security settings page.
 */
describe("visual-audit target size reads the pointer region (GDX-2343)", () => {
  let browser: Browser;
  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });
  afterAll(async () => {
    await browser?.close();
  });

  const collect = async (css: string, html: string) => {
    const page = await browser.newPage({ viewport: { width: 768, height: 600 } });
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body style="margin:0">${html}</body></html>`,
    );
    const out = (await page.evaluate(collectInPage)) as Collected;
    await page.close();
    return out;
  };

  const steppers = `<div style="position:relative;display:inline-flex;flex-direction:column;gap:1px;margin:80px">
    <button class="step up" aria-label="up">+</button><button class="step down" aria-label="down">-</button></div>`;
  const base = `.step{position:relative;inline-size:24px;block-size:15px;padding:0;border:0;font-size:10px;line-height:1}
    .step::after{content:"";position:absolute;inset-inline-start:0;inline-size:24px;block-size:24px}`;

  it("counts a stepper's measured 24x24 ::after hit area, not its 24x15 paint", async () => {
    const { targets } = await collect(
      `${base} .up::after{inset-block-end:0} .down::after{inset-block-start:0}`,
      steppers,
    );
    const steps = targets.filter((t) => t.name === "up" || t.name === "down");
    expect(steps).toHaveLength(2);
    for (const t of steps) expect({ w: t.width, h: t.height }).toEqual({ w: 24, h: 24 });
  });

  it("reads a stepper below the fold the same way, and leaves the page where it was", async () => {
    const page = await browser.newPage({ viewport: { width: 768, height: 600 } });
    await page.setContent(
      `<!doctype html><html><head><style>${base} .up::after{inset-block-end:0} .down::after{inset-block-start:0}</style></head>` +
        `<body style="margin:0"><div style="height:2000px"></div>${steppers}<div style="height:2000px"></div></body></html>`,
    );
    const { targets } = (await page.evaluate(collectInPage)) as Collected;
    const steps = targets.filter((t) => t.name === "up" || t.name === "down");
    for (const t of steps) expect({ w: t.width, h: t.height }).toEqual({ w: 24, h: 24 });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.close();
  });

  it("does not credit a pseudo box that a sibling swallows (centred, overlapping ::after)", async () => {
    const { targets } = await collect(
      `${base} .step::after{inset-block-start:calc((100% - 24px) / 2)}`,
      steppers,
    );
    // The later sibling's ::after covers the earlier one's lower half: the up stepper does not
    // own its pseudo box, so its paint stands, and it is undersized and crowded.
    const up = targets.find((t) => t.name === "up")!;
    expect(up.height).toBeLessThan(24);
    expect(up.exempt).toBeNull();
  });

  it("still reports a small target with no hit-area extension", async () => {
    const { targets } = await collect(
      "",
      `<div style="margin:80px;display:flex;gap:2px"><button aria-label="a" style="width:16px;height:16px;padding:0;border:0"></button><button aria-label="b" style="width:16px;height:16px;padding:0;border:0"></button></div>`,
    );
    const small = targets.filter((t) => t.name === "a" || t.name === "b");
    expect(small.map((t) => [t.width, t.height, t.exempt])).toEqual([
      [16, 16, null],
      [16, 16, null],
    ]);
  });

  // A PageHeader's actions at 320px: a wrapping Flex of three 36px Buttons beside the 36px menu
  // trigger. The row collector took the WRAPPER as one control — 124px tall once its Buttons
  // stacked — and reported "mixes control heights 124/36px" on every page with three actions.
  const header = (inner: string) =>
    `<div class="ui-page-header-extra" style="display:flex;gap:8px;width:220px">` +
    `<div class="ui-flex" data-direction="row" style="display:flex;flex-wrap:wrap;gap:8px;width:180px">${inner}</div>` +
    `<button style="height:36px;width:36px">…</button></div>`;
  const btn = (w: number, h = 36) => `<button style="height:${h}px;width:${w}px">x</button>`;

  it("measures the Buttons inside a wrapping group, not the group's stacked height", async () => {
    const upload = `<div style="display:flex;flex-direction:column"><input type="file" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">${btn(120)}</div>`;
    const { rows } = await collect("", header(btn(160) + btn(170) + upload));
    const extra = rows.find((r) => r.name.includes("ui-page-header-extra"))!;
    expect([...new Set(extra.heights)]).toEqual([36]);
    // …and the group's own row does not count the Upload's 1px file input.
    const group = rows.find((r) => r.name === "ui-flex")!;
    expect([...new Set(group.heights)]).toEqual([36]);
  });

  it("still reports a real mismatch inside a group", async () => {
    const { rows } = await collect("", header(btn(60) + btn(60, 28)));
    const extra = rows.find((r) => r.name.includes("ui-page-header-extra"))!;
    expect([...new Set(extra.heights)].sort()).toEqual([28, 36]);
  });
});
