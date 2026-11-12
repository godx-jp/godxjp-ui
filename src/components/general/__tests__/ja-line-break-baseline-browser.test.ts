import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * Japanese line breaking is a BASELINE, not a per-slot opt-in.
 *
 * `word-break: auto-phrase` + `line-break: strict` reached only the slots someone had measured
 * (prose paragraphs, `Text break="phrase"`, headings, EmptyState, Breadcrumb, Steps, FormField
 * note). Every other Japanese string — a CardDescription, a ListRow title, a Button label, a
 * plain `<p>` in a consumer screen — kept the browser's default CJK breaking and split words:
 * 「この操作は取り消せませ｜ん。」. The base layer now carries it for every `:lang(ja)` element,
 * and code, preformatted text and form fields are left on the engine default.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Button } from "./src/components/general";
import { Card, CardHeader, CardDescription, ListRow } from "./src/components/data-display";
const width = Number(new URLSearchParams(location.search).get("w") ?? 320);
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <main id="ready" style={{ width }}>
      <Card><CardHeader><CardDescription data-probe="card-description">この操作は取り消せません。</CardDescription></CardHeader></Card>
      <ListRow data-probe="list-row" title="勤務ポリシーを更新しました" />
      <Button data-probe="button">保存できません</Button>
      <p data-probe="plain">この操作は取り消せません。</p>
      <p lang="en" data-probe="english">This cannot be undone.</p>
      <code data-probe="code">const x = 1;</code>
      <pre data-probe="pre">npm run build</pre>
    </main>
  </AppProvider>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

describe("Japanese line breaking baseline (:lang(ja))", { timeout: 60_000 }, () => {
  it("every Japanese UI string breaks between phrases with strict kinsoku", async () => {
    const page = await fixture.open("?w=320");
    const styles = await page.$$eval("[data-probe]", (els) =>
      Object.fromEntries(
        els.map((el) => {
          const s = getComputedStyle(el);
          return [(el as HTMLElement).dataset.probe, `${s.wordBreak}/${s.lineBreak}`];
        }),
      ),
    );
    for (const probe of ["card-description", "list-row", "button", "plain"])
      expect(styles[probe], probe).toBe("auto-phrase/strict");
    // Code and preformatted text keep the engine default.
    expect(styles.code).toBe("normal/auto");
    expect(styles.pre).toBe("normal/auto");
    // Form fields keep it too (the field, not the page, owns how typed text wraps).
    const field = await page.evaluate(() => {
      const input = document.createElement("textarea");
      document.querySelector("#ready")!.append(input);
      const s = getComputedStyle(input);
      return `${s.wordBreak}/${s.lineBreak}`;
    });
    expect(field).toBe("normal/auto");
  });

  it("「取り消せません」 never splits 「ませ｜ん」 at a measure the phrase fits", async () => {
    const offenders: string[] = [];
    for (let w = 152; w <= 360; w += 4) {
      const page = await fixture.open(`?w=${w}`);
      const lines = await page.$eval('[data-probe="card-description"]', (el) => {
        const node = el.firstChild as Text;
        const out: string[] = [];
        let top: number | null = null;
        for (let i = 0; i < node.length; i++) {
          const range = document.createRange();
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const y = Math.round(range.getClientRects()[0]!.top);
          if (top === null || Math.abs(y - top) > 2) {
            out.push("");
            top = y;
          }
          out[out.length - 1] += node.data[i];
        }
        return out;
      });
      if (lines.some((line) => line.startsWith("ん"))) offenders.push(`${w}: ${lines.join("｜")}`);
      await page.close();
    }
    expect(offenders).toEqual([]);
  });
});
