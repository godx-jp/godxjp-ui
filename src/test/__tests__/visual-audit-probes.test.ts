import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Calibration controls for the responsive probes C01–C12 (ADR "Adopt calibrated probes", process
 * step 1). Every probe gets an isolated BAD page that must fire exactly that rule on that element,
 * a REPAIRED page and a LEGITIMATE-CLEAN page that must not fire. The pages are served over HTTP
 * and audited by the REAL CLI in a child process — the same engine a consumer runs — never by a
 * re-implementation of the predicates.
 *
 * VISUAL_AUDIT_SCRIPT points the controls at another engine build (the ADR requires controls to
 * run with the engine under test; it is also how the pre-probe script is shown to miss them).
 */
const ROOT = path.resolve(__dirname, "../../..");
const FIXTURES = path.join(ROOT, "src/test/__fixtures__/visual-audit");
const SCRIPT = process.env.VISUAL_AUDIT_SCRIPT ?? path.join(ROOT, "scripts/visual-audit.mjs");

type Finding = { url: string; rule: string; element?: string; viewport?: string; message: string };
type Cell = { url: string; viewport: string; rules: Record<string, string>; checklist: unknown[] };
type Result = {
  status: string;
  acceptance?: string;
  findings: Finding[];
  unmapped?: { url: string; rule: string; element: string }[];
  matrix?: Cell[];
  errors: unknown[];
};

let server: Server;
let base = "";

beforeAll(async () => {
  server = createServer(async (req, res) => {
    const rel = path.normalize(new URL(req.url ?? "/", "http://x").pathname).replace(/^\/+/, "");
    try {
      const body = await readFile(path.join(FIXTURES, rel));
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  base = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
});

afterAll(() => {
  server.closeAllConnections?.();
  server.close();
});

/** Run the real CLI (async, so this process keeps serving the fixtures to its Chromium). */
function audit(widths: string, routes: string[]): Promise<{ result: Result | null; out: string }> {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [SCRIPT, "--format", "json", "--widths", widths, base, ...routes],
      { detached: true, stdio: ["ignore", "pipe", "pipe"] },
    );
    let out = "";
    child.stdout.setEncoding("utf8").on("data", (d) => (out += d));
    child.stderr.setEncoding("utf8").on("data", (d) => (out += d));
    const timer = setTimeout(() => {
      try {
        process.kill(-child.pid!, "SIGKILL");
      } catch {
        child.kill("SIGKILL");
      }
    }, 170_000);
    child.on("close", () => {
      clearTimeout(timer);
      try {
        resolve({ result: JSON.parse(out) as Result, out });
      } catch {
        resolve({ result: null, out });
      }
    });
  });
}

const PROBE = /^c\d\d-/;

/** route → [expected rule, element id it must name][] plus the rule's expected cell status. */
type Case = { route: string; fires: [string, string][]; rule: string; status: string };
const C = (route: string, rule: string, status: string, fires: [string, string][] = []): Case => ({
  route,
  rule,
  status,
  fires,
});

const COMPACT: Case[] = [
  C("c01/bad-document-overflow.html", "c01-content-reachable", "fail", [
    ["c01-content-reachable", "document"],
  ]),
  C("c01/bad-text-clip.html", "c01-content-reachable", "fail", [
    ["c01-content-reachable", "#c01-clip-x"],
  ]),
  C("c01/bad-icon-top.html", "c01-content-reachable", "fail", [
    ["c01-content-reachable", "#c01-icon"],
  ]),
  C("c01/bad-nested-clip.html", "c01-content-reachable", "fail", [
    ["c01-content-reachable", "#c01-nested-icon"],
  ]),
  C("c01/repaired.html", "c01-content-reachable", "pass"),
  C("c01/clean.html", "c01-content-reachable", "pass"),

  C("c02/bad-narrow.html", "c02-search-usable", "fail", [["c02-search-usable", "#c02-narrow"]]),
  C("c02/bad-hint.html", "c02-search-usable", "fail", [["c02-search-usable", "#c02-hint"]]),
  C("c02/repaired.html", "c02-search-usable", "pass"),
  C("c02/clean-hint-elsewhere.html", "c02-search-usable", "pass"),
  C("c02/clean-trigger.html", "c02-search-usable", "pass"),
  C("c02/unmapped.html", "c02-search-usable", "unmapped"),

  C("c04/bad.html", "c04-compact-account-name", "fail", [
    ["c04-compact-account-name", "#c04-item"],
  ]),
  C("c04/bad-inert.html", "c04-compact-account-name", "fail", [
    ["c04-compact-account-name", "#c04-inert"],
  ]),
  C("c04/bad-plain-child.html", "c04-compact-account-name", "fail", [
    ["c04-compact-account-name", "#c04-plain"],
  ]),
  C("c04/repaired.html", "c04-compact-account-name", "pass"),
  C("c04/clean.html", "c04-compact-account-name", "pass"),

  C("c05/bad.html", "c05-compact-editor-inset", "fail", [
    ["c05-compact-editor-inset", "#c05-editor"],
  ]),
  C("c05/repaired.html", "c05-compact-editor-inset", "pass"),
  C("c05/clean.html", "c05-compact-editor-inset", "pass"),

  C("c06/bad.html", "c06-compact-actions", "fail", [["c06-compact-actions", "#c06-group"]]),
  C("c06/bad-target.html", "c06-compact-actions", "fail", [["c06-compact-actions", "#c06-tiny"]]),
  C("c06/bad-lost.html", "c06-compact-actions", "fail", [["c06-compact-actions", "#c06-empty"]]),
  C("c06/repaired.html", "c06-compact-actions", "pass"),
  C("c06/clean-wrap.html", "c06-compact-actions", "pass"),

  C("c12/bad.html", "c12-tracked-uppercase-label", "fail", [
    ["c12-tracked-uppercase-label", "#c12-label"],
  ]),
  C("c12/repaired.html", "c12-tracked-uppercase-label", "pass"),
  C("c12/clean.html", "c12-tracked-uppercase-label", "pass"),
  C("c12/unmapped.html", "c12-tracked-uppercase-label", "unmapped"),
];

