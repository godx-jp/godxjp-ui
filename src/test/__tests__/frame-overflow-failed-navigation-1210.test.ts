import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain .mjs script module, no types
import { UNSAFE_PORTS, safePort } from "../../../scripts/frame-harness.mjs";

const ROOT = path.resolve(__dirname, "../../..");

describe("frame-harness safePort (gh#1210)", () => {
  it("steps past every browser-unsafe port in the derived range", () => {
    expect(safePort(6669)).toBe(6670);
    expect(safePort(6665)).toBe(6670);
    expect(safePort(6566)).toBe(6567);
    expect(safePort(6697)).toBe(6698);
    for (let p = 6008; p < 7008; p += 1) expect(UNSAFE_PORTS.has(safePort(p))).toBe(false);
  });

  it("leaves a safe port alone", () => {
    expect(safePort(6008)).toBe(6008);
    expect(safePort(6664)).toBe(6664);
  });
});

describe("check:frame-overflow refuses a verdict when navigations fail (gh#1210)", () => {
  it("exits non-zero and prints no ✓ when every frame fails to load", () => {
    // 127.0.0.1 (not "localhost") so the harness does not build/start a preview; 6669 is a port
    // Chromium refuses with ERR_UNSAFE_PORT, so every navigation fails. This used to print
    // "✓ … 0 known overflow(s)" and exit 0.
    const r = spawnSync(
      process.execPath,
      ["scripts/check-frame-overflow.mjs", "--only", "button"],
      {
        cwd: ROOT,
        env: { ...process.env, PREVIEW_BASE: "http://127.0.0.1:6669", CI: "" },
        encoding: "utf8",
        timeout: 120_000,
      },
    );
    const out = `${r.stdout}\n${r.stderr}`;
    if (/playwright not installed/.test(out)) return;
    expect(out).not.toMatch(/✓ check:frame-overflow/);
    expect(out).toMatch(/navigation\(s\) failed/);
    expect(r.status).toBe(2);
  }, 130_000);
});
