import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * `mixed-button-size`: one action row, one Button size. A consumer shipped 「AIスコアを編集」 at
 * `size="sm"` beside 裁定する at the default size; nothing flagged it. Each case is one consumer
 * file, audited in consumer mode, and asserts whether the rule fires on it.
 */

const SCRIPT = resolve("scripts/ui-audit.mjs");
let root: string | null = null;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = null;
});

function findings(body: string): { line: number; snippet: string }[] {
  root = mkdtempSync(join(tmpdir(), "ui-audit-mixed-button-size-"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "some-consumer-app" }));
  writeFileSync(join(root, "row.tsx"), body);
  const r = spawnSync(process.execPath, [SCRIPT, "row.tsx", "--format", "json"], {
    cwd: root,
    encoding: "utf8",
  });
  const out = JSON.parse(r.stdout) as {
    findings: { rule: string; line: number; snippet: string }[];
  };
  return out.findings.filter((f) => f.rule === "mixed-button-size");
}

const file = (jsx: string) => `export const Row = () => (\n${jsx}\n);\n`;

describe("ui-audit mixed-button-size", () => {
  it("flags sm beside a Button with no size (the default) — the reported row", () => {
    const hits = findings(
      file(`<Flex>
  <Button variant="outline" size="sm">AIスコアを編集</Button>
  <Button>裁定する</Button>
</Flex>`),
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].line).toBe(3);
    expect(hits[0].snippet).toContain("sm + default");
  });

  it("passes a row where every Button shares one size", () => {
    expect(
      findings(
        file(`<Flex>\n  <Button size="sm">A</Button>\n  <Button size="sm">B</Button>\n</Flex>`),
      ),
    ).toHaveLength(0);
  });

  it("treats icon-* as its text size's family, and still fails across families", () => {
    expect(
      findings(
        file(`<Flex><Button size="xs">A</Button><Button size="icon-xs" aria-label="x" /></Flex>`),
      ),
    ).toHaveLength(0);
    expect(
      findings(file(`<Flex><Button size="icon" aria-label="x" /><Button>A</Button></Flex>`)),
    ).toHaveLength(0);
    expect(
      findings(
        file(`<Flex><Button size="xs">A</Button><Button size="icon-sm" aria-label="x" /></Flex>`),
      ),
    ).toHaveLength(1);
  });

  it("sees siblings through fragments, {cond && …}, ternaries and Tooltip wrappers", () => {
    const hits = findings(
      file(`<CardFooter>
  <>
    {canEdit && <Button size="sm">Edit</Button>}
  </>
  {busy ? <Spinner /> : (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button onClick={() => go(a > b)}>Save</Button>
      </TooltipTrigger>
      <TooltipContent>t</TooltipContent>
    </Tooltip>
  )}
</CardFooter>`),
    );
    expect(hits).toHaveLength(1);
  });

  it("checks buttons inside an attribute (PageHeader actions) as their own row", () => {
    expect(
      findings(
        file(`<PageHeader title="t" actions={<><Button size="sm">A</Button><Button>B</Button></>}>
  <Button size="lg">body</Button>
</PageHeader>`),
      ),
    ).toHaveLength(1);
    expect(
      findings(
        file(`<PageHeader title="t" actions={<Button size="sm">A</Button>}>
  <Button>body</Button>
</PageHeader>`),
      ),
    ).toHaveLength(0);
  });

  it("does not read a nested element's size, a different parent, or a dynamic size", () => {
    expect(
      findings(file(`<Flex><Button icon={<Icon size="sm" />}>A</Button><Button>B</Button></Flex>`)),
    ).toHaveLength(0);
    expect(
      findings(
        file(`<Flex>\n  <Flex><Button size="sm">A</Button></Flex>\n  <Button>B</Button>\n</Flex>`),
      ),
    ).toHaveLength(0);
    expect(
      findings(
        file(`<Flex><Button size={dense ? "sm" : "default"}>A</Button><Button>B</Button></Flex>`),
      ),
    ).toHaveLength(0);
  });

  it("does not mistake a TS generic for markup", () => {
    const hits = findings(`import { useState } from "react";
export function Row() {
  const [v] = useState<string>("");
  return (
    <Flex>
      <Button size="sm">{v}</Button>
      <Button size="sm">B</Button>
    </Flex>
  );
}
`);
    expect(hits).toHaveLength(0);
  });
});
