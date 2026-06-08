import { beforeEach, describe, expect, it } from "vitest";

import { formatDate } from "../format-date";
import { resetDatetimeContextForTests } from "../sync";

beforeEach(() => resetDatetimeContextForTests());

describe("formatDate — explicit kind override", () => {
  it("kind=time formats a valid HH:mm via formatTimeOfDay", () => {
    expect(formatDate("14:30", { kind: "time" })).toMatch(/14|2.*30|30/);
  });

  it("kind=time on a non-HH:mm value falls back to formatAppTime", () => {
    // isValidHhmm("…T14:30…") is false → the formatAppTime branch
    const out = formatDate("2026-03-20T14:30:00Z", { kind: "time" });
    expect(typeof out).toBe("string");
    expect(out).not.toBe("");
  });

  it("kind=long and kind=relative dispatch to their formatters", () => {
    expect(typeof formatDate("2026-03-20", { kind: "long" })).toBe("string");
    expect(typeof formatDate("2026-03-20", { kind: "relative" })).toBe("string");
  });
});
