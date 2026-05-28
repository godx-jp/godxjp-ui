import { describe, expect, it } from "vitest";
import { densityClass, inlineGapClass, stackGapClass } from "../variants";

describe("variants maps", () => {
  it("maps page density to ui classes", () => {
    expect(densityClass.compact).toBe("ui-density-compact");
    expect(densityClass.default).toBe("ui-density-default");
    expect(densityClass.comfortable).toBe("ui-density-comfortable");
  });

  it("maps stack gaps", () => {
    expect(stackGapClass.md).toBe("ui-stack-md");
  });

  it("maps inline gaps", () => {
    expect(inlineGapClass.sm).toBe("ui-inline-sm");
  });
});
