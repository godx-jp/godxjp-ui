import { spawn } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { textOverrideVerdict } from "../../../scripts/visual-audit.mjs";

/**
 * gh#1316 — `--text-spacing` (WCAG 2.2 SC 1.4.12) and `--text-zoom 200` (SC 1.4.4). A consumer
 * reported "W12 0/0/0" from captures byte-identical to the base render: the override never
 * applied and nothing said so. Calibrated with the REAL CLI in a child process against three
 * pages: one that reflows (applied, C01 pass), one that is cut once the text grows (applied, C01
 * fail), and one whose CSP refuses the injected sheet (not applied → infrastructure error, never a
 * pass). VISUAL_AUDIT_SCRIPT points the run at another engine build — the red-on-old proof.
 */
const ROOT = path.resolve(__dirname, "../../..");
const FIXTURES = path.join(ROOT, "src/test/__fixtures__/visual-audit/evidence");
const SCRIPT = process.env.VISUAL_AUDIT_SCRIPT ?? path.join(ROOT, "scripts/visual-audit.mjs");

type Evidence = {
  url: string;
  viewport: string;
  mode: string;
  applied: boolean;
  delta: { movedTextElements: number; maxShiftPx: number; documentHeightPx: number };
  c01: string;
  screenshots: { base: string; override: string } | null;
};
type Result = {
  status: string;
  findings: { url: string; rule: string; condition?: string }[];
  matrix?: { url: string; rules: Record<string, string> }[];
  evidence?: Evidence[];
  errors: { url?: string; stage: string; message: string }[];
};

let server: Server;
let base = "";
const shots = mkdtempSync(path.join(tmpdir(), "va-evidence-"));

beforeAll(async () => {
  server = createServer(async (req, res) => {
    const rel = path.normalize(new URL(req.url ?? "/", "http://x").pathname).replace(/^\/+/, "");
    try {
      const body = await readFile(path.join(FIXTURES, rel));
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        ...(rel.startsWith("csp-") ? { "content-security-policy": "style-src 'self'" } : null),
      });
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

function audit(args: string[]): Promise<{ result: Result | null; out: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SCRIPT, "--format", "json", ...args], {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
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

const MODES = ["--text-spacing", "--text-zoom", "200", "--screenshots", shots];
const at = (r: Result, route: string, mode: string, vp: string) =>
  r.evidence?.find((e) => e.url.endsWith(route) && e.mode === mode && e.viewport === vp);

describe("visual-audit evidence modes (gh#1316)", { timeout: 180_000 }, () => {
  let result: Result | null = null;
  let out = "";

  beforeAll(async () => {
    ({ result, out } = await audit([
      "--widths",
      "390x844,1280x900",
      ...MODES,
      base,
      "reflows.html",
      "clips.html",
      "csp-blocked.html",
    ]));
  }, 180_000);

  it("reports one evidence entry per route × width × mode", () => {
    expect(result, out).not.toBeNull();
    expect(result!.evidence, out).toHaveLength(3 * 2 * 2);
  });

  it("a page that reflows: applied with a geometry delta, C01 passes, screenshots saved", () => {
    for (const vp of ["390x844", "1280x900"])
      for (const mode of ["text-spacing", "text-zoom"]) {
        const e = at(result!, "reflows.html", mode, vp)!;
        expect(e, `${mode} @${vp}`).toBeDefined();
        expect(e.applied, JSON.stringify(e)).toBe(true);
        expect(e.delta.movedTextElements, JSON.stringify(e)).toBeGreaterThan(0);
        expect(e.delta.maxShiftPx, JSON.stringify(e)).toBeGreaterThan(0);
        expect(e.c01, JSON.stringify(e)).toBe("pass");
        expect(existsSync(e.screenshots!.base)).toBe(true);
        expect(existsSync(e.screenshots!.override)).toBe(true);
      }
  });

  it("a page cut once the text grows: base C01 passes, both overrides fail C01", () => {
    const baseCells = result!.matrix!.filter((c) => c.url.endsWith("clips.html"));
    expect(baseCells.map((c) => c.rules["c01-content-reachable"])).toEqual(["pass", "pass"]);
    for (const mode of ["text-spacing", "text-zoom"]) {
      const e = at(result!, "clips.html", mode, "390x844")!;
      expect(e.applied, JSON.stringify(e)).toBe(true);
      expect(e.c01, JSON.stringify(e)).toBe("fail");
      expect(
        result!.findings.some(
          (f) =>
            f.url.endsWith("clips.html") &&
            f.rule === "c01-content-reachable" &&
            f.condition === mode,
        ),
      ).toBe(true);
    }
  });

  it("an injection the page refuses (CSP): 'override not applied' as an error, never a pass", () => {
    for (const mode of ["text-spacing", "text-zoom"]) {
      const e = at(result!, "csp-blocked.html", mode, "390x844")!;
      expect(e.applied, JSON.stringify(e)).toBe(false);
      expect(e.c01).toBe("not-run");
      expect(
        result!.errors.some(
          (x) =>
            x.url?.endsWith("csp-blocked.html") &&
            x.stage === mode &&
            /override not applied/.test(x.message),
        ),
        JSON.stringify(result!.errors),
      ).toBe(true);
    }
    expect(result!.status).toBe("partial");
  });
});

describe("textOverrideVerdict (pure)", () => {
  const snap = (fontPx: number, ls: number, ws: number, h: number) => ({
    texts: [{ x: 0, y: 0, w: 100, h, fontPx, letterSpacingPx: ls, wordSpacingPx: ws }],
    docHeight: h,
    docWidth: 100,
  });

  it("zero geometry delta is not applied, even when the computed values took", () => {
    const v = textOverrideVerdict("text-spacing", snap(10, 0, 0, 20), snap(10, 1.2, 1.6, 20));
    expect(v.applied).toBe(false);
    expect(v.reason).toMatch(/zero geometry delta/);
  });

  it("geometry that moved without the override's values is not applied", () => {
    const v = textOverrideVerdict("text-zoom", snap(10, 0, 0, 20), snap(11, 0, 0, 40), {
      zoom: 200,
    });
    expect(v.applied).toBe(false);
  });

  it("values taken and geometry moved: applied, with the delta reported", () => {
    const v = textOverrideVerdict("text-zoom", snap(10, 0, 0, 20), snap(20, 0, 0, 40), {
      zoom: 200,
    });
    expect(v).toMatchObject({ applied: true, appliedRatio: 1 });
    expect(v.delta.documentHeightPx).toBe(20);
  });
});
