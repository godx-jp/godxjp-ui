import { describe, expect, it } from "vitest";

import { normalizeTreeOptions } from "../tree-utils";

describe("normalizeTreeOptions — value coercion (unknownText)", () => {
  it("stringifies a numeric value", () => {
    const t = normalizeTreeOptions([{ value: 42, label: "数値" }]);
    expect(t[0].value).toBe("42"); // unknownText number branch
  });

  it("falls back to an empty string when the value is missing/non-primitive", () => {
    const t = normalizeTreeOptions([{ label: "値なし" }]);
    expect(t[0].value).toBe(""); // unknownText "" branch (non-string/number/bigint)
  });
});
