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

## Stored versions

Record `MARKDOWN_FORMAT` (`"md"`) and `RENDERER_VERSION` on every saved version.
`RENDERER_VERSION` changes when the same input renders differently.

## Fixtures

`MARKDOWN_FIXTURES` is the shared corpus: input Markdown → the exact sanitised HTML, with `forbidden`
substrings for the hostile ones. A server or export path conforms to this list.
