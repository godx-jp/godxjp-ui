import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useScrollableRegionTabIndex } from "../hooks";
import { renderWithUi, screen, waitFor } from "@/test/render";

// jsdom reports every box as 0×0, so the scroll geometry the hook measures has to be stubbed.
function stubScrollGeometry({ overflows }: { overflows: boolean }) {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(overflows ? 200 : 100);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(100);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(100);
}

function Region({ children }: { children: React.ReactNode }) {
  const [element, setElement] = React.useState<HTMLElement | null>(null);
  useScrollableRegionTabIndex(element);
  return (
    <div data-testid="region" ref={setElement}>
      {children}
    </div>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useScrollableRegionTabIndex", () => {
  it("gives a scrolling, text-only region its own tab stop", () => {
    stubScrollGeometry({ overflows: true });
    renderWithUi(<Region>読み取り専用の長いテキスト</Region>);

    expect(screen.getByTestId("region")).toHaveAttribute("tabindex", "0");
  });

  it("adds no tab stop when the content is already focusable", () => {
    stubScrollGeometry({ overflows: true });
    renderWithUi(
      <Region>
        <button type="button">次へ</button>
      </Region>,
    );

    // Tabbing to the button scrolls the region — a second stop would be redundant noise.
    expect(screen.getByTestId("region")).not.toHaveAttribute("tabindex");
  });

  it("adds no tab stop when nothing overflows", () => {
    stubScrollGeometry({ overflows: false });
    renderWithUi(<Region>短いテキスト</Region>);

    expect(screen.getByTestId("region")).not.toHaveAttribute("tabindex");
  });

  it("treats a disabled control as unreachable content", () => {
    stubScrollGeometry({ overflows: true });
    renderWithUi(
      <Region>
        <button type="button" disabled>
          次へ
        </button>
      </Region>,
    );

    expect(screen.getByTestId("region")).toHaveAttribute("tabindex", "0");
  });

  it("drops the tab stop again once the content becomes focusable", async () => {
    stubScrollGeometry({ overflows: true });
    const { rerender } = renderWithUi(
      <Region>
        <button type="button" disabled>
          次へ
        </button>
      </Region>,
    );
    expect(screen.getByTestId("region")).toHaveAttribute("tabindex", "0");

    rerender(
      <Region>
        <button type="button">次へ</button>
      </Region>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("region")).not.toHaveAttribute("tabindex");
    });
  });
});
