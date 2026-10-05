import { Editor } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import { normalize, parse, serialize } from "@godxjp/markdown/codec";
import { MARKDOWN_FIXTURES } from "@godxjp/markdown";

import { schemaExtensions } from "../extensions";

/**
 * gh#1156 — the editor's schema IS the codec's document. Loading any body into a real Tiptap editor
 * and reading it back must give exactly `normalize(body)`: what the editor saves is what the server
 * normalizes to, byte for byte. Nothing the codec models may be dropped or reshaped by the schema.
 */
const editor = () =>
  new Editor({
    extensions: schemaExtensions({
      placeholder: "",
      headingPlaceholder: () => "",
      togglePlaceholder: "",
      calloutTitles: {
        note: "Note",
        tip: "Tip",
        important: "Important",
        warning: "Warning",
        caution: "Caution",
      },
    }),
  });

const CASES = [
  ...MARKDOWN_FIXTURES.map((f) => f.markdown),
  "の**「強調」**です。（*注*）「[リンク](https://example.com/)」",
  "> [!WARNING] Careful\n> Body *x*\n\n> [!NOTE]\n> plain",
  ":::toggle[Summary *x*]\nBody\n\n- a\n- b\n:::",
  ":::::columns\n::::column{width=40}\n# Left\n\n> [!TIP]\n> inside\n::::\n\n::::column\n:::toggle[T]\nx\n:::\n::::\n:::::",
  "See [[Page]], [[Page#Intro|the intro]], ![[inline]].\n\n![[Block embed]]",
  "| a | b |\n| :- | -: |\n| [[x\\|label]] | ![i](asset:abc) |",
  "<div>raw</div>\n\nText[^1] [ref][r]\n\n[^1]: note\n\n[r]: https://example.com/",
  "- [ ] todo\n- [x] done\n  - nested\n\n1. one\n2. two\n\n- loose\n\n- list",
  "```ts\nconst a = 1\n```\n\n```js title=x\nmeta\n```\n\n---\n\n## H2\n\n###### H6",
  "line one\\\nline two",
  // Marks around inline atoms, and embeds with a heading or a size (pages' findings).
  "**[[強調リンク]]**, *[[Page|label]]*, **see ![[inline]]**",
  "[![img](https://example.com/a.png)](https://example.com/)",
  "![[B#見出し]]\n\n![[img.png|300]]",
  "**a\\\nb**",
  // YAML front matter, the page's properties (gh#1163).
  "---\ntitle: 見積\ntags: [spec]\n---\n\n# 本文",
  "",
];

describe("editor schema ≡ codec document (gh#1156)", () => {
  it.each(CASES)("round-trips %j through Tiptap exactly", (markdown) => {
    const instance = editor();
    instance.commands.setContent(parse(markdown));
    expect(serialize(instance.getJSON())).toBe(normalize(markdown));
    instance.destroy();
  });
});
