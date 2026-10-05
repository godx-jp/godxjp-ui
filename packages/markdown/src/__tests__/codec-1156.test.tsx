import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CODEC_ID, normalize, parse, serialize, type DocNode } from "../codec";
import { MARKDOWN_FIXTURES } from "../fixtures";
import { Markdown } from "../markdown";

/**
 * gh#1156 — the pure codec behind `@godxjp/block-editor`. Three properties, on the whole shared
 * corpus plus grammar v1 and Japanese emphasis:
 *   1. idempotent — normalize(normalize(x)) === normalize(x);
 *   2. lossless — the renderer draws normalize(x) exactly as it draws x;
 *   3. canonical — one document, one Markdown (the forms the spec lists).
 */
const html = (markdown: string) =>
  renderToStaticMarkup(<Markdown>{markdown}</Markdown>).replace(/<link rel="preload"[^>]*\/>/g, "");

const JA = [
  "の**「強調」**です。",
  "前の**強調**、後ろ。",
  "（**括弧の中**）と「*斜体*」。",
  "「[リンク](https://example.com/)」、**太字**。",
  "**太字**です（注）。*斜体*！",
  "強調は**「ここ」**まで、*（注）*も。",
];

const GRAMMAR = [
  "> [!WARNING] Careful\n> Body *x*",
  "> [!NOTE]\n> Body\n>\n> - item",
  "> [!NOTE]- fold\n> body",
  ":::toggle[Summary *x*]\nBody\n\n:::toggle[Inner]\nDeep\n:::\n:::",
  // Fence depth (spec): each directive's fence is one colon longer than the deepest inside it.
  ":::::columns\n::::column{width=40}\n# Left\n\n> [!TIP]\n> inside\n::::\n\n::::column\n:::toggle[T]\nx\n:::\n::::\n:::::",
  "See [[Page]], [[Page#Intro|the intro]], ![[inline]] embed.\n\n![[Block embed]]",
  "| a | b |\n| - | - |\n| [[x\\|label]] | ![i](asset:abc) |",
  "<div>raw html</div>\n\nText[^1] and [ref][r].\n\n[^1]: A footnote.\n\n[r]: https://example.com/",
  "```js title=x\nconst a = 1\n```\n\n```mermaid\ngraph TD; A-->B\n```",
  "- [ ] todo\n- [x] done\n\n1. one\n2. two\n\n- tight\n- list",
  "- loose\n\n- list",
  "time 10:30, note:x, a :b c",
];

const ALL = [...MARKDOWN_FIXTURES.map((f) => f.markdown), ...JA, ...GRAMMAR];

