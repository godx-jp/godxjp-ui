/**
 * THE SHARED FIXTURE CORPUS (gh#1108). Input Markdown → the exact sanitised HTML this renderer
 * produces with its defaults. Browser, server and export paths (a PHP exporter included) conform to
 * these rather than to each other: "same output" is checked against one list, not argued about.
 *
 * `hostile` fixtures carry an attack; `forbidden` lists substrings that must never appear in their
 * output, so a schema change that re-opens one fails even if somebody re-blesses the HTML.
 *
 * Changing an expected `html` for an existing input is a renderer change: bump `RENDERER_VERSION`.
 *
 * The HTML is the renderer's, not React's: compare after removing the `<link rel="preload">` React's
 * static renderer adds for each image (`normalizeFixtureHtml` in the tests).
 */
export type MarkdownFixture = {
  name: string;
  markdown: string;
  html: string;
  hostile?: boolean;
  forbidden?: string[];
};

export const MARKDOWN_FIXTURES: MarkdownFixture[] = [
  {
    name: "headings get GitHub anchors, de-duplicated",
    markdown: "# 概要\n\n## Setup\n\n## Setup",
    html: '<h1 id="概要">概要</h1>\n<h2 id="setup">Setup</h2>\n<h2 id="setup-1">Setup</h2>',
  },
  {
    name: "emphasis, strong, strikethrough, inline code",
    markdown: "*em* **strong** ~~gone~~ `code`",
    html: "<p><em>em</em> <strong>strong</strong> <del>gone</del> <code>code</code></p>",
  },
  {
    name: "GFM table with alignment, in its scroll box",
    markdown: "| a | b |\n|:--|--:|\n| 1 | 2 |",
    // Every table sits in its own scroll box (gh#1131, renderer v2); a single short token per
    // cell carries `data-short` (gh#1150, renderer v3).
    html: '<div class="ui-prose-table-scroll" data-slot="prose-table-scroll"><table><thead><tr><th data-short="" style="text-align:left">a</th><th data-short="" style="text-align:right">b</th></tr></thead><tbody><tr><td data-short="" style="text-align:left">1</td><td data-short="" style="text-align:right">2</td></tr></tbody></table></div>',
  },
  {
    name: "task list stays read-only",
    markdown: "- [x] done\n- [ ] todo",
    html: '<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled="" checked=""/> done</li>\n<li class="task-list-item"><input type="checkbox" disabled=""/> todo</li>\n</ul>',
  },
  {
    name: "fenced code keeps its language class",
    markdown: "```ts\nconst a = 1;\n```",
    html: '<pre><code class="language-ts">const a = 1;\n</code></pre>',
  },
  {
    name: "links and autolinks",
    markdown: "[docs](https://example.com/a) <https://example.com> mail@example.com",
    html: '<p><a href="https://example.com/a">docs</a> <a href="https://example.com">https://example.com</a> <a href="mailto:mail@example.com">mail@example.com</a></p>',
  },
  {
    name: "relative and fragment links pass",
    markdown: "[a](/wiki/Page) [b](#setup) [c](other)",
    html: '<p><a href="/wiki/Page">a</a> <a href="#setup">b</a> <a href="other">c</a></p>',
  },
  {
    name: "image by URL",
    markdown: "![chart](https://cdn.example.com/c.png)",
    html: '<p><img src="https://cdn.example.com/c.png" alt="chart"/></p>',
  },
  {
    name: "footnote link and its target agree",
    markdown: "Text[^1]\n\n[^1]: Note.",
    html: '<p>Text<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="true" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="true" class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>Note. <a href="#user-content-fnref-1" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>',
  },
  {
    name: "mermaid fence before the diagram has rendered",
    markdown: "```mermaid\ngraph TD; A-->B\n```",
    html: '<figure data-mermaid="code"><div hidden=""></div><pre data-mermaid="code"><code class="language-mermaid">graph TD; A--&gt;B\n</code></pre></figure>',
  },
  {
    name: "raw HTML blocks are dropped, never parsed",
    hostile: true,
    markdown:
      '<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n<div id="app-sidebar">x</div>',
    html: "\n\n",
    forbidden: ["<script", "<img", "onerror", "app-sidebar"],
  },
  {
    name: "inline raw HTML is dropped, its text kept",
    hostile: true,
    markdown: 'a <b onclick="alert(1)">bold</b> <iframe src="https://evil.example"></iframe> z',
    html: "<p>a bold  z</p>",
    forbidden: ["<b", "onclick", "<iframe", "evil.example"],
  },
  {
    name: "javascript: and data: links are dropped",
    hostile: true,
    markdown:
      "[a](javascript:alert(1)) [b](JAVASCRIPT:alert(1)) [c](data:text/html,<script>alert(1)</script>) [d](vbscript:x)",
    html: "<p><a>a</a> <a>b</a> <a>c</a> <a>d</a></p>",
    forbidden: ["javascript:", "JAVASCRIPT:", "data:", "vbscript:"],
  },
  {
    name: "a scheme split by control characters is dropped",
    hostile: true,
    markdown: "[a](<java\tscript:alert(1)>)",
    html: "<p><a>a</a></p>",
    forbidden: ["script:"],
  },
  {
    name: "data: and javascript: images are dropped",
    hostile: true,
    markdown: "![x](data:image/svg+xml;base64,PHN2Zz4=) ![y](javascript:alert(1))",
    html: '<p><img alt="x"/> <img alt="y"/></p>',
    forbidden: ["data:", "javascript:"],
  },
  // Grammar v1 (gh#1156, renderer v4): the constructs the codec and @godxjp/block-editor model.
  {
    name: "CJK-friendly emphasis next to 、。「」（）",
    markdown: "の**「強調」**です。（*注*）「[リンク](https://example.com/)」、**太字**。",
    html: '<p>の<strong>「強調」</strong>です。（<em>注</em>）「<a href="https://example.com/">リンク</a>」、<strong>太字</strong>。</p>',
  },
  {
    name: "callout with a title, and one without",
    markdown: "> [!WARNING] Careful\n> Body\n\n> [!tip]\n> No title",
    html: '<div class="ui-prose-callout" data-kind="warning" role="note">\n<p class="ui-prose-callout-title">Careful</p>\n<p>Body</p>\n</div>\n<div class="ui-prose-callout" data-kind="tip" role="note">\n<p class="ui-prose-callout-title">Tip</p>\n<p>No title</p>\n</div>',
  },
  {
    name: "a fold marker or unknown kind stays a quote",
    markdown: "> [!NOTE]- folded\n\n> [!INFO] unknown",
    html: "<blockquote>\n<p>[!NOTE]- folded</p>\n</blockquote>\n<blockquote>\n<p>[!INFO] unknown</p>\n</blockquote>",
  },
  {
    name: "toggle with an inline summary",
    markdown: ":::toggle[Read *more*]\nBody\n:::",
    html: '<details class="ui-prose-toggle"><summary class="ui-prose-toggle-summary">Read <em>more</em></summary><p>Body</p></details>',
  },
  {
    name: "columns with a width and an equal share",
    markdown: "::::columns\n:::column{width=40}\nLeft\n:::\n\n:::column\nRight\n:::\n::::",
    html: '<div class="ui-prose-columns"><div class="ui-prose-column" style="--prose-column-grow:40"><p>Left</p></div><div class="ui-prose-column" style="--prose-column-grow:60"><p>Right</p></div></div>',
  },
  {
    name: "wikilinks, embeds and times stay text",
    markdown: "See [[Page#Intro|intro]] at 10:30.\n\n![[Diagram]]",
    html: "<p>See [[Page#Intro|intro]] at 10:30.</p>\n<p>![[Diagram]]</p>",
  },
  {
    // Renderer v5 (gh#1163): YAML front matter is metadata, not body. Before v5 it rendered as an
    // <hr> plus a setext <h2> holding the YAML text.
    name: "YAML front matter renders nothing",
    markdown: "---\ntitle: Spec\ntags: [a]\n---\n\n# Heading\n\nBody",
    html: '<h1 id="heading">Heading</h1>\n<p>Body</p>',
    forbidden: ["title: Spec", "<hr"],
  },
];