const DESKTOP: Case[] = [
  C("c10/bad.html", "c10-rail-toggle-attached", "fail", [
    ["c10-rail-toggle-attached", "#c10-detached"],
  ]),
  C("c10/bad-anchor.html", "c10-rail-toggle-attached", "fail", [
    ["c10-rail-toggle-attached", "#c10-wrong"],
  ]),
  C("c10/repaired.html", "c10-rail-toggle-attached", "pass"),
  C("c10/clean-collapsed.html", "c10-rail-toggle-attached", "pass"),
  C("c10/unmapped.html", "c10-rail-toggle-attached", "unmapped"),
  // gh#1307 — DESIGN's own placement (inside `Sidebar action`) is not the edge-mounted pattern.
  C("c10/clean-sidebar-action.html", "c10-rail-toggle-attached", "not-applicable-sidebar-action"),

  C("c11/bad.html", "c11-search-keyline", "fail", [["c11-search-keyline", "#c11-search"]]),
  C("c11/repaired.html", "c11-search-keyline", "pass"),
  C("c11/clean-end.html", "c11-search-keyline", "not-applicable-end-aligned"),

  // A compact-only probe is never evaluated at a desktop width — recorded, not silently dropped.
  C("c04/bad.html", "c04-compact-account-name", "not-applicable-at-width"),
];

function expectCases(result: Result | null, out: string, cases: Case[]) {
  expect(result, out).not.toBeNull();
  expect(result!.status, JSON.stringify(result!.errors)).toBe("ok");
  for (const c of cases) {
    const url = `${base}/${c.route}`;
    const fired = result!.findings
      .filter((f) => f.url === url && PROBE.test(f.rule))
      .map((f) => [f.rule, f.element ?? ""] as [string, string]);
    // Exactly the expected rule on exactly the expected element — nothing else from any probe.
    expect(fired.length, `${c.route}: ${JSON.stringify(fired)}`).toBe(c.fires.length);
    c.fires.forEach(([rule, el], i) => {
      expect(fired[i]![0], c.route).toBe(rule);
      if (el === "document") expect(fired[i]![1], c.route).toBe("document");
      else expect(fired[i]![1], c.route).toContain(el);
    });
    const cell = result!.matrix?.find((m) => m.url === url);
    expect(cell?.rules[c.rule], `${c.route} status`).toBe(c.status);
  }
}

describe("visual-audit probes — calibration controls (bad red · repaired green · clean green)", () => {
  it("compact controls (390×844): C01 C02 C04 C05 C06 C12", async () => {
    const { result, out } = await audit(
      "390x844",
      COMPACT.map((c) => c.route),
    );
    if (/needs the optional peer `playwright`/.test(out) && !process.env.CI) return;
    expectCases(result, out, COMPACT);
  }, 180_000);

  it("desktop controls (1280×900): C10 C11, and compact-only probes recorded as not applicable", async () => {
    const { result, out } = await audit(
      "1280x900",
      DESKTOP.map((c) => c.route),
    );
    if (/needs the optional peer `playwright`/.test(out) && !process.env.CI) return;
    expectCases(result, out, DESKTOP);
  }, 180_000);

  it("the incident fixture: mapped defects fire, unmapped ones are reported for a reviewer, never passed", async () => {
    const { result, out } = await audit("390x844,1280x900", ["known-bad.html"]);
    if (/needs the optional peer `playwright`/.test(out) && !process.env.CI) return;
    expect(result, out).not.toBeNull();
    const phone = result!.matrix!.find((m) => m.viewport === "390x844")!;
    expect(phone.rules["c05-compact-editor-inset"]).toBe("fail");
    for (const rule of ["c02-search-usable", "c06-compact-actions", "c12-tracked-uppercase-label"])
      expect(phone.rules[rule], rule).toBe("unmapped");
    // Every width carries the reviewer checklist, C03 included.
    for (const cell of result!.matrix!)
      expect(cell.checklist.map((c) => (c as { rule: string }).rule)).toContain("c03-single-brand");
    expect(result!.acceptance).not.toMatch(/pending/);
  }, 180_000);
});
