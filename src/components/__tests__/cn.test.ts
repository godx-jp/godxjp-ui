import { describe, expect, it } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("returns empty string when given nothing", () => {
    expect(cn()).toBe("");
  });

  it("joins plain string class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores falsy values (clsx contract)", () => {
    expect(cn("a", false, "b", undefined, null, "c")).toBe("a b c");
  });

  it("handles conditional object form", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("flattens arrays", () => {
    expect(cn(["a", "b"], ["c"])).toBe("a b c");
  });

  it("dedupes Tailwind utility conflicts — last bg wins", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("dedupes Tailwind utility conflicts — last padding wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("preserves non-conflicting Tailwind utilities", () => {
    expect(cn("bg-red-500", "text-white", "rounded-md")).toBe(
      "bg-red-500 text-white rounded-md",
    );
  });

  it("merges conditional Tailwind classes", () => {
    expect(cn("p-2", "hover:p-4", { "p-6": true })).toBe("hover:p-4 p-6");
  });

  it("works with framework token-class names (non-Tailwind passes through)", () => {
    // .card, .card-padding-tight, .card-tone-muted are framework
    // classes that tailwind-merge doesn't know about — they should
    // pass through unchanged.
    expect(cn("card", "card-padding-tight", "card-tone-muted")).toBe(
      "card card-padding-tight card-tone-muted",
    );
  });
});
