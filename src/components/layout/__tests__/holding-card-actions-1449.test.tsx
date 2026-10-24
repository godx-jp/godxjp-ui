/**
 * gh#1449 — HoldingCard's action row with more actions than fit one line (edit, remove, record a sale,
 * price alert, archive). Before: the row never wrapped and every label broke into a column of single
 * characters. Now the row wraps and a label moves to the next line whole.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HoldingCard, HoldingCardAction } from "../editorial-account";

const css = readFileSync(join(__dirname, "../../../styles/editorial-account-layout.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

const rule = (selector: string) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...css.matchAll(new RegExp(`(?:^|[\\s}])${esc}\\s*\\{([^}]*)\\}`, "g"))].map((m) => m[1]).join("\n");
};

describe("HoldingCard action row (gh#1449)", () => {
  it("wraps onto another line instead of squeezing", () => {
    expect(rule(".ui-holding-card-actions")).toMatch(/flex-wrap:\s*wrap/);
  });

  it("never breaks an action label mid-word", () => {
    expect(rule(".ui-holding-card-action")).toMatch(/white-space:\s*nowrap/);
  });

  it("renders every action in the one row", () => {
    render(
      <HoldingCard
        media={<a href="/x">x</a>}
        title="Pikachu"
        actions={["編集", "削除", "売却を記録", "アラート", "アーカイブ"].map((label) => (
          <HoldingCardAction key={label}>{label}</HoldingCardAction>
        ))}
      />,
    );
    const row = screen.getByRole("button", { name: "売却を記録" }).parentElement!;
    expect(row.className).toContain("ui-holding-card-actions");
    expect(row.querySelectorAll(".ui-holding-card-action")).toHaveLength(5);
  });
});
