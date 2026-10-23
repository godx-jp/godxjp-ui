import { readFileSync } from "node:fs";
import { join } from "node:path";

import katex from "katex";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CODE_TOKENS } from "../highlight";
import { Markdown } from "../markdown";
import { KATEX_OPTIONS } from "../math";

/**
 * Renderer v6: KaTeX math and `data-code-token` syntax colour, both produced BEFORE the sanitiser.
 * The fixture corpus pins exact HTML; these pin the properties behind it.
 */
const render = (markdown: string, props: Partial<Parameters<typeof Markdown>[0]> = {}) =>
  renderToStaticMarkup(<Markdown {...props}>{markdown}</Markdown>);

/** Every element in document order as `tag.class.class[attr,attr]` — what the sanitiser could cut. */
function shape(html: string): string[] {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  return Array.from(doc.body.querySelectorAll("*")).map((el) => {
    const classes = Array.from(el.classList).sort().join(".");
    const attrs = Array.from(el.attributes)
      .map((a) => a.name.toLowerCase())
      .filter((name) => name !== "class")
      .sort()
      .join(",");
    return `${el.localName}.${classes}[${attrs}]`;
  });
}

const FORMULAS = [
  "x^2 + y_i",
  "\\frac{a}{b}",
  "\\sqrt{x} + \\sqrt[3]{y}",
  "\\int_0^1 f(x)\\,dx",
  "\\sum_{i=1}^n i = \\frac{n(n+1)}{2}",
  "\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}",
  "\\begin{aligned}a&=b\\\\c&=d\\end{aligned}",
  "\\begin{cases}a&x>0\\\\b&x\\le0\\end{cases}",
  "\\overrightarrow{AB} \\widehat{xyz} \\overline{z} \\underbrace{a+b}_{n}",
  "\\left(\\frac{a}{b}\\right) \\Bigg[ x \\Bigg]",
  "\\color{red}{x} \\colorbox{yellow}{y} \\fcolorbox{red}{blue}{z} \\boxed{w}",
  "\\mathbb{R} \\mathcal{L} \\mathrm{d} \\operatorname{sin} x \\lim_{x\\to 0}",
  "\\xrightarrow{f} \\cancel{x} \\binom{n}{k} \\hat{x}\\tilde{y}\\vec{z}",
  "\\text{面積} = a \\times b",
  "\\begin{array}{|c|c|}\\hline a&b\\\\\\hline\\end{array}",
];

describe("math (renderer v6)", () => {
  it.each(FORMULAS)("the sanitiser keeps everything KaTeX emits: %s", (formula) => {
    for (const displayMode of [false, true]) {
      const markdown = displayMode ? `$$\n${formula}\n$$` : `$${formula}$`;
      const expected = katex.renderToString(formula, { ...KATEX_OPTIONS, displayMode });
      expect(shape(render(markdown))).toEqual(shape(displayMode ? expected : `<p>${expected}</p>`));
    }
  });

  it("draws $…$, $$…$$ and a ```math fence, and keeps the TeX source for assistive tech", () => {
    const html = render("Inline $a\\,b$.\n\n$$\nx^2\n$$\n\n```math\n\\frac{1}{2}\n```");
    expect(html.match(/class="katex"/g)).toHaveLength(3);
    expect(html.match(/class="katex-display"/g)).toHaveLength(2);
    expect(html).toContain('<annotation encoding="application/x-tex">a\\,b</annotation>');
    expect(html).not.toContain("language-math");
  });

  it("dollar amounts stay prose (Pandoc's single-dollar rule)", () => {
    for (const prose of [
      "$5 and $10",
      "$5-$10",
      "from $5 to $ 10",
      "$x$1",
      "a\\$b\\$",
      "$5-\\$10",
    ]) {
      expect(render(prose), prose).not.toContain("katex");
    }
    expect(render("$$5 and $$")).toContain("katex");
  });

  it("is still narrowed by allowedElements: a feed without math shows the formula's text", () => {
    const html = render("a $x$ b", { allowedElements: ["p"], unwrapDisallowed: true });
    expect(html).not.toContain("<span");
    expect(html).toContain("a ");
  });
});

describe("syntax colour (renderer v6)", () => {
  it("emits exactly the token names the kit's Prose / CodeBlock stylesheet colours", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
    const styled = new Set([...css.matchAll(/\[data-code-token="([a-z-]+)"\]/g)].map((m) => m[1]));
    expect([...CODE_TOKENS].sort()).toEqual([...styled].sort());
  });

  it("tokenises the curated languages and their aliases, with no class left behind", () => {
    const samples: Record<string, string> = {
      ts: "export async function load(slug: string): Promise<number> { return 1; } // x",
      js: "const re = /a+/g; const s = `a${b}`;",
      py: "def f(x):\n    return 'a'  # c",
      sh: 'echo "$HOME" | grep -v x',
      yml: "key: value # c\nlist:\n  - 1",
      json: '{"a": 1, "b": true}',
      html: '<a href="#x">y</a>',
      css: ".a { color: red; }",
      sql: "SELECT id FROM pages WHERE id = 1;",
      diff: "+ added\n- removed",
      go: 'func main() { fmt.Println("x") }',
      rust: 'fn main() { println!("x"); }',
      php: "<?php $a = 1;",
      java: "public class A { int x = 1; }",
    };
    const seen = new Set<string>();
    for (const [language, code] of Object.entries(samples)) {
      const html = render(`\`\`\`${language}\n${code}\n\`\`\``);
      const tokens = [...html.matchAll(/data-code-token="([a-z-]+)"/g)].map((m) => m[1]!);
      expect(tokens.length, language).toBeGreaterThan(0);
      for (const token of tokens) {
        expect(CODE_TOKENS as readonly string[]).toContain(token);
        seen.add(token);
      }
      expect(html, language).not.toContain("hljs");
    }
    expect(seen.size).toBeGreaterThanOrEqual(9);
  });

  it("leaves mermaid, math, unknown and unlabelled fences as plain text", () => {
    const mermaid = render("```mermaid\ngraph TD; A-->B\n```");
    expect(mermaid).toContain('<figure data-mermaid="code">');
    expect(mermaid).not.toContain("data-code-token");
    expect(render("```\nconst a = 1\n```")).not.toContain("data-code-token");
    expect(render("```unknown\nconst a = 1\n```")).not.toContain("data-code-token");
    expect(render("`const a = 1`")).not.toContain("data-code-token");
  });

  it("a host `pre` receives the tokenised code; mermaid still reaches the gate first", () => {
    const components = {
      pre: ({ children }: { children?: React.ReactNode }) => <pre data-host="">{children}</pre>,
    };
    const html = render("```ts\nconst a = 1\n```\n\n```mermaid\ngraph TD; A-->B\n```", {
      components,
    });
    expect(html).toContain(
      '<pre data-host=""><code class="language-ts"><span data-code-token="keyword">',
    );
    expect(html).toContain('<figure data-mermaid="code">');
  });

  it("highlight={false} leaves code as plain text for a host highlighter", () => {
    expect(render("```ts\nconst a = 1\n```", { highlight: false })).toBe(
      '<pre><code class="language-ts">const a = 1\n</code></pre>',
    );
  });

  it("a body cannot mint a token attribute of its own", () => {
    const html = render('<span data-code-token="keyword">x</span> `y`');
    expect(html).not.toContain("data-code-token");
  });
});
