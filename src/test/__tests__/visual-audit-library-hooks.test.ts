import { spawn } from "node:child_process";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";

/**
 * The probes map library components through their own DOM hooks (data-slot / ui-* classes), so a
 * consumer gets the mapping without annotating anything. Hand-written calibration pages cannot
 * prove those hooks match what the components really render — only the components can. This
 * renders the REAL AppShell / Topbar / SearchInput / TopbarItem+Avatar in a DropdownMenu /
 * PageContainer extra with the package's REAL stylesheet, serves it, and runs the REAL CLI.
 *
 * Asserted: each probe finds its library element (status is a verdict — pass or fail — never
 * "not-found" or "unmapped"). Not asserted: whether the library's defaults pass; that is a
 * product question the report answers, not a property of the mapping.
 */
const ROOT = path.resolve(__dirname, "../../..");
const SCRIPT = path.join(ROOT, "scripts/visual-audit.mjs");

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { AppShell } from "./src/components/layout/app-shell";
import { Topbar } from "./src/components/layout/topbar";
import { TopbarItem } from "./src/components/layout/topbar-item";
import { PageContainer } from "./src/components/layout/page-container";
import { SearchInput } from "./src/components/data-entry/search-input";
import { Avatar, AvatarFallback } from "./src/components/data-display/avatar";
import { Button } from "./src/components/general/button";
import { Text } from "./src/components/general/typography";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./src/components/navigation/dropdown-menu";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <AppShell
      topbarSpan="full"
      topbar={
        <Topbar
          end={
            <>
              <SearchInput ariaLabel="Search this collection" placeholder="Search this collection" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TopbarItem aria-label="Account menu" icon={<Avatar><AvatarFallback>FA</AvatarFallback></Avatar>}>
                    <Text truncate>Famgia Info</Text>
                  </TopbarItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end"><DropdownMenuItem>Log out</DropdownMenuItem></DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        />
      }
    >
      <PageContainer
        title="Release notes"
        extra={
          <>
            <Button variant="outline">Page settings</Button>
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </>
        }
      >
        <Text>Body</Text>
      </PageContainer>
    </AppShell>
  </AppProvider>,
);
`;

let server: Server;
let base = "";

beforeAll(async () => {
  // esbuild's Node API checks TextEncoder/Uint8Array identity, which jsdom replaces.
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
  const css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`;
  server = createServer((_req, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  base = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
}, 60_000);

afterAll(() => {
  server?.closeAllConnections?.();
  server?.close();
});

type Result = {
  status: string;
  findings: { rule: string; viewport?: string; element?: string; message: string }[];
  matrix: { viewport: string; rules: Record<string, string> }[];
  errors: unknown[];
};

function audit(widths: string): Promise<{ result: Result | null; out: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SCRIPT, "--format", "json", "--widths", widths, base], {
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

const VERDICT = ["pass", "fail", "partial"];

describe("visual-audit probes map real library components without consumer annotations", () => {
  it("SearchInput, TopbarItem+Avatar account trigger and PageContainer extra are found at 390; the end-aligned search is recognised at 1280", async () => {
    const { result, out } = await audit("390x844,1280x900");
    if (/needs the optional peer `playwright`/.test(out) && !process.env.CI) return;
    expect(result, out).not.toBeNull();
    expect(result!.status, JSON.stringify(result!.errors)).toBe("ok");
    const phone = result!.matrix.find((m) => m.viewport === "390x844")!;
    const desk = result!.matrix.find((m) => m.viewport === "1280x900")!;
    for (const rule of ["c02-search-usable", "c04-compact-account-name", "c06-compact-actions"])
      expect(
        VERDICT,
        `${rule} @390: ${phone.rules[rule]} ${JSON.stringify((result as unknown as { unmapped: unknown[] }).unmapped)}`,
      ).toContain(phone.rules[rule]);
    expect(desk.rules["c11-search-keyline"]).toBe("not-applicable-end-aligned");
    // The DropdownMenu trigger is a real account trigger: named, declares and opens its menu.
    const c04 = result!.findings.filter(
      (f) => f.rule === "c04-compact-account-name" && f.viewport === "390x844",
    );
    expect(c04.map((f) => f.message).join("\n")).not.toMatch(/no accessible name|inert|not inside/);
    // Without `labelHideBelow` the name is the cell's plain child (no label slot) and stays
    // visible at 390 — the probe must see it there, not only inside a label slot (a false pass
    // the first mapping produced on exactly this composition).
    expect(c04.map((f) => f.message).join("\n")).toMatch(/account name "Famgia Info" is visible/);
  }, 120_000);
});
