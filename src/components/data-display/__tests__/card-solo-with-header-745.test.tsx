import { describe, expect, it, vi } from "vitest";

import { renderWithUi } from "@/test/render";

import { Card, CardContent, CardHeader, CardTitle } from "../card";

/*
 * gh#745 — `CardContent solo` asserts "no header above me, so I own the card's block padding".
 * With a `CardHeader` present that contradicts the DOM, and the cascade settles it quietly in
 * favour of the padding: a consumer shipped an edge-to-edge row list with an empty strip above
 * and below it, and could only find the cause by reading this package's CSS. Nothing changes at
 * runtime — the warning names the contradiction and leaves the fix to the caller, because
 * "drop `solo`" and "drop the header" are both plausible from here.
 */
describe("Card warns when a header meets a solo body (gh#745)", () => {
  const warns = () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    return {
      spy,
      // React renders twice under StrictMode in this harness, so the same warning arrives twice.
      // The contract is WHICH warning fires, not how many times React re-ran the component.
      messages: () => [...new Set(spy.mock.calls.map((call) => String(call[0])))],
    };
  };

  it("warns once, naming both halves of the contradiction", () => {
    const { spy, messages } = warns();
    renderWithUi(
      <Card>
        <CardHeader>
          <CardTitle>保存済みフィルター</CardTitle>
        </CardHeader>
        <CardContent flush solo>
          rows
        </CardContent>
      </Card>,
    );
    const hit = messages().filter((message) => message.includes("solo"));
    expect(hit).toHaveLength(1);
    expect(hit[0]).toContain("CardHeader");
    expect(hit[0]).toContain("block padding");
    spy.mockRestore();
  });

  it("stays quiet for either half alone, and for a plain card", () => {
    const { spy, messages } = warns();
    renderWithUi(
      <>
        <Card>
          <CardContent flush solo>
            rows
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>with a header</CardTitle>
          </CardHeader>
          <CardContent flush>rows</CardContent>
        </Card>
        <Card>
          <CardContent>plain</CardContent>
        </Card>
      </>,
    );
    expect(messages().filter((message) => message.includes("solo"))).toEqual([]);
    spy.mockRestore();
  });

  it("renders both children either way — the warning changes nothing", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getByText } = renderWithUi(
      <Card>
        <CardHeader>
          <CardTitle>title</CardTitle>
        </CardHeader>
        <CardContent flush solo>
          rows
        </CardContent>
      </Card>,
    );
    expect(getByText("title")).toBeInTheDocument();
    expect(getByText("rows")).toBeInTheDocument();
    spy.mockRestore();
  });
});
