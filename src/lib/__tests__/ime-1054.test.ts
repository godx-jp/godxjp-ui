import { describe, expect, it } from "vitest";
import { isImeComposing } from "../ime";

describe("isImeComposing (gh#1054)", () => {
  it("is true for a native keydown with isComposing", () => {
    expect(isImeComposing(new KeyboardEvent("keydown", { key: "Enter", isComposing: true }))).toBe(
      true,
    );
  });

  it("is true for the legacy keyCode 229", () => {
    expect(isImeComposing(new KeyboardEvent("keydown", { key: "Enter", keyCode: 229 }))).toBe(true);
  });

  it("reads a React synthetic event through nativeEvent", () => {
    const nativeEvent = new KeyboardEvent("keydown", { key: "Enter", isComposing: true });
    expect(isImeComposing({ nativeEvent } as unknown as React.KeyboardEvent)).toBe(true);
  });

  it("is false for a plain Enter", () => {
    expect(isImeComposing(new KeyboardEvent("keydown", { key: "Enter" }))).toBe(false);
  });
});
