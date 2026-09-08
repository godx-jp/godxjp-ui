import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const script = join(process.cwd(), "scripts/ui-audit.mjs");

function audit(source: string, framework = false, path?: string) {
  const cwd = mkdtempSync(join(tmpdir(), "godx-ui-audit-"));
  try {
    writeFileSync(
      join(cwd, "package.json"),
      JSON.stringify({ name: framework ? "@godxjp/ui" : "consumer" }),
    );
    const directory = path ?? (framework ? "src" : "resources/js/pages");
    mkdirSync(join(cwd, directory), { recursive: true });
    writeFileSync(join(cwd, directory, "sample.tsx"), source);
    const result = spawnSync(process.execPath, [script, "--format", "json"], {
      cwd,
      encoding: "utf8",
    });
    return { status: result.status, output: result.stdout };
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

describe("consumer audit CLI regressions", () => {
  it("scans framework defaults and still detects a violation", () => {
    const result = audit('<input type="text" />', true);
    expect(result.status).toBe(1);
    expect(result.output).toContain('"no-raw-input"');
    expect(result.output).toContain("src/sample.tsx");
  });

  it("allows primitive native controls without exempting consumer screens or docs", () => {
    expect(audit('<input type="text" />', true, "src/components/data-entry").status).toBe(0);
    expect(audit('<input type="text" />', true, "docs/data-entry").output).toContain(
      '"no-raw-input"',
    );
    expect(audit('<input type="text" />', false, "resources/js/pages").output).toContain(
      '"no-raw-input"',
    );
  });

  it("allows hidden form encoding but rejects visible and unknown input types", () => {
    expect(audit('<input\n name="id"\n type="hidden" value="7" />').status).toBe(0);
    expect(audit("<input type='hidden' name='id' />").status).toBe(0);
    for (const source of [
      '<input type="text" />',
      "<input\n type={kind}\n />",
      "<input />",
      "<input hidden />",
    ]) {
      expect(audit(source).output, source).toContain('"no-raw-input"');
    }
  });

  it("does not mistake Markdown interpolation for JSX currency", () => {
    expect(audit("const quote = lines.map((line) => `> ${line}`);").status).toBe(0);
    expect(audit("<Button onClick={() => router.post(`/view/${id}`)}>Save</Button>").status).toBe(
      0,
    );
    for (const source of [
      "<Text>${amount}</Text>",
      '<Text\n tone="muted">\n¥{amount}</Text>',
      "<Text>{amount}円</Text>",
      "<Text>Total: ${amount}</Text>",
      "<>${amount}</>",
      '<Text title="a > b">${amount}</Text>',
      "<Button onClick={() => save()}>${amount}</Button>",
    ]) {
      expect(audit(source).output, source).toContain('"hardcoded-currency"');
    }
  });
});
