import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextDiff, diffText, tokenizeText } from "../text-diff";

const displayCss = readFileSync(
  resolve(process.cwd(), "src/styles/data-display-layout.css"),
  "utf8",
);

/**
 * TextDiff (gh#1096) — godx-task showed a translator how an original changed with a hand-built
 * LCS over `Text delete` / `Text mark`; this is the kit's version of that view.
 * (Tests run in the library's default `vi` locale.)
 */
describe("diffText", () => {
  it("diffs Japanese per character, not per sentence", () => {
    expect(diffText("承認してください", "却下してください")).toEqual([
      { kind: "removed", text: "承認" },
      { kind: "added", text: "却下" },
      { kind: "same", text: "してください" },
    ]);
  });

  it("diffs alphabetic text per word", () => {
    expect(diffText("send the report today", "send the summary today")).toEqual([
      { kind: "same", text: "send the " },
      { kind: "removed", text: "report" },
      { kind: "added", text: "summary" },
      { kind: "same", text: " today" },
    ]);
  });

  it("word granularity keeps a Japanese dictionary word whole; auto cuts it per character", () => {
    expect(tokenizeText("東京都", "auto", "ja")).toEqual(["東", "京", "都"]);
    expect(tokenizeText("hello world", "word", "en")).toEqual(["hello", " ", "world"]);
  });

  it("char granularity keeps a grapheme cluster (an emoji with a modifier) whole", () => {
    expect(tokenizeText("a👍🏽b", "char")).toEqual(["a", "👍🏽", "b"]);
  });

  it("line granularity marks whole lines", () => {
    expect(diffText("one\ntwo\nthree", "one\n2\nthree", { granularity: "line" })).toEqual([
      { kind: "same", text: "one\n" },
      { kind: "removed", text: "two\n" },
      { kind: "added", text: "2\n" },
      { kind: "same", text: "three" },
    ]);
  });

  it("past the cost cap the changed middle is one removal plus one addition", () => {
    expect(diffText("x a b c y", "x d e f y", { maxCells: 4 })).toEqual([
      { kind: "same", text: "x " },
      { kind: "removed", text: "a b c" },
      { kind: "added", text: "d e f" },
      { kind: "same", text: " y" },
    ]);
  });

  it("identical text is one unchanged run", () => {
    expect(diffText("同じ", "同じ")).toEqual([{ kind: "same", text: "同じ" }]);
  });
});

describe("TextDiff", () => {
  it("renders removals in <del> and additions in <ins>, each with spoken labels", () => {
    const { container } = render(<TextDiff before="send the report" after="send the summary" />);
    const del = container.querySelector("del")!;
    const ins = container.querySelector("ins")!;

    expect(del.textContent).toBe("[đã xoá: report]");
    expect(ins.textContent).toBe("[đã thêm: summary]");
    expect(del.querySelector(".sr-only")).not.toBeNull();
    expect(ins.querySelector(".sr-only")).not.toBeNull();
  });

  it("marks the change with a strike / underline, not colour alone", () => {
    expect(displayCss).toMatch(
      /\.ui-text-diff-removed\s*\{[^}]*text-decoration-line:\s*line-through/,
    );
    expect(displayCss).toMatch(/\.ui-text-diff-added\s*\{[^}]*text-decoration-line:\s*underline/);
    expect(displayCss).toMatch(/\.ui-text-diff-body[^{]*\{[^}]*white-space:\s*pre-wrap/);
  });

  it("passes lang through to the element", () => {
    const { container } = render(<TextDiff before="承認" after="却下" lang="ja" />);
    expect(container.querySelector("[data-slot='text-diff']")!.getAttribute("lang")).toBe("ja");
  });

  it("split mode shows before and after side by side under headings", () => {
    const { container } = render(<TextDiff mode="split" before="a old b" after="a new b" />);
    expect(screen.getByText("Trước")).toBeTruthy();
    expect(screen.getByText("Sau")).toBeTruthy();
    const before = container.querySelector("[data-side='before']")!;
    const after = container.querySelector("[data-side='after']")!;
    expect(before.querySelector("del")!.textContent).toContain("old");
    expect(before.querySelector("ins")).toBeNull();
    expect(after.querySelector("ins")!.textContent).toContain("new");
    expect(after.querySelector("del")).toBeNull();
  });

  it("folds a long unchanged run and reveals it on request", () => {
    const lines = Array.from({ length: 20 }, (_, index) => `line ${index}`);
    const before = lines.join("\n");
    const after = [...lines.slice(0, 19), "changed"].join("\n");
    const { container } = render(<TextDiff before={before} after={after} contextLines={2} />);

    expect(container.textContent).not.toContain("line 3\n");
    expect(container.textContent).toContain("line 17");
    const button = screen.getByRole("button", { name: "Hiện 17 dòng không đổi" });
    fireEvent.click(button);
    expect(container.textContent).toContain("line 3\n");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("does not fold when collapseUnchanged is false", () => {
    const lines = Array.from({ length: 20 }, (_, index) => `line ${index}`);
    render(
      <TextDiff
        before={lines.join("\n")}
        after={[...lines.slice(0, 19), "changed"].join("\n")}
        collapseUnchanged={false}
      />,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});
