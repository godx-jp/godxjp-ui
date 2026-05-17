import { describe, expect, it } from "vitest";
import { matchBreakpoint } from "../useBreakpoint";

describe("matchBreakpoint", () => {
  it("returns true when current === target", () => {
    expect(matchBreakpoint("md", "md")).toBe(true);
  });

  it("returns true when current is wider than target", () => {
    expect(matchBreakpoint("lg", "md")).toBe(true);
    expect(matchBreakpoint("xl", "sm")).toBe(true);
    expect(matchBreakpoint("xxl", "xs")).toBe(true);
  });

  it("returns false when current is narrower than target", () => {
    expect(matchBreakpoint("sm", "lg")).toBe(false);
    expect(matchBreakpoint("xs", "md")).toBe(false);
  });

  it("respects the canonical xs < sm < md < lg < xl < xxl order", () => {
    const order = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;
    for (let i = 0; i < order.length; i++) {
      for (let j = 0; j < order.length; j++) {
        const actual = matchBreakpoint(order[i]!, order[j]!);
        const expected = i >= j;
        expect(actual).toBe(expected);
      }
    }
  });

  it("xs is the narrowest — never matches anything above", () => {
    expect(matchBreakpoint("xs", "sm")).toBe(false);
    expect(matchBreakpoint("xs", "xxl")).toBe(false);
    expect(matchBreakpoint("xs", "xs")).toBe(true);
  });

  it("xxl is the widest — always matches", () => {
    for (const target of ["xs", "sm", "md", "lg", "xl", "xxl"] as const) {
      expect(matchBreakpoint("xxl", target)).toBe(true);
    }
  });
});
