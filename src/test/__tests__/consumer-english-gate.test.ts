import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

/**
 * check:consumer-english counts non-English PROSE lines in `agent/**` and `docs/CONSUMER-RULES.md`
 * and refuses growth. Demo data (quoted UI strings, code) is not prose and must not be counted.
 */
const SCRIPT = resolve(process.cwd(), "scripts/check-consumer-english.mjs");

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function repo(files: Record<string, string>, baseline?: Record<string, number>): string {
  const root = mkdtempSync(join(tmpdir(), "consumer-english-"));
  roots.push(root);
  const all = { ...files };
  if (baseline) all["scripts/consumer-english.baseline.json"] = JSON.stringify(baseline);
  for (const [path, text] of Object.entries(all)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

function run(root: string, args: string[] = []): { code: number; output: string } {
  try {
    const output = execFileSync(process.execPath, [SCRIPT, ...args], {
      cwd: root,
      encoding: "utf8",
    });
    return { code: 0, output };
  } catch (error) {
    const e = error as { status: number; stdout: string; stderr: string };
    return { code: e.status, output: `${e.stdout}${e.stderr}` };
  }
}

const VIETNAMESE = "Chữ phụ trong khối sự kiện nằm trên nền đã tô theo màu của bên tiêu thụ.";
const JAPANESE = "このコンポーネントは、ユーザーが入力した値を検証して表示します。";

describe("check:consumer-english", () => {
  it("passes English prose", () => {
    expect(run(repo({ "agent/START-HERE.md": "Use the Flex component for rows.\n" })).code).toBe(0);
  });

  it("is RED on a new Vietnamese prose line in agent/", () => {
    const { code, output } = run(repo({ "agent/START-HERE.md": `${VIETNAMESE}\n` }, {}));
    expect(code).toBe(1);
    expect(output).toContain("agent/START-HERE.md");
    expect(output).toContain("grew");
  });

  it("is RED on a new Japanese prose line in docs/CONSUMER-RULES.md", () => {
    const { code, output } = run(
      repo({ "docs/CONSUMER-RULES.md": `${JAPANESE}\n`, "agent/a.md": "ok\n" }, {}),
    );
    expect(code).toBe(1);
    expect(output).toContain("docs/CONSUMER-RULES.md");
  });

  it("does not count code blocks, inline code, or quoted demo strings", () => {
    const text = [
      'Empty state copy is a quoted example: "まだ注文がありません。商品を追加しましょう。" and `<Badge>公開中のステータス</Badge>`.',
      "```tsx",
      JAPANESE,
      "```",
      "Corner brackets work too: 「カレンダーを開くためのボタンです」.",
    ].join("\n");
    expect(run(repo({ "agent/a.md": text }, {})).code).toBe(0);
  });

  it("reads JSON prose but skips code and data keys", () => {
    const rules = JSON.stringify([{ body: "fine", code: JAPANESE, value: VIETNAMESE }]);
    expect(run(repo({ "agent/rules.json": rules }, {})).code).toBe(0);
    const bad = JSON.stringify([{ body: VIETNAMESE }]);
    expect(run(repo({ "agent/rules.json": bad }, {})).code).toBe(1);
  });

  it("allows the recorded baseline but not one line more", () => {
    const files = { "agent/a.md": `${VIETNAMESE}\n` };
    expect(run(repo(files, { "agent/a.md": 1 })).code).toBe(0);
    const two = { "agent/a.md": `${VIETNAMESE}\n${JAPANESE}\n` };
    expect(run(repo(two, { "agent/a.md": 1 })).code).toBe(1);
  });

  it("fails when a win is not locked in, so the baseline cannot drift loose", () => {
    const { code, output } = run(repo({ "agent/a.md": "English only.\n" }, { "agent/a.md": 3 }));
    expect(code).toBe(1);
    expect(output).toContain("--update-baseline");
  });

  it("FAILS CLOSED when there is nothing to scan", () => {
    const { code, output } = run(repo({ "README.md": "x\n" }));
    expect(code).toBe(1);
    expect(output).toContain("scanned 0 files");
  });
});
