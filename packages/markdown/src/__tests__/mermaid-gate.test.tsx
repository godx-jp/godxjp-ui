import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { checkMermaidSvg, MermaidDiagram } from "../mermaid";

/** The shape mermaid emits with `htmlLabels: false`: a style sheet, markers, SVG text labels. */
const SAFE = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="m1" viewBox="0 0 100 50" role="graphics-document document" aria-roledescription="flowchart-v2">
<style>#m1{font-family:sans-serif;fill:#333}#m1 .node rect{stroke:#9370db;fill:#ececff}</style>
<defs><marker id="m1_arrow" viewBox="0 0 10 10" refX="5" refY="5"><path d="M0,0 L10,5 L0,10 z"/></marker><linearGradient id="g"><stop offset="0"/></linearGradient></defs>
<g class="root"><g class="node"><rect x="0" y="0" width="40" height="20" style="fill:#ececff"/><text x="5" y="15"><tspan>A</tspan></text></g>
<path d="M40,10 L60,10" marker-end="url(#m1_arrow)" fill="url('#g')"/><use href="#m1_arrow"/></g></svg>`;

const hostile = (inner: string, rootAttrs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${rootAttrs}>${inner}</svg>`;

describe("checkMermaidSvg — the SVG gate (gh#1108)", () => {
  it("passes a diagram made of shapes, text, markers and a local style sheet", () => {
    const result = checkMermaidSvg(SAFE);
    expect(result.ok).toBe(true);
  });

  const CASES: [string, string][] = [
    ["a <script>", hostile("<script>alert(1)</script>")],
    ["a <foreignObject> (HTML labels)", hostile("<foreignObject><div>x</div></foreignObject>")],
    ["an event handler on the root", hostile("<g/>", 'onload="alert(1)"')],
    ["an event handler on a child", hostile('<rect onclick="alert(1)"/>')],
    ["a link element", hostile('<a href="#x"><text>x</text></a>')],
    ["an external <use>", hostile('<use href="https://evil.example/s.svg#x"/>')],
    ["an external xlink:href", hostile('<use xlink:href="//evil.example/s.svg#x"/>')],
    ["a javascript: href", hostile('<use href="javascript:alert(1)"/>')],
    ["an <image>", hostile('<image href="https://evil.example/p.png"/>')],
    [
      "a style sheet with @import",
      hostile("<style>@import url(https://evil.example/x.css);</style>"),
    ],
    [
      "a style sheet fetching a URL",
      hostile("<style>g{background:url(https://evil.example/t)}</style>"),
    ],
    ["an attribute fetching a URL", hostile('<rect fill="url(https://evil.example/t#g)"/>')],
    ["a style attribute with expression()", hostile('<rect style="width:expression(alert(1))"/>')],
    ["a style attribute fetching a URL", hostile('<rect style="fill:url(//evil.example/x)"/>')],
    [
      "a <style> that closes the element",
      hostile("<style>g{}</style><style></style ><script>1</script>"),
    ],
    ["an animation element", hostile('<set attributeName="href" to="javascript:alert(1)"/>')],
    ["broken XML", "<svg><g></svg>"],
    ["a root that is not <svg>", '<div xmlns="http://www.w3.org/1999/xhtml">x</div>'],
  ];
  for (const [name, svg] of CASES) {
    it(`rejects ${name}`, () => {
      expect(checkMermaidSvg(svg).ok).toBe(false);
    });
  }
});

const mermaidRender = vi.fn<(id: string, text: string) => Promise<{ svg: string }>>();
vi.mock("mermaid", () => ({
  default: { initialize: vi.fn(), render: (id: string, text: string) => mermaidRender(id, text) },
}));

describe("MermaidDiagram", () => {
  beforeEach(() => {
    mermaidRender.mockReset();
  });

  it("shows the code first, then the diagram once its SVG passed the gate", async () => {
    mermaidRender.mockResolvedValue({ svg: SAFE });
    const { container } = render(<MermaidDiagram source="graph TD; A-->B" label="Flow" />);
    expect(screen.getByText("graph TD; A-->B")).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector("figure")).toHaveAttribute("data-mermaid", "diagram"),
    );
    expect(container.querySelector("figure svg")).not.toBeNull();
    expect(container.querySelector("figure")).toHaveAttribute("aria-label", "Flow");
    expect(screen.queryByText("graph TD; A-->B")).toBeNull();
  });

  it("keeps the code when the generated SVG fails the gate", async () => {
    mermaidRender.mockResolvedValue({
      svg: hostile("<foreignObject><div>x</div></foreignObject>"),
    });
    const { container } = render(<MermaidDiagram source="graph TD; A-->B" />);
    await waitFor(() => expect(mermaidRender).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 20));
    expect(container.querySelector("figure")).toHaveAttribute("data-mermaid", "code");
    expect(container.querySelector("foreignObject")).toBeNull();
    expect(screen.getByText("graph TD; A-->B")).toBeInTheDocument();
  });

  it("keeps the code when mermaid cannot parse the diagram", async () => {
    mermaidRender.mockRejectedValue(new Error("Parse error"));
    const { container } = render(<MermaidDiagram source="not a diagram" />);
    await waitFor(() => expect(mermaidRender).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 20));
    expect(container.querySelector("figure")).toHaveAttribute("data-mermaid", "code");
    expect(screen.getByText("not a diagram")).toBeInTheDocument();
  });
});
