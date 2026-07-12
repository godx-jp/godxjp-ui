import { describe, it, expect } from "vitest";
// Self-test for the CI gate `check:no-consumer-coupling`. Proves the matcher catches
// consumer/product coupling and locale literals, while NEVER flagging the library's
// own identity (@godxjp/ui). Mirrors how the gate scans a file's text.
import { scanText, scanLocale } from "../../scripts/check-no-consumer-coupling.mjs";

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
