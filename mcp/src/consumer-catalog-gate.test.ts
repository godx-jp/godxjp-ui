import { afterEach, describe, expect, it, vi } from "vitest";

import { PATTERNS } from "./data/patterns.js";
import { dispatchTool, uiVersionMatchesCatalog } from "./tools/registry.js";
import pkg from "../package.json";

const sampleComponent = "Select";
const samplePattern = PATTERNS[0]?.name ?? "registration-form";

describe("catalog gate via GODX_UI_VERSION from launcher (gh#543)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fixture A — matching minor returns component snippet", async () => {
    const [maj, min] = pkg.version.split(".");
    vi.stubEnv("GODX_UI_VERSION", `${maj}.${min}.0`);
    expect(uiVersionMatchesCatalog(`${maj}.${min}.0`)).toBe(true);

    const out = await dispatchTool("get_component", { name: sampleComponent });
    expect(out).toContain("## Example");
    expect(out).toMatch(/```tsx/);
    expect(out).not.toMatch(/Catalog withheld/);
  });

  it("fixture B — mismatched minor returns diagnostic without catalog code", async () => {
    vi.stubEnv("GODX_UI_VERSION", "20.1.0");
    expect(uiVersionMatchesCatalog("20.1.0")).toBe(false);

    const out = await dispatchTool("get_component", { name: sampleComponent });
    expect(out).toMatch(/MISMATCH/);
    expect(out).toMatch(/Catalog withheld for `get_component`/);
    expect(out).toContain("20.1.0");
    expect(out).toContain(pkg.version);
    expect(out).not.toContain("## Props");
    expect(out).not.toContain("## Example");
    expect(out).not.toMatch(/```tsx/);

    const patternOut = await dispatchTool("get_pattern", { name: samplePattern });
    expect(patternOut).toMatch(/Catalog withheld for `get_pattern`/);
    expect(patternOut).not.toMatch(/```tsx/);
  });
});