describe("codec (gh#1156)", () => {
  it("identifies its output format", () => {
    expect(CODEC_ID).toBe("kit-md@1");
  });

  it.each(ALL)("is idempotent and lossless: %j", (markdown) => {
    const once = normalize(markdown);
    expect(normalize(once)).toBe(once);
    expect(html(once)).toBe(html(markdown));
  });

  it("keeps Japanese emphasis readable — no character references, still strong", () => {
    for (const markdown of JA) {
      const out = normalize(markdown);
      expect(out, markdown).not.toMatch(/&#x/);
      expect(out.trimEnd(), markdown).toBe(markdown);
    }
    const marks = JSON.stringify(parse(JA[0]!));
    expect(marks).toContain('"type":"bold"');
  });

  it("writes the canonical form", () => {
    expect(
      normalize(
        "Title\n=====\n\n* a\n* b\n\n1) x\n2) y\n\nPara\n\n    code\n\n___\n\n_em_ __strong__",
      ),
    ).toBe(
      "# Title\n\n- a\n- b\n\n1. x\n2. y\n\nPara\n\n```\ncode\n```\n\n---\n\n*em* **strong**\n",
    );
    expect(normalize("> [!tip] Hi\n> body")).toBe("> [!TIP] Hi\n>\n> body\n");
    expect(normalize("")).toBe("");
    expect(normalize("a\r\nb")).toBe(normalize("a\nb"));
  });

  it("keeps wikilinks, embeds, asset images, times and fold markers verbatim", () => {
    for (const verbatim of [
      "See [[Page]] and [[Page#Intro|the intro]].",
      "![[Diagram]]",
      "![alt](asset:abc123)",
      "time 10:30 and note:x",
      "> [!NOTE]- folded",
    ]) {
      expect(normalize(verbatim)).toBe(`${verbatim}\n`);
    }
    expect(normalize("| a |\n| - |\n| [[x\\|y]] |")).toContain("[[x\\|y]]");
  });

  it("models grammar v1 as Tiptap-shaped nodes", () => {
    const types = (node: DocNode): string[] => [node.type, ...(node.content ?? []).flatMap(types)];
    const doc = parse(GRAMMAR.join("\n\n"));
    for (const type of [
      "callout",
      "details",
      "detailsSummary",
      "detailsContent",
      "columns",
      "column",
      "wikilink",
      "embedInline",
      "embed",
      "table",
      "taskList",
      "taskItem",
      "rawBlock",
      "rawInline",
      "image",
    ]) {
      expect(types(doc), type).toContain(type);
    }
    expect(parse("> [!WARNING] T\n> b").content[0]).toMatchObject({
      type: "callout",
      attrs: { kind: "warning", title: "T" },
    });
    expect(
      parse("::::columns\n:::column{width=40}\nA\n:::\n:::column\nB\n:::\n::::").content[0],
    ).toMatchObject({
      type: "columns",
      content: [
        { type: "column", attrs: { width: 40 } },
        { type: "column", attrs: { width: null } },
      ],
    });
  });

  it("keeps a malformed construct as a raw block instead of guessing", () => {
    const columns = (inner: string) => `:::::columns\n${inner}\n:::::`;
    const col = (body: string, attrs = "") => `:::column${attrs}\n${body}\n:::`;
    const cases = {
      oneColumn: columns(col("A")),
      fiveColumns: columns([1, 2, 3, 4, 5].map((n) => col(String(n))).join("\n\n")),
      badWidth: columns([col("A", "{width=0}"), col("B")].join("\n\n")),
      strayParagraph: columns(["text", col("A"), col("B")].join("\n\n")),
      // A column holding a column row: the outer row is real, the inner one is kept raw.
      nested:
        "::::::columns\n:::::column\n::::columns\n:::column\nA\n:::\n\n:::column\nB\n:::\n::::\n:::::\n\n:::::column\nC\n:::::\n::::::",
      unknown: ":::aside[x]{a=1}\nbody\n:::",
    };
    for (const [name, markdown] of Object.entries(cases)) {
      const doc = parse(markdown);
      const flat = JSON.stringify(doc);
      expect(flat, name).toContain("rawBlock");
      expect(normalize(normalize(markdown)), name).toBe(normalize(markdown));
    }
    // The nested row's OUTER columns are real; only the inner one is raw.
    expect(parse(cases.nested).content[0]!.type).toBe("columns");
  });

  it("serializes a document built by hand — what the editor hands back", () => {
    const doc: DocNode = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "見出し" }] },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "の" },
            { type: "text", text: "「強調」", marks: [{ type: "bold" }] },
            { type: "text", text: "です " },
            { type: "wikilink", attrs: { target: "Page", heading: null, label: "x" } },
          ],
        },
        {
          type: "callout",
          attrs: { kind: "note", title: null },
          content: [{ type: "paragraph", content: [{ type: "text", text: "body" }] }],
        },
      ],
    };
    expect(serialize(doc)).toBe(
      "## 見出し\n\nの**「強調」**です [[Page|x]]\n\n> [!NOTE]\n>\n> body\n",
    );
  });

  /* From the pages app's run over 247 real document bodies. */
  it("keeps a table's header width: excess cells GFM hides stay hidden", () => {
    expect(normalize("| a | b |\n|---|---|\n| 1 | 2 | 3 |\n")).toBe(
      "| a | b |\n| - | - |\n| 1 | 2 |\n",
    );
    // A pipe inside inline code splits the cell under GFM too — and still adds no column.
    const piped = "| `x|y` | 2 |\n| --- | - |\n| a | b |";
    expect(html(normalize(piped))).toBe(html(piped));
    expect(normalize(normalize(piped))).toBe(normalize(piped));
  });

  it("pads table cells by display width, so CJK columns line up", () => {
    expect(normalize("| 列 | b |\n|---|---|\n| 優先度 | 2 |")).toBe(
      "| 列     | b |\n| ------ | - |\n| 優先度 | 2 |\n",
    );
  });

  it("keeps an embed's inner text verbatim — heading and size included", () => {
    for (const embed of ["![[B#見出し]]", "![[img.png|300]]", "See ![[B#見出し]] inline."]) {
      expect(normalize(embed)).toBe(`${embed}\n`);
    }
    expect(parse("![[B#見出し]]").content[0]).toMatchObject({
      type: "embed",
      attrs: { target: "B#見出し" },
    });
  });

  it("keeps the marks around a wikilink, an embed, an image and a line break", () => {
    for (const marked of [
      "**[[強調リンク]]**",
      "*[[Page|label]]* and ~~[[x]]~~",
      "[![img](https://example.com/a.png)](https://example.com/)",
      "**a\\\nb**",
      "**see ![[inline]]**",
    ]) {
      const once = normalize(marked);
      expect(once.trimEnd(), marked).toBe(marked);
      expect(html(once), marked).toBe(html(marked));
    }
  });
});
