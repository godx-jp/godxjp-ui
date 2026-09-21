import { describe, it, expect } from "vitest";
// Self-test for the CI gate `check:no-consumer-coupling`. Proves the matcher catches
// consumer/product coupling and locale literals, while NEVER flagging the library's
// own identity (@godxjp/ui). Mirrors how the gate scans a file's text.
import { scanText, scanLocale, scanDocsChrome } from "../../scripts/check-no-consumer-coupling.mjs";

describe("check:no-consumer-coupling — matcher", () => {
  it("flags consumer/product identifiers", () => {
    const hits = scanText("built for godx-umbrella / kintai / TIXIMAX / tempo / chat-prod");
    const tokens = hits.map((h) => h.token);
    expect(tokens).toEqual(
      expect.arrayContaining(["godx-umbrella", "kintai", "tiximax", "tempo", "chat-prod"]),
    );
  });

  it("flags consumer infra domains + the <slug>-prod.godx.jp pattern", () => {
    const hits = scanText("apigw.godx.jp id.godx.jp mcp.godx.jp warehouse-prod.godx.jp");
    const tokens = hits.map((h) => h.token);
    expect(tokens).toContain("apigw.godx.jp");
    expect(tokens).toContain("id.godx.jp");
    expect(tokens).toContain("<slug>-prod.godx.jp");
  });

  it("does NOT flag the library's OWN identity (its name is legit)", () => {
    const clean =
      "@godxjp/ui is the godx-jp/godxjp-ui design system; import from @godxjp scope on godx.jp";
    expect(scanText(clean)).toEqual([]);
  });

  it("passes clean, consumer-agnostic component source", () => {
    expect(
      scanText("export function Money({ amount }: Props) { return <span>{amount}</span>; }"),
    ).toEqual([]);
  });

  it("flags hard-coded locale/currency/timezone literals", () => {
    const src = `const cur = "JPY"; const sym = '¥'; const loc = 'ja-JP'; const tz = 'Asia/Tokyo';`;
    expect(scanLocale(src).length).toBe(4);
  });

  it("does NOT flag Intl/CLDR-driven locale usage", () => {
    const src = `new Intl.NumberFormat(locale, { style: "currency", currency }).format(v)`;
    expect(scanLocale(src)).toEqual([]);
  });
});

// gh#846 — the locale rule used to stop at src/components/**, so the EXAMPLES the MCP quotes were
// the one place it did not apply. These pin the three judgement calls the docs pass makes.
describe("check:no-consumer-coupling — docs chrome matcher (gh#846)", () => {
  it("flags hard-coded CJK rendered as JSX text", () => {
    // the reported defect: `全 {n} 件` beside a Select the library renders as `10 / trang`
    const hits = scanDocsChrome(`<Text size="sm">全 {total} 件</Text>`);
    expect(hits).toHaveLength(1);
    expect(hits[0].token).toBe("CJK in JSX text");
  });

  it("flags hard-coded CJK passed to props that render as text", () => {
    const src = [
      `<PageContainer title="ページネーション" subtitle="三つの方式" />`,
      `const cols = [{ key: "employee", header: "従業員" }];`,
      `<Select aria-label="期間を選択" />`,
    ].join("\n");
    expect(scanDocsChrome(src).map((h) => h.match)).toEqual([
      "ページネーション",
      "三つの方式",
      "従業員",
      "期間を選択",
    ]);
  });

  it("does NOT flag DOMAIN DATA — a name or a company in a row is content, not chrome", () => {
    const src = [
      `const NAMES = ["鈴木 一郎", "佐藤 花子"];`,
      `const ORGS = [{ id: 1, name: "株式会社アクメ商事", category: "製造" }];`,
    ].join("\n");
    expect(scanDocsChrome(src)).toEqual([]);
  });

  it("does NOT flag Japanese in comments — author documentation is never rendered", () => {
    const src = [
      `// 勤怠テーブルのページネーション`,
      `/* 全 3 方式をカードごとに分けて見せる */`,
      `export const rows = [];`,
    ].join("\n");
    expect(scanDocsChrome(src)).toEqual([]);
  });

  it("does NOT mistake a TS generic followed by a data array for JSX text", () => {
    const src = `const [rows] = React.useState<Row[]>([{ name: "鈴木 一郎" }]);`;
    expect(scanDocsChrome(src)).toEqual([]);
  });

  it("does NOT flag localized chrome — the shape table-pagination.tsx was converted to", () => {
    const src = [
      `<Text size="sm">{t("showcase.pagination.recordCount", { count })}</Text>`,
      `<Text tabular>{new Intl.NumberFormat(locale).format(total)}</Text>`,
    ].join("\n");
    expect(scanDocsChrome(src)).toEqual([]);
  });

  it("reports a line number for the hit, but the BASELINE is keyed on the file path only", () => {
    // A line number moves when someone adds an import; keying a baseline on one makes every
    // known entry read as new. It is output, never identity.
    const hits = scanDocsChrome(`\n\n<CardTitle>勤怠一覧</CardTitle>`);
    expect(hits[0].line).toBe(3);
  });
});
