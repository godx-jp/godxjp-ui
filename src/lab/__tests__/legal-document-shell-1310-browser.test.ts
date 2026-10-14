import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../test/chromium-fixture";

/**
 * gh#1310 in Chromium — godx-content's reader on LegalDocumentShell:
 *
 *   (4) Below the rail step the contents list stacks above the text, and the active entry's fill
 *       spanned the whole column (672px at 768, 796px at 844) for one word. Stacked, an entry hugs
 *       its label; in the pinned rail it still fills the rail.
 *   (5) The summary and section bodies broke Japanese mid-word. Under `lang="ja"` they break
 *       between phrases; under `lang="vi"` `word-break` stays `normal`.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { LegalDocumentShell } from "./src/lab/legal-document-shell";
const q = new URLSearchParams(location.search);
const locale = q.get("locale") ?? "ja";
const sections = [
  { id: "a", title: "目的", content: <p>グエン・ティ・タン・フォンさんはアジアヒューマンリソースセンターの新しいメンバーとして参加しました。</p> },
  { id: "b", title: "定義", content: <p>本規約において使用する用語の定義は、次のとおりとします。</p> },
];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale={locale} persist={false}>
    <LegalDocumentShell
      title="利用規約"
      effectiveDate="2026-04-01"
      summary="チャン・ヴァン・ミンさんのアカウントをプロビジョニングしてください。"
      sections={sections}
    />
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

const toc = (width: number) =>
  fixture.open("", { width, height: 900 }).then((page) =>
    page.evaluate(() => {
      const list = document.querySelector(".ui-legal-document-toc-list")!;
      const link = document.querySelector(".ui-legal-document-toc-link[data-active]")!;
      return {
        list: Math.round(list.getBoundingClientRect().width),
        active: Math.round(link.getBoundingClientRect().width),
        fill: getComputedStyle(link).backgroundColor,
      };
    }),
  );

describe("LegalDocumentShell (Chromium, gh#1310)", { timeout: 60_000 }, () => {
  it.each([768, 844, 390])("stacked at %ipx: the active entry hugs its label", async (width) => {
    const m = await toc(width);
    // The state is still drawn — just not as a full-column block.
    expect(m.fill).not.toBe("rgba(0, 0, 0, 0)");
    expect(m.active).toBeLessThan(m.list / 2);
  });

  it("in the pinned rail at 1280 the active entry still fills the rail", async () => {
    const m = await toc(1280);
    expect(m.active).toBe(m.list);
  });

  it("Japanese summary and section body break between phrases; Vietnamese keeps normal", async () => {
    const read = (locale: string) =>
      fixture
        .open(`?locale=${locale}`)
        .then((page) =>
          page.evaluate(() =>
            [".ui-legal-document-summary", ".ui-legal-document-section-body"].map(
              (sel) => getComputedStyle(document.querySelector(sel)!).wordBreak,
            ),
          ),
        );
    expect(await read("ja")).toEqual(["auto-phrase", "auto-phrase"]);
    expect(await read("vi")).toEqual(["normal", "normal"]);
  });
});
