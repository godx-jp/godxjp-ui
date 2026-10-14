import { chromium, type Browser, type Page } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../../../src/components/data-entry/__tests__/compile-real-css";
import { Prose } from "../../../../src/components/data-display/prose";
import { Markdown } from "../markdown";

/**
 * gh#1310 (5) — rendered Markdown breaks Japanese between PHRASES, the way `Text break="phrase"`
 * does (gh#1292), because `Text` cannot reach Markdown output. godx-content measured 「新し｜く参加…」
 * at 1280.
 *
 * Asserted, as in the 1292 gate: no break between two katakana and no line starting with a small
 * kana or 「ー」 in a `lang="ja"` paragraph and list item, across several measures — and the SAME
 * text under `lang="en"` does break between katakana, so the gate discriminates (Chromium applies
 * `auto-phrase` to Japanese content only). A Latin paragraph wraps identically under both langs.
 */
const JA = [
  "グエン・ティ・タン・フォンさんはアジアヒューマンリソースセンターの新しいメンバーとして参加しました。オリエンテーションのスケジュールとセキュリティポリシーを確認してください。",
  "",
  "- チャン・ヴァン・ミンさんのアカウントをプロビジョニングしてください。",
  "- ファム・ホアン・ナムさんにドキュメントレビューのワークフローを説明してください。",
].join("\n");
const EN =
  "Welcome to the team. Please read the onboarding schedule, the security policy and the review workflow before your first week begins.";

const markup = (lang: string) =>
  renderToStaticMarkup(
    <div lang={lang} className="frame">
      <Prose>
        <Markdown>{JA}</Markdown>
      </Prose>
      <Prose>
        <Markdown>{EN}</Markdown>
      </Prose>
    </div>,
  );

let browser: Browser;
let css = "";

beforeAll(async () => {
  css = await compileRealCss(markup("ja"));
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(lang: string, width: number): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css} .frame { inline-size: ${width}px }</style></head><body>${markup(lang)}</body></html>`,
  );
  return page;
}

/** The rendered lines of every element matching `selector`, read character by character. */
const lines = (page: Page, selector: string) =>
  page.$$eval(selector, (els) =>
    els.map((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const out: string[] = [];
      let top: number | null = null;
      for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
        for (let i = 0; i < n.length; i++) {
          const range = document.createRange();
          range.setStart(n, i);
          range.setEnd(n, i + 1);
          const rect = range.getClientRects()[0];
          if (!rect) continue;
          const y = Math.round(rect.top);
          if (top === null || Math.abs(y - top) > 2) {
            out.push("");
            top = y;
          }
          out[out.length - 1] += n.data[i];
        }
      }
      return out;
    }),
  );

const KATAKANA = /[ァ-ヺー]/;
const NO_LINE_START = /^[ァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎー]/;
const breaks = (els: string[][]) =>
  els.flatMap((l) => l.slice(1).map((next, i) => [l[i]!.at(-1)!, next[0]!] as const));
const katakanaBreaks = (els: string[][]) =>
  breaks(els).filter(([a, b]) => KATAKANA.test(a) && KATAKANA.test(b));

// Every measure is wider than the longest phrase (「アジアヒューマンリソースセンターの」, ~17em):
// a phrase longer than the line still has to break inside itself, which is the documented cost
// of `auto-phrase` (see text-layout.css · gh#1292), not a defect this gate looks for.
const WIDTHS = [300, 360, 420, 480];
const JA_BLOCKS = ".ui-prose:first-child :is(p, li)";

describe(
  "Markdown prose — Japanese phrase breaking (Chromium, gh#1310)",
  { timeout: 60_000 },
  () => {
    it("baseline: the same text under lang=en breaks between katakana (the gate discriminates)", async () => {
      let found = 0;
      for (const width of WIDTHS) {
        const page = await open("en", width);
        found += katakanaBreaks(await lines(page, JA_BLOCKS)).length;
        await page.close();
      }
      expect(found).toBeGreaterThan(0);
    });

    it("lang=ja paragraphs and list items never break inside a katakana word or start a line with a small kana", async () => {
      for (const width of WIDTHS) {
        const page = await open("ja", width);
        const blocks = await lines(page, JA_BLOCKS);
        // It wraps at all: a block on one line would pass every check below.
        expect(blocks.some((l) => l.length > 1)).toBe(true);
        expect({ width, breaks: katakanaBreaks(blocks) }).toEqual({ width, breaks: [] });
        expect(blocks.flat().filter((line) => NO_LINE_START.test(line))).toEqual([]);
        const overflow = await page.$eval(".frame", (el) => el.scrollWidth - el.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        await page.close();
      }
    });

    it("a Latin paragraph wraps the same under lang=ja as under lang=en", async () => {
      for (const width of WIDTHS) {
        const en = await open("en", width);
        const ja = await open("ja", width);
        const sel = ".ui-prose:last-child p";
        expect(await lines(ja, sel)).toEqual(await lines(en, sel));
        await en.close();
        await ja.close();
      }
    });
  },
);
