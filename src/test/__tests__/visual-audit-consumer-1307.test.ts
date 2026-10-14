import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";

/**
 * gh#1307 — four false readings a consumer (godx-content) hit with visual-audit 32.9.0, each the
 * probe misreading something the LIBRARY itself renders, plus the signed-in session it had to patch
 * a copy of the script to pass. Real components, real stylesheet, real CLI in a child process.
 *
 * VISUAL_AUDIT_SCRIPT points every case at another engine build — the red-on-old proof.
 */
const ROOT = path.resolve(__dirname, "../../..");
const SCRIPT = process.env.VISUAL_AUDIT_SCRIPT ?? path.join(ROOT, "scripts/visual-audit.mjs");

/** The consumer's shell: TopbarSearch as the only search, the collapse toggle in `Sidebar action`,
 *  and the BlockEditor's own visually-hidden status region. */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { AppShell } from "./src/components/layout/app-shell";
import { Topbar } from "./src/components/layout/topbar";
import { TopbarSearch } from "./src/components/layout/topbar-search";
import { Sidebar } from "./src/components/layout/sidebar";
import { PageContainer } from "./src/components/layout/page-container";
import { Button } from "./src/components/general/button";
import { Text } from "./src/components/general/typography";
import { PanelLeft } from "lucide-react";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <AppShell
      sidebar={
        <Sidebar
          action={
            <Button variant="ghost" size="sm" aria-label="Collapse pages" aria-expanded="true" aria-controls="rail-tree">
              <PanelLeft aria-hidden="true" />
            </Button>
          }
        >
          <div id="rail-tree"><Text>Pages</Text></div>
        </Sidebar>
      }
      topbar={<Topbar start={<TopbarSearch ariaLabel="Search pages" placeholder="Search pages" />} />}
    >
      <PageContainer title="Release notes">
        <Text>Body</Text>
        <span className="sr-only" role="status">Saved</span>
      </PageContainer>
    </AppShell>
  </AppProvider>,
);
`;

let server: Server;
let base = "";
let fullCss = "";
let stateFile = "";

beforeAll(async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  let js: string;
  try {
    const { build } = await import("esbuild");
    const out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: ROOT,
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  fullCss = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  const shell = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${fullCss}</style></head><body><div id="root"></div><script>${js}</script></body></html>`;
  // A signed-in route: without the session it shows an emoji (a finding), with it a plain page.
  const gated = `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body><main id="m"></main><script>
    document.getElementById("m").textContent = localStorage.getItem("session") ? "Dashboard" : "🔒 Sign in";
  </script></body></html>`;
  server = createServer((req, res) => {
    const route = new URL(req.url ?? "/", "http://x").pathname;
    const body = route === "/" ? shell : route === "/gated" ? gated : null;
    if (body === null) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(body);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  base = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
  stateFile = path.join(mkdtempSync(path.join(tmpdir(), "va-1307-")), "state.json");
  writeFileSync(
    stateFile,
    JSON.stringify({
      cookies: [],
      origins: [{ origin: base, localStorage: [{ name: "session", value: "signed-in" }] }],
    }),
  );
}, 120_000);

afterAll(() => {
  server?.closeAllConnections?.();
  server?.close();
});

type Result = {
  status: string;
  findings: { rule: string; viewport?: string; message: string }[];
  matrix: { url: string; viewport: string; rules: Record<string, string> }[];
  unmapped?: { rule: string; element: string }[];
  errors: unknown[];
};

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
    }, 110_000);
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

describe("visual-audit reads the library's own components correctly (gh#1307)", () => {
  it("styles/core passes the layer probe, no sr-only status is a banner, TopbarSearch is found at 320/390, the Sidebar-action toggle is not-applicable", async () => {
    const { result, out } = await audit(["--widths", "320x900,390x844,1280x900", base]);
    expect(result, out).not.toBeNull();
    expect(result!.status, JSON.stringify(result!.errors)).toBe("ok");
    const rules = (vp: string) => result!.matrix.find((m) => m.viewport === vp)!.rules;
    const layers = result!.findings.filter((f) => f.rule === "css-layers-missing");
    expect.soft(layers.map((f) => f.message)).toEqual([]);
    const banners = result!.findings.filter((f) => f.rule === "alert-controls-misplaced");
    expect.soft(banners.map((f) => f.message)).toEqual([]);
    expect.soft(rules("320x900")["c02-search-usable"]).toBe("pass");
    expect.soft(rules("390x844")["c02-search-usable"]).toBe("pass");
    expect
      .soft(rules("1280x900")["c10-rail-toggle-attached"])
      .toBe("not-applicable-sidebar-action");
    expect
      .soft((result!.unmapped ?? []).filter((u) => u.rule === "c10-rail-toggle-attached"))
      .toEqual([]);
  }, 120_000);

  it("--storage-state audits the signed-in page; without it the gate shows", async () => {
    const signedIn = await audit([
      "--widths",
      "390x844",
      "--storage-state",
      stateFile,
      base,
      "/gated",
    ]);
    expect(signedIn.result, signedIn.out).not.toBeNull();
    expect(signedIn.result!.status, JSON.stringify(signedIn.result!.errors)).toBe("ok");
    expect(signedIn.result!.matrix.map((m) => m.url)).toEqual([`${base}/gated`]);
    expect(signedIn.result!.findings.filter((f) => f.rule === "emoji-rendered")).toEqual([]);
    // Control: the same route without the session is the sign-in page.
    const anonymous = await audit(["--widths", "390x844", base, "/gated"]);
    expect(anonymous.result!.findings.map((f) => f.rule)).toContain("emoji-rendered");
  }, 120_000);

  it("--storage-state with a missing file is an infrastructure error, not a clean run", async () => {
    const { result, out } = await audit(["--storage-state", "/nonexistent/state.json", base]);
    expect(result, out).not.toBeNull();
    expect(result!.status).toBe("error");
  }, 60_000);
});

describe("in-page collector (gh#1307)", () => {
  const collector = async () =>
    (await import(pathToFileURL(SCRIPT).href)).collectInPage as () => unknown;

  it("the control-layer probe passes with styles/core and fails when control.css is left out", async () => {
    const collectInPage = await collector();
    const without = await compileRealCss(`<div class="ui-button"></div>`, {
      omit: ["control.css"],
    });
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      const control = async (css: string) => {
        await page.setContent(
          `<!doctype html><html><head><style>${css}</style></head><body></body></html>`,
        );
        const m = (await page.evaluate(collectInPage)) as {
          layers: { layer: string; ok: boolean }[];
        };
        return m.layers.find((l) => l.layer === "control")!.ok;
      };
      expect(await control(fullCss)).toBe(true);
      expect(await control(without)).toBe(false);
    } finally {
      await browser.close();
    }
  }, 60_000);

  it("a visible Alert with stacked controls is still measured; a visually-hidden status is not", async () => {
    const collectInPage = await collector();
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(`<!doctype html><html><head><style>
        .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0 }
      </style></head><body>
        <span class="sr-only" role="status">Saved</span>
        <div class="sr-only"><div role="status">Saved inside a clipped wrapper</div></div>
        <div role="alert" id="real" style="display:flex;flex-direction:column;width:320px">Failed <button>Retry</button></div>
      </body></html>`);
      const m = (await page.evaluate(collectInPage)) as { alerts: { direction: string }[] };
      expect(m.alerts).toHaveLength(1);
      expect(m.alerts[0]!.direction).toBe("column");
    } finally {
      await browser.close();
    }
  }, 60_000);
});
