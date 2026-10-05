# @godxjp/block-editor

A Notion / note.com style block editor for GoDX apps, on Tiptap v3 (MIT parts only). It reads and
writes **Markdown**: the document is `@godxjp/markdown/codec`'s, so what `onValueChange` returns is
byte-for-byte `normalize(body)` — the same canonical form a server computes with the same codec.

```tsx
import { BlockEditor } from "@godxjp/block-editor";

<BlockEditor
  aria-label="本文"
  value={body}
  onValueChange={setBody}
  upload={async (file, { signal }) => ({ url: await media.put(file, { signal }), name: file.name })}
  pickMedia={() => media.pick()}
  suggestWikilinks={(query) => pages.search(query)}
  renderEmbed={(target) => <PageEmbed target={target} />}
  resolveUrl={(url) => (url.startsWith("asset:") ? media.url(url) : undefined)}
/>;
```

## What it does

- **`/` block menu** at the caret (also `／` from a Japanese keyboard): text, headings, lists,
  to-do, quote, callout, code, divider, image, table, toggle, columns — filtered as you type
  (`h2`, `ｈ２`, `見出し`), ↑↓ Enter Esc. Host rows through `actions`.
- **⋮⋮ handle and +** beside the block under the pointer (the caret's block on touch): drag to move,
  click for turn into / duplicate / move / delete. From the keyboard: Alt+Shift+↑/↓ moves a block,
  Mod+/ opens its menu.
- **Format toolbar** on a selection: bold, italic, strikethrough, code, link (only marks Markdown
  can store — there is no underline).
- **Markdown shortcuts** (`# `, `- `, `1. `, `> `, ` ``` `, `---`, `[[x]]`), and plain-text
  paste is read as Markdown.
- **Uploads**: paste / drop / pick a file → an inline placeholder with progress; failure offers
  Retry / Remove; deleting the placeholder aborts the host's `signal`.
- **Lossless**: anything the editor does not model (raw HTML, footnotes, an unknown directive) is a
  raw block showing its source, editable as source.
- **IME-safe** (menus read the committed document), **ja / en / vi**, a named `textbox` with the
  WAI-ARIA popup wiring on the `/` and `[[` lists, the kit's Prose as the editing surface.

## Contract

| prop                                                                     |                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------- |
| `value` / `defaultValue` / `onValueChange`                               | Markdown in, canonical Markdown out                     |
| `upload(file, { signal })`                                               | `→ { url, name? }` — the same shape as `MarkdownEditor` |
| `pickMedia()`                                                            | `→ { url, name? } \| null` — the host's library         |
| `suggestWikilinks(query)`                                                | `→ { target, label?, heading?, description? }[]`        |
| `renderEmbed(target)`                                                    | a block embed `![[target]]`                             |
| `resolveUrl(url)`                                                        | display URL for a stored one (`asset:<id>`)             |
| `actions`, `labels`, `disabled`, `readOnly`, `autoFocus`, `aria-*`, `id` |                                                         |

The grammar it reads and writes is specified in `@godxjp/markdown`'s README ("Grammar v1 and the
codec"). The editor's schema is tested to round-trip every fixture exactly:
`serialize(editor.getJSON()) === normalize(markdown)`.
