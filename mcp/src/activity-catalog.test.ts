import { describe, expect, it } from "vitest";

import { COMPONENTS } from "./data/components.js";
import { TOKENS } from "./data/tokens.js";

/**
 * gh#313 — the ambient-motion catalog entry.
 *
 * The generic integrity suite proves the entry is WELL-FORMED. What it cannot prove is that the
 * entry still carries the two facts an agent must not get wrong about a looping indicator: that
 * `announce` defaults to OFF (a live region on a socket-driven flicker is a screen-reader flood),
 * and that reusing `Skeleton` for it is wrong rather than merely untidy. Those are the reasons the
 * component exists, so they are asserted by name.
 */
describe("Activity catalog entry (gh#313)", () => {
  const activity = COMPONENTS.find((component) => component.name === "Activity");

  it("is catalogued in the general group as the ambient/loop counterpart to Reveal", () => {
    expect(activity).toBeDefined();
    expect(activity?.group).toBe("general");
    expect(activity?.related?.join(" ")).toContain("Reveal");
  });

  it("documents `announce` as defaulting to false, with no live region emitted", () => {
    const announce = activity?.props.find((prop) => prop.name === "announce");
    expect(announce?.type).toBe('false | "polite"');
    expect(announce?.defaultValue).toBe("false");
    expect(announce?.description).toMatch(/NO live region/);
  });

  it("tells consumers why Skeleton and Button loading are the wrong reach", () => {
    const usage = activity?.usage?.join("\n") ?? "";
    expect(usage).toMatch(/DO NOT reuse Skeleton/);
    expect(usage).toMatch(/aria-busy/);
    expect(usage).toMatch(/DO NOT reuse Button/);
  });

  it("points at the reduced-motion guarantee and the theme knobs", () => {
    const usage = activity?.usage?.join("\n") ?? "";
    expect(usage).toMatch(/prefers-reduced-motion/);
    expect(usage).toMatch(/--activity-interval/);
  });

  it("catalogs the loop interval as the missing member of the motion tier", () => {
    const names = TOKENS.map((token) => token.name);
    expect(names).toContain("--duration-loop");
    expect(names).toContain("--activity-interval");
    expect(names).toContain("--activity-stagger-step");
    const color = TOKENS.find((token) => token.name === "--activity-color");
    // Role-mirror knob: the catalog must keep saying `initial`, or a service that scopes
    // --muted-foreground silently never reaches the mark (docs/TOKENS.md).
    expect(color?.role).toMatch(/initial/);
  });
});
