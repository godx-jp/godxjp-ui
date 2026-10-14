import type { Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * gh#1292 — `Text break="phrase"` in Chromium, against the real stylesheet — Japanese prose in a DataTable
 * cell breaks between phrases, and a wrapping header lets a many-column table fit its frame.
 *
 * Reported from gino-cloud: in a 1280 layout (a ~974px content frame) a trainee's katakana name
 * in a table cell broke mid-word (「グエン・テ｜ィ・タン」) — and started a line with a small kana.
 *
 * WHAT IS ASSERTED, and what is not. Where Chrome's phrase segmenter puts a boundary is its data,
 * not this repo's, so the gate does not pin line contents. It asserts what the declarations
 * guarantee on names whose phrases are delimited by 「・」: no break between two katakana, no
 * line starting with a small kana or 「ー」 (line-break: strict, spec-defined), no one-character
 * line, the table inside its frame — and that the baseline (`whitespace="normal"`) on the SAME
 * fixture does break between katakana, so the gate discriminates.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { DataTable } from "./src/components/data-display/data-table";
import { Flex } from "./src/components/layout/flex";
import { Text } from "./src/components/general/typography";
const q = new URLSearchParams(location.search);
const mode = q.get("break") ?? undefined;
const ws = q.get("ws") ?? undefined;
const frame = Number(q.get("frame") ?? 974);
const data = [
  { id: "1", name: "グエン・ティ・タン・フォン", org: "アジア人材協同組合", company: "株式会社山田製作所", status: "技能実習2号", country: "ベトナム", entry: "2026/04/01", expiry: "2027/03/31", code: "TT-0001" },
  { id: "2", name: "チャン・ヴァン・ミン", org: "日越交流協同組合", company: "有限会社サンライズフード", status: "特定技能1号", country: "ベトナム", entry: "2025/10/15", expiry: "2026/10/14", code: "TT-0002" },
  { id: "3", name: "ファム・ホアン・ナム", org: "東海技能実習支援機構", company: "株式会社マルヤマ工業", status: "技能実習3号", country: "ベトナム", entry: "2024/07/01", expiry: "2026/06/30", code: "TT-0003" },
];
const cell = (key) => (row) => <Text break={mode} whitespace={ws}>{row[key]}</Text>;
const columns = [
  { key: "name", header: "Họ tên thực tập sinh", headerWrap: true, render: cell("name") },
  { key: "org", header: "Tổ chức giám sát", headerWrap: true, render: cell("org") },
  { key: "company", header: "Doanh nghiệp tiếp nhận", headerWrap: true, render: cell("company") },
  { key: "status", header: "Tư cách lưu trú hiện tại", headerWrap: true, render: cell("status") },
  { key: "country", header: "Quốc tịch", headerWrap: true },
  { key: "entry", header: "Ngày nhập cảnh", headerWrap: true },
  { key: "expiry", header: "Ngày hết hạn tư cách lưu trú", headerWrap: true },
  { key: "code", header: "Mã hồ sơ thực tập sinh", headerWrap: true },
];
const compound = "株式会社グローバルヒューマンリソースマネジメント";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    {q.get("flex") ? (
      <div id="frame" style={{ width: frame }}>
        <Flex direction="row" gap="sm"><Text break="phrase">{compound}</Text></Flex>
      </div>
    ) : (
      <div id="frame" style={{ width: frame }}>
        <DataTable rowKey="id" data={data} columns={columns} />
      </div>
    )}
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

/** The rendered lines of every element matching `selector`, read character by character. */
const lines = (page: Page, selector: string) =>
  page.$$eval(selector, (els) =>
    els.map((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const out: string[] = [];
      let top: number | null = null;
      for (
        let node = walker.nextNode() as Text | null;
        node;
        node = walker.nextNode() as Text | null
      ) {
        for (let i = 0; i < node.length; i++) {
          const range = document.createRange();
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const rect = range.getClientRects()[0];
          if (!rect) continue;
          const y = Math.round(rect.top);
          if (top === null || Math.abs(y - top) > 2) {
            out.push("");
            top = y;
          }
          out[out.length - 1] += node.data[i];
        }
      }
      return out;
    }),
  );

const KATAKANA = /[ァ-ヺー]/;
/** Small kana and the long-vowel mark — what `line-break: strict` forbids at a line start. */
const NO_LINE_START = /^[ァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎー]/;

/** Every place a cell's text wrapped, as the character before and after the break. */
const breaks = (cells: string[][]) =>
  cells.flatMap((l) => l.slice(1).map((next, i) => [l[i]!.at(-1)!, next[0]!] as const));

const tableWidth = (page: Page) =>
  page.$eval("table", (t) => Math.round(t.getBoundingClientRect().width));

describe('Text break="phrase" — Japanese prose in a DataTable cell', { timeout: 60_000 }, () => {
  it("baseline: whitespace=normal breaks between katakana on this fixture (the gate discriminates)", async () => {
    const page = await fixture.open("?ws=normal");
    const cells = await lines(page, 'tbody [data-slot="text"]');
    expect(breaks(cells).filter(([a, b]) => KATAKANA.test(a) && KATAKANA.test(b))).not.toEqual([]);
  });

  it("wraps — never inside a katakana word, never a small kana or ー first, never one character alone", async () => {
    const page = await fixture.open("?break=phrase");
    const cells = await lines(page, 'tbody [data-slot="text"]');
    // It actually wraps: a Text that inherited the cell's `nowrap` would pass every check below.
    expect(cells.some((l) => l.length > 1)).toBe(true);
    expect(breaks(cells).filter(([a, b]) => KATAKANA.test(a) && KATAKANA.test(b))).toEqual([]);
    expect(cells.flat().filter((line) => NO_LINE_START.test(line))).toEqual([]);
    expect(cells.filter((l) => l.length > 1 && l.some((line) => line.length === 1))).toEqual([]);
  });

  it("the table fits the 974px frame of a 1280 layout", async () => {
    const page = await fixture.open("?break=phrase");
    expect(await tableWidth(page)).toBeLessThanOrEqual(974);
  });

  it("a long Vietnamese column header wraps onto further lines (headerWrap)", async () => {
    const page = await fixture.open("?break=phrase");
    const headers = await lines(page, "thead th");
    expect(headers.filter((l) => l.length > 1).length).toBeGreaterThanOrEqual(3);
  });

  it("inside a Flex row at 320px a long compound stays within the frame", async () => {
    const page = await fixture.open("?flex=1&frame=320", { width: 360, height: 640 });
    const overflow = await page.$eval(
      "#frame",
      (el) => (el.firstElementChild as HTMLElement).scrollWidth - el.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
