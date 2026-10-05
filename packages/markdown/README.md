# @godxjp/markdown

The one Markdown renderer for GoDX apps (godx-task, godx-content, and later mailer, chatter and
approval). One pipeline, one sanitiser schema, one fixture corpus — so a security fix happens once.

````bash
pnpm add @godxjp/markdown        # + `mermaid` (optional) to draw ```mermaid fences
````

```tsx
import { Prose } from "@godxjp/ui/data-display";
import { Markdown } from "@godxjp/markdown";

<Prose>
  <Markdown>{page.body}</Markdown>
</Prose>;
```

## What it renders

GFM — tables, task lists (read-only), fenced code with `language-*` classes, autolinks, footnotes,
strikethrough — and an `id` on every heading (GitHub slugs, de-duplicated). The output is the same
as `react-markdown` + `remark-gfm` + `rehype-sanitize`, which is what the apps rendered before.

Every table renders inside a scroll box (`.ui-prose-table-scroll`, styled by `Prose`), keyboard-
focusable only while it overflows, so a wide table scrolls instead of widening the page.

## Safety

- **No raw HTML.** HTML in the source is dropped, never parsed into elements.
- **One schema** (`markdownSchema`): links allow `http`, `https`, `mailto` and relative URLs;
  images allow `http`, `https` and relative URLs. `javascript:`, `data:` and every other scheme are
  removed — including a scheme split by tabs or newlines. SVG is never inlined from a URL.
- **Mermaid is a picture only after its SVG passes `checkMermaidSvg`**: no `<script>`,
  `<foreignObject>`, `<a>`, `<image>`, event handlers, non-fragment `href`, `url()` that leaves the
  document, or `@import`. A diagram that fails, or a host without `mermaid`, shows the code.

## Host extension points

| prop                                   | use                                                                                                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `remarkPlugins`                        | Host markers (callouts, embeds). Their output is still sanitised.                                                                                                                     |
| `schema`                               | `{ tagNames, attributes }` the markers need. A rule for an attribute the base already constrains is merged into it (`code` `className` + `math-inline`). Cannot widen the URL policy. |
| `resolveUrl(url, key)`                 | Map a host scheme (`asset:…`) to a real URL before the sanitiser judges it.                                                                                                           |
| `headingId({ depth, text, index })`    | Use server-assigned anchors instead of slugs.                                                                                                                                         |
| `components`                           | Element overrides. Mermaid fences are drawn before a host `pre` is asked, so a host code renderer keeps Mermaid.                                                                      |
| `rehypePlugins`                        | Run after the sanitiser — presentation only.                                                                                                                                          |
| `mermaid={false}`                      | Keep ```mermaid fences as code (or hand them to the host `pre`).                                                                                                                      |
| `allowedElements` / `unwrapDisallowed` | Narrow a body (an activity feed: `strong`, `em`, `del`, `code`). Only removes.                                                                                                        |
| `shortCellLength`                      | A table cell holding one short token (no whitespace, ≤ 24 characters by default) gets `data-short`; `Prose` keeps it on one line. `false` turns it off.                               |

Images: wrap the body in `<Prose imagePreview>` and every body image opens the kit preview, paging
through the others — no `img` override needed. Images in table cells keep min(natural width, 20rem),
so a narrow table scrolls instead of squashing them.

## Grammar v1 and the codec (`@godxjp/markdown/codec`)

The renderer (`RENDERER_VERSION` 5), the codec and `@godxjp/block-editor` read one syntax, from one
set of parsers, so a body means the same thing in the editor, on a server and on the page.

### Syntax

- **GFM** — tables, task lists, strikethrough, autolinks, footnotes.
- **CJK-friendly emphasis** — `の**「強調」**です` is strong. CommonMark's flanking rules leave
  literal asterisks next to 、。「」（）; the codec, the renderer and the editor all use the
  CJK-friendly extension.
- **Callout** — a GitHub alert: `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`
  (kind case-insensitive on input, written uppercase), optional plain-text title on the same line
  (`> [!WARNING] Title`); the rest of the quote is the body. A fold marker (`[!NOTE]-` / `+`) or an
  unknown kind is NOT a callout: it stays an ordinary blockquote, marker verbatim.
- **Toggle** — `:::toggle[Summary *inline*]` … `:::`. Body is any blocks; toggles nest, and sit
  inside callouts and columns. Open state is not stored.
- **Columns** — 2–4 columns, each with an optional `width` (integer percent 1–100; columns without
  one share the remainder equally). Columns never nest.

  ```md
  ::::columns
  :::column{width=40}
  Left
  :::

  :::column
  Right
  :::
  ::::
  ```

  Only container directives exist: the fence of a directive is one colon longer than the deepest
  directive inside it, so the innermost fence is always `:::`. There are no text (`:name`) or leaf
  (`::name`) directives — `10:30` is prose.

- **Wikilinks and embeds, verbatim** — `[[target]]`, `[[target#heading]]`, `[[target|label]]`,
  `![[embed]]` (a block when alone on its line; the inner text is kept verbatim — `![[B#見出し]]`, `![[img.png|300]]`). Marks around them survive (`**[[x]]**`). Inside a table cell write `[[x\|label]]`.
- **`asset:` images** — `![alt](asset:id)` round-trips as written (the renderer resolves it through
  `resolveUrl`).
- **Raw blocks** — anything the document does not model (raw HTML, footnote definitions, link
  reference definitions, an unknown or malformed directive, a fence with a meta string) is kept as
  Markdown that parses back to the same thing. Mermaid is an ordinary ` ```mermaid ` fence.

### Codec

```ts
import { CODEC_ID, normalize, parse, serialize } from "@godxjp/markdown/codec";

CODEC_ID; // "kit-md@1" — bumped whenever serialize would write a body differently
const doc = parse(markdown); // plain JSON, ProseMirror/Tiptap shape
const md = serialize(doc); // canonical Markdown
normalize(markdown) === serialize(parse(markdown)); // what the editor saves
normalize(normalize(x)) === normalize(x); // idempotent, for every fixture
```

Pure: no React, no DOM, no editor — it runs on a server and in a Cloudflare Worker.

**Canonical form** (what `serialize` writes): ATX headings; `-` bullets; `1.` ordered lists;
`*em*`; `**strong**`; ` ``` ` fences (an indented code block becomes fenced); `---` rules;
`- [ ]` / `- [x]` todos; GFM tables with padded cells and an alignment row; a callout's body after a
`>` blank line; one blank line between blocks; LF; a trailing newline; an empty document is `""`.

## Stored versions

Record `MARKDOWN_FORMAT` (`"md"`) and `RENDERER_VERSION` on every saved version.
`RENDERER_VERSION` changes when the same input renders differently.

## Fixtures

`MARKDOWN_FIXTURES` is the shared corpus: input Markdown → the exact sanitised HTML, with `forbidden`
substrings for the hostile ones. A server or export path conforms to this list.
