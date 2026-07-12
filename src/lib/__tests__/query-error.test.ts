import { describe, expect, it } from "vitest";
import { classifyQueryError, isRetryableQueryError, type QueryErrorCategory } from "../query-error";

describe("classifyQueryError", () => {
  const cases: Array<[unknown, QueryErrorCategory, boolean]> = [
    // auth — status or message, invalid/expired token
    [{ status: 401 }, "auth", false],
    [new Error("Access token invalid"), "auth", false],
    [new Error("token has expired"), "auth", false],
    [new Error("Unauthorized"), "auth", false],
    // forbidden
    [{ status: 403 }, "forbidden", false],
    [new Error("Permission denied"), "forbidden", false],
    // not found
    [{ status: 404 }, "notFound", false],
    [new Error("Resource not found"), "notFound", false],
    // validation / domain
    [{ status: 422, message: "must be > 0" }, "validation", false],
    [{ status: 400 }, "validation", false],
    // transient — retryable
    [{ status: 500 }, "transient", true],
    [{ status: 503 }, "transient", true],
    [{ status: 408 }, "transient", true],
    [{ status: 429 }, "transient", true],
    [new Error("Failed to fetch"), "transient", true],
    [new Error("Network request timed out"), "transient", true],
    [new Error("GET /v1/customers failed: 503"), "transient", true],
    // unknown
    [new Error("boom"), "unknown", false],
    ["some string", "unknown", false],
    [null, "unknown", false],
    [undefined, "unknown", false],
  ];

  it.each(cases)("classifies %o as %s (retryable=%s)", (error, category, retryable) => {
    const info = classifyQueryError(error);
    expect(info.category).toBe(category);
    expect(info.retryable).toBe(retryable);
    expect(isRetryableQueryError(error)).toBe(retryable);
  });

  it("prefers an explicit HTTP status over ambiguous message keywords", () => {
    // A 503 body that happens to mention 'not found' is still a transient/retryable failure.
    expect(classifyQueryError({ status: 503, message: "upstream not found" }).category).toBe(
      "transient",
    );
  });

  it("reads status from a nested response object (axios-style)", () => {
    expect(classifyQueryError({ response: { status: 403 } }).category).toBe("forbidden");
  });

  it("never marks auth/forbidden/notFound/validation as retryable", () => {
    for (const status of [401, 403, 404, 422, 400]) {
      expect(classifyQueryError({ status }).retryable).toBe(false);
    }
  });
});
