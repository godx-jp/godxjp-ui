import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "playwright";

import { PageContainer } from "../page-container";

/**
 * PageContainer header actions stay on ONE row; the title yields first (gh#1025).
 *
 * godx-mailer: three header actions (CSV export / CSV import / add contact, 344px together) in an
 * AppShell content column at 1142×805. At >=640px the heading and `.ui-page-header-extra` were
 * both `flex-shrink: 1`, so the row's deficit was split in proportion to their max-content widths
 * — the long subtitle made the heading's share large, but the action box still gave up ~27px, and
 * a box of buttons that loses even 1px wraps its last button onto a second row (reported: tops
 * 72 / 112 / 180). No prop could stop it and consumer CSS is banned.
 *
 * The action box is now `flex-shrink: 0` up to a cap (`max-inline-size: 60%`): it keeps its
 * max-content width while that fits in 60% of the row, and the heading — which wraps — takes the
 * rest. Only an action set wider than the cap wraps, which keeps the gh#300 guarantee (the `<h1>`
 * is never squeezed to 0px, nothing leaves the viewport).
 *
 * Measured with this file's harness (row / heading / extra / action rows):
 *
 *   case                          before                     after
 *   1142 + sidebar, 3 × 344px     838 / 591.8 / 230.2 / 2    838 / 486 / 344 / 1
 *   1142, no sidebar              1094 / 776.2 / 301.8 / 2   1094 / 742 / 344 / 1
 *   768, 13 × 56px                720 / 227.7 / 476.3 / 2    720 / 272 / 432 / 3   (0 off-screen)
 *   390 (stacked)                 358 / 358 / 358 / 1        identical
 *
 * jsdom performs no layout, so this runs in Chromium.
 */
const REPO = process.cwd();
const css = [
  "src/tokens/components/flex.css",
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  "src/tokens/semantic/layout.css",
  "src/tokens/axes.css",
  "src/tokens/components/shell.css",
  "src/styles/layout.css",
]
  .map((p) => readFileSync(join(REPO, p), "utf8"))
  .join("\n");

const SUBTITLE =
  "メールの配信先となる連絡先を管理します。CSV で一括インポート・エクスポートができ、タグやセグメントで配信対象を絞り込めます。";

/** `n` fixed-width stand-ins for buttons, as direct children of `extra` (the gap is the box's). */
function header(title: string, subtitle: string | undefined, n: number, width: number) {
  return renderToStaticMarkup(
    <PageContainer
      title={title}
      subtitle={subtitle}
      extra={
        <>
          {Array.from({ length: n }, (_, i) => (
            <span
              key={i}
              className="probe-action"
              style={{ display: "inline-block", inlineSize: width, blockSize: 32, flex: "none" }}
            />
          ))}
        </>
      }
    />,
  );
}

async function measure(viewport: number, sidebar: boolean, markup: string) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: viewport, height: 805 } });
    const body = sidebar
      ? `<div style="display:grid;grid-template-columns:var(--app-shell-sidebar-width) minmax(0,1fr)"><aside></aside><main style="min-inline-size:0">${markup}</main></div>`
      : markup;
    await page.setContent(
      `<!doctype html><html lang="ja"><head><style>${css} body{margin:0}</style></head><body>${body}</body></html>`,
    );
    return await page.evaluate(() => {
      const extra = document.querySelector(".ui-page-header-extra")!;
      const actions = [...document.querySelectorAll(".probe-action")];
      const h1 = document.querySelector(".ui-page-title")!.getBoundingClientRect();
      return {
        extraWidth: extra.getBoundingClientRect().width,
        actionsWidth:
          Math.max(...actions.map((a) => a.getBoundingClientRect().right)) -
          Math.min(...actions.map((a) => a.getBoundingClientRect().left)),
        rows: new Set(actions.map((a) => Math.round(a.getBoundingClientRect().top))).size,
        h1Width: h1.width,
        offscreen: actions.filter((a) => {
          const r = a.getBoundingClientRect();
          return r.right > innerWidth + 0.5 || r.left < -0.5;
        }).length,
        stacked: extra.getBoundingClientRect().top >= h1.bottom,
      };
    });
  } finally {
    await browser.close();
  }
}

// Three buttons whose box, gaps included, is 344px — the reported set.
const THREE = (344 - 2 * 8) / 3;

describe("PageContainer header actions keep one row (gh#1025, Chromium)", () => {
  it("1142px + sidebar: three actions totalling 344px stay on ONE row; the heading yields", async () => {
    const r = await measure(1142, true, header("連絡先", SUBTITLE, 3, THREE));
    expect(r.rows).toBe(1);
    expect(r.actionsWidth).toBeCloseTo(344, 0);
    expect(r.extraWidth).toBeGreaterThanOrEqual(r.actionsWidth - 0.5);
    expect(r.offscreen).toBe(0);
  });

  it("a long title wraps instead of the actions", async () => {
    const r = await measure(
      1142,
      true,
      header("配信先の連絡先とセグメントを管理する画面のとても長いタイトル", undefined, 3, THREE),
    );
    expect(r.rows).toBe(1);
    expect(r.h1Width).toBeGreaterThan(0);
  });

  it("keeps gh#300: an action set wider than the row still wraps, the <h1> keeps a measure", async () => {
    const r = await measure(
      768,
      false,
      header("配信先の連絡先とセグメントを管理する画面", undefined, 13, 56),
    );
    expect(r.offscreen).toBe(0);
    // 40% of the 720px row minus the gap — never the 0px, one-CJK-character-per-line column.
    expect(r.h1Width).toBeGreaterThan(250);
    expect(r.rows).toBeGreaterThan(1);
  });

  it("below 640px the actions still stack under the title as before", async () => {
    const r = await measure(390, false, header("連絡先", SUBTITLE, 3, THREE));
    expect(r.stacked).toBe(true);
    expect(r.offscreen).toBe(0);
  });
});
