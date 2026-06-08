import { describe, it, expect } from "vitest";

import { dispatchTool } from "./tools/registry.js";

const lint = (jsx: string) => dispatchTool("lint_jsx", { jsx });

/**
 * Every heuristic in lintJsx must (a) fire on a violating snippet and
 * (b) stay silent on clean, idiomatic JSX. Each case targets one rule.
 */

describe("lint_jsx — each heuristic fires", () => {
  const CASES: Array<[string, string, RegExp]> = [
    ["raw button", "<button>Go</button>", /<Button>/],
    ["raw input", "<input value={x} />", /<Input>/],
    ["raw select", "<select><option/></select>", /<Select>/],
    ["raw textarea", "<textarea />", /<Textarea>/],
    ["raw table", "<table><tbody /></table>", /<DataTable>/],
    ["physical direction class", '<div className="ml-4 text-right" />', /logical CSS/i],
    ["generic size=default", '<Avatar size="default" />', /xs\|sm\|md\|lg/],
    ["arbitrary text px", '<span className="text-[13px]" />', /type scale/i],
    ["raw color scale bg", '<div className="bg-red-500" />', /semantic token/i],
    ["Tag color=error", '<Tag color="error">x</Tag>', /destructive/],
    ["Badge variant=error", '<Badge variant="error">x</Badge>', /destructive/],
    ["Flex gap=middle", '<Flex gap="middle" />', /"default"/],
    ["IconButton size=default", '<IconButton size="default" aria-label="x" />', /"md"/],
    ["SegmentedControl size=sm", '<SegmentedControl size="sm" />', /"small"/],
    ["PageContent padding=compact", '<PageContent padding="compact" />', /tight/],
    ["Pagination justify=between", '<Pagination justify="between" />', /space-between/],
    ["IconButton without aria-label", "<IconButton onClick={f} />", /aria-label/],
    ["text color scale", '<span className="text-red-500" />', /color scales/i],
    ["100vh", '<div className="h-[100vh]" />', /100dvh/],
    ["heavy shadow", '<div className="shadow-lg" />', /shadow/i],
    ["banned font", '<div style={{ fontFamily: "Inter" }} />', /Inter/],
    ["generic placeholder", "<div>Acme Corp, John Doe</div>", /placeholder/i],
  ];

  it.each(CASES)("%s", async (_label, jsx, expected) => {
    const out = await lint(jsx);
    expect(out).toMatch(expected);
  });

  it("story with a cell renderer and no source.code override flags rule 34", async () => {
    const jsx = [
      "export const Demo: Story = {",
      "  args: { columns: [{ cell: ({ row }) => <span>{row.name}</span> }] },",
      "};",
    ].join("\n");
    const out = await lint(jsx);
    expect(out).toMatch(/rule 34/);
  });
});

describe("lint_jsx — no false positives", () => {
  it("clean idiomatic JSX passes", async () => {
    const out = await lint("<Button onClick={save}>保存</Button>");
    expect(out).toMatch(/No issues/i);
  });

  it("PascalCase <Button> is NOT mistaken for a raw <button>", async () => {
    const out = await lint("<Button>x</Button>");
    expect(out).not.toMatch(/raw `<button>`/);
  });

  it("a story with a cell renderer AND a source.code override is clean", async () => {
    const jsx = [
      "export const Demo: Story = {",
      "  args: { columns: [{ cell: ({ row }) => <span>{row.name}</span> }] },",
      "  parameters: { docs: { source: { code: '<DataTable columns={cols} />' } } },",
      "};",
    ].join("\n");
    const out = await lint(jsx);
    expect(out).not.toMatch(/rule 34/);
  });

  it("empty input is clean", async () => {
    expect(await lint("")).toMatch(/No issues/i);
  });
});
