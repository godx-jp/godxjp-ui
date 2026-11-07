import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** gh#1538 rules: link-ink-stripped · button-mutation-needs-loading. */
const script = join(process.cwd(), "scripts/ui-audit.mjs");
const IDS = ["link-ink-stripped", "button-mutation-needs-loading"];

function rules(source: string): string[] {
  const cwd = mkdtempSync(join(tmpdir(), "godx-ui-audit-1538-"));
  try {
    writeFileSync(join(cwd, "package.json"), JSON.stringify({ name: "consumer" }));
    mkdirSync(join(cwd, "resources/js/pages"), { recursive: true });
    writeFileSync(join(cwd, "resources/js/pages/sample.tsx"), source);
    const out = spawnSync(process.execPath, [script, "--format", "json"], {
      cwd,
      encoding: "utf8",
    }).stdout;
    const parsed = JSON.parse(out) as
      { findings?: { rule: string; severity: string }[] } | { rule: string; severity: string }[];
    return (Array.isArray(parsed) ? parsed : (parsed.findings ?? []))
      .filter((f) => IDS.includes(f.rule))
      .map((f) => `${f.rule}:${f.severity}`);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

describe("link-ink-stripped", () => {
  it("warns on a router Link or <a> given body ink", () => {
    expect(
      rules(`export const A = () => (<>
  <Link to={\`/users/\${u.id}\`} className="text-foreground">{u.name}</Link>
  <a href="/x" className='text-inherit'>x</a>
</>);`),
    ).toEqual(["link-ink-stripped:warn", "link-ink-stripped:warn"]);
  });

  it("leaves a plain link, a control link and an unrelated element alone", () => {
    expect(
      rules(`export const A = () => (<>
  <Link to="/users">Users</Link>
  <Link to="/u" data-ui-link-style="control" className="text-foreground">Row</Link>
  <abbr className="text-foreground">ID</abbr>
  <Link to="/u" className="text-foreground-strong">x</Link>
</>);`),
    ).toEqual([]);
  });
});

describe("button-mutation-needs-loading", () => {
  it("warns on a Button firing a mutation with no loading", () => {
    expect(
      rules(`export const A = () => (
  <Button
    variant="outline"
    onClick={() => resend.mutate({ id })}
  >
    Resend
  </Button>
);
export const B = () => <Button onClick={async () => { await del.mutateAsync(id); }}>Delete</Button>;`),
    ).toEqual(["button-mutation-needs-loading:warn", "button-mutation-needs-loading:warn"]);
  });

  it("accepts a Button with loading, a non-mutation click and a spread", () => {
    expect(
      rules(`export const A = () => (<>
  <Button loading={resend.isPending} onClick={() => resend.mutate()}>Resend</Button>
  <Button onClick={() => setOpen(true)}>Open</Button>
  <Button {...props} onClick={() => save.mutate()}>Save</Button>
</>);`),
    ).toEqual([]);
  });
});
