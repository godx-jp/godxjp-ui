import { describe, expect, it } from "vitest";

import * as navigation from "../index";

/**
 * v32 #1223 — FilterBar = Toolbar: ONE catalog entry (`Toolbar`) plus an alias. The alias has to
 * stay the SAME component, not a copy, or the single entry would document two behaviours.
 */
describe("FilterBar is an alias of Toolbar (#1223)", () => {
  it("FilterBar and FilterBarGroup are the very Toolbar and ToolbarGroup functions", () => {
    expect(navigation.FilterBar).toBe(navigation.Toolbar);
    expect(navigation.FilterBarGroup).toBe(navigation.ToolbarGroup);
  });
});
