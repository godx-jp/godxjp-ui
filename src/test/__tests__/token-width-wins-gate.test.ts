import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

/**
 * check:token-width-wins refuses ONE arrangement: a `ui-*` class whose components-layer rule sets
 * an inline-axis size from a token, on an element whose `className` also carries a `w-*` utility.
 * That pairing is gh#366, gh#375 and gh#819 — three shipped bugs, the third of which is what
 * bought this gate.
 *
 * The gate walks `process.cwd()`, so each case is a throwaway mini-repo: two files, one verdict.
 * Running the real script end to end is the point — a gate is only worth what its exit code is.
 */
const SCRIPT = resolve(process.cwd(), "scripts/check-token-width-wins.mjs");

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function repo(css: string, tsx: string): string {
  const root = mkdtempSync(join(tmpdir(), "token-width-wins-"));
  roots.push(root);
  mkdirSync(join(root, "src/styles"), { recursive: true });
  mkdirSync(join(root, "src/components/navigation"), { recursive: true });
  writeFileSync(join(root, "src/styles/fixture.css"), css);
  writeFileSync(join(root, "src/components/navigation/fixture.tsx"), tsx);
  return root;
}

function run(root: string): { code: number; output: string } {
  try {
    const output = execFileSync(process.execPath, [SCRIPT], { cwd: root, encoding: "utf8" });
    return { code: 0, output };
  } catch (error) {
    const e = error as { status: number; stdout: string; stderr: string };
    return { code: e.status, output: `${e.stdout}${e.stderr}` };
  }
}

describe("check:token-width-wins", () => {
  it("refuses the gh#819 arrangement: a token width in @layer components beside a `w-*` utility", () => {
    const { code, output } = run(
      repo(
        `@layer components {
  .ui-thing-trigger[data-kind="locale"] {
    inline-size: var(--thing-locale-width);
  }
}`,
        `export const Thing = () => <button className={cn("w-auto", "ui-thing-trigger")} />;`,
      ),
    );
    expect(code).toBe(1);
    expect(output).toContain("ui-thing-trigger");
    expect(output).toContain("w-auto");
  });

  it("accepts the gh#366 fix: the rule drops the declaration, the utility reads the token", () => {
    const { code } = run(
      repo(
        `@layer components {
  .ui-thing-trigger[data-kind="locale"] {
    --thing-trigger-width: var(--thing-locale-width);
  }
}`,
        `export const Thing = () => (
  <button className={cn("w-[length:var(--thing-trigger-width)]", "ui-thing-trigger")} />
);`,
      ),
    );
    expect(code).toBe(0);
  });

  it("accepts the gh#375 fix: the rule keeps the width, the TSX emits no width utility", () => {
    const { code } = run(
      repo(
        `@layer components {
  .ui-thing-trigger {
    inline-size: var(--thing-bounded-width);
  }
}`,
        `export const Thing = () => <button className={cn("ui-thing-trigger", "justify-center")} />;`,
      ),
    );
    expect(code).toBe(0);
  });

  it("sees through a variant prefix — `sm:w-full` outranks the components layer just the same", () => {
    const { code } = run(
      repo(
        `@layer components {
  .ui-thing-trigger {
    inline-size: var(--thing-width);
  }
}`,
        `export const Thing = () => <button className={cn("ui-thing-trigger", "sm:w-full")} />;`,
      ),
    );
    expect(code).toBe(1);
  });

  it("does not blame a wrapper for a DESCENDANT rule's width (the table-collection false positive)", () => {
    // `.ui-table-collection [data-slot="table-cell"]` styles the CELL. The wrapper's own `w-full`
    // is not in that fight, and reporting it would have made the gate noise on day one.
    const { code } = run(
      repo(
        `@layer components {
  .ui-wrap :is([data-slot="cell"]) {
    inline-size: var(--thing-column-width);
  }
}`,
        `export const Thing = () => <div className={cn("relative w-full", "ui-wrap")} />;`,
      ),
    );
    expect(code).toBe(0);
  });

  it("guards only TOKEN widths — a literal in the components layer is out of scope by design", () => {
    const { code } = run(
      repo(
        `@layer components {
  .ui-thing-inline {
    width: auto;
  }
}`,
        `export const Thing = () => <button className={cn("ui-thing-inline", "w-full")} />;`,
      ),
    );
    expect(code).toBe(0);
  });

  it("matches each property against its OWN utility family, not all of them", () => {
    // A `min-inline-size` token is not endangered by `w-*`; it is endangered by `min-w-*`.
    const css = `@layer components {
  .ui-thing-cell {
    min-inline-size: var(--thing-min-width);
  }
}`;
    expect(
      run(repo(css, `export const T = () => <b className={cn("ui-thing-cell", "w-full")} />;`))
        .code,
    ).toBe(0);
    expect(
      run(repo(css, `export const T = () => <b className={cn("ui-thing-cell", "min-w-0")} />;`))
        .code,
    ).toBe(1);
  });

  it("ignores a rule outside @layer components — a different fight with utilities", () => {
    const { code } = run(
      repo(
        `.ui-thing-trigger {
  inline-size: var(--thing-width);
}`,
        `export const Thing = () => <button className={cn("ui-thing-trigger", "w-full")} />;`,
      ),
    );
    expect(code).toBe(0);
  });

  it("passes on this repository as it stands", () => {
    expect(run(process.cwd()).code).toBe(0);
  });
});
