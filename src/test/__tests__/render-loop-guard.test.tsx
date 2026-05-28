import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { RenderLoopGuard, withRenderLoopGuard } from "../render-loop-guard";

function BadCounter() {
  const [, bump] = React.useState(0);
  bump(1);
  return <div>loop</div>;
}

describe("RenderLoopGuard", () => {
  it("passes for stable components", () => {
    render(
      <RenderLoopGuard maxRenders={10} label="Stable">
        <p>ok</p>
      </RenderLoopGuard>,
    );
    expect(screen.getByText("ok")).toBeInTheDocument();
  });

  it("throws when render count exceeds maxRenders", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(
        <RenderLoopGuard maxRenders={5} label="BadCounter">
          <BadCounter />
        </RenderLoopGuard>,
      ),
    ).toThrow(/Possible infinite render loop|Too many re-renders/i);
    errorSpy.mockRestore();
  });

  it("withRenderLoopGuard wraps StrictMode", () => {
    render(withRenderLoopGuard(<span data-testid="child">child</span>, { maxRenders: 10 }));
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
