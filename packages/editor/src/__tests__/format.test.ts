import { describe, expect, it } from "vitest";

import {
  applyEdit,
  insertCodeBlock,
  insertLink,
  prefixLines,
  uploadedMarkdown,
  wrapSelection,
} from "../format";

const run = (text: string, edit: ReturnType<typeof wrapSelection>) => ({
  text: applyEdit(text, edit),
  selected: applyEdit(text, edit).slice(edit.select.start, edit.select.end),
});

describe("text operations (gh#1109)", () => {
  it("wraps a selection, and unwraps it when it is already wrapped", () => {
    const once = run("say hi", wrapSelection("say hi", { start: 4, end: 6 }, "**", "**", "text"));
    expect(once).toEqual({ text: "say **hi**", selected: "hi" });
    const twice = run(
      once.text,
      wrapSelection(once.text, { start: 6, end: 8 }, "**", "**", "text"),
    );
    expect(twice).toEqual({ text: "say hi", selected: "hi" });
  });

  it("with nothing selected, inserts the markers around a selected placeholder", () => {
    expect(run("a ", wrapSelection("a ", { start: 2, end: 2 }, "_", "_", "text"))).toEqual({
      text: "a _text_",
      selected: "text",
    });
  });

  it("prefixes every touched line, and removes the prefix when all carry it", () => {
    const text = "one\ntwo\nthree";
    const on = run(text, prefixLines(text, { start: 1, end: 6 }, "- "));
    expect(on.text).toBe("- one\n- two\nthree");
    const off = run(on.text, prefixLines(on.text, { start: 0, end: 11 }, "- "));
    expect(off.text).toBe(text);
  });

  it("numbers lines 1. 2. …, and un-numbers them", () => {
    const text = "a\nb";
    const on = applyEdit(text, prefixLines(text, { start: 0, end: 3 }, "", { numbered: true }));
    expect(on).toBe("1. a\n2. b");
    expect(
      applyEdit(on, prefixLines(on, { start: 0, end: on.length }, "", { numbered: true })),
    ).toBe(text);
  });

  it("a caret on one line prefixes only that line", () => {
    const text = "x\ny";
    expect(applyEdit(text, prefixLines(text, { start: 2, end: 2 }, "## "))).toBe("x\n## y");
  });

  it("a link keeps the selection as its text and selects the URL", () => {
    expect(run("see docs", insertLink("see docs", { start: 4, end: 8 }, "link"))).toEqual({
      text: "see [docs](url)",
      selected: "url",
    });
  });

  it("a code block goes on its own lines", () => {
    expect(applyEdit("ab", insertCodeBlock("ab", { start: 2, end: 2 }))).toBe("ab\n```\n\n```\n");
  });

  it("uploaded files: images embed, others link; brackets and spaces cannot break the syntax", () => {
    expect(uploadedMarkdown({ name: "a.png", type: "image/png" }, "https://x/a.png")).toBe(
      "![a.png](https://x/a.png)",
    );
    expect(
      uploadedMarkdown({ name: "spec [v2].pdf", type: "application/pdf" }, "https://x/a b.pdf"),
    ).toBe("[spec \\[v2\\].pdf](<https://x/a b.pdf>)");
  });
});

describe("bold toggle on a partly-bold selection (gh#1117)", () => {
  it("selecting `hi** new` inside `**hi** new` gives one bold run, not nested markers", () => {
    const text = "**hi** new";
    expect(run(text, wrapSelection(text, { start: 2, end: 10 }, "**", "**", "text"))).toEqual({
      text: "**hi new**",
      selected: "hi new",
    });
  });

  it("a selection holding a whole bold run inside it becomes one run", () => {
    const text = "say **hi** now";
    expect(run(text, wrapSelection(text, { start: 0, end: 14 }, "**", "**", "text"))).toEqual({
      text: "**say hi now**",
      selected: "say hi now",
    });
  });

  it("a selection ending inside a bold run absorbs its closer", () => {
    const text = "new **hi**";
    expect(run(text, wrapSelection(text, { start: 0, end: 8 }, "**", "**", "text"))).toEqual({
      text: "**new hi**",
      selected: "new hi",
    });
  });
});
