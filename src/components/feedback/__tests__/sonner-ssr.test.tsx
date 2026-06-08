import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";

// keep the SSR render trivial — we only care about the theme our Toaster computes
vi.mock("sonner", () => ({
  Toaster: ({ theme }: { theme?: string }) => <div data-testid="sonner" data-theme={theme} />,
}));

import { Toaster } from "../sonner";

describe("Toaster — server rendering", () => {
  it("falls back to the light theme via the server snapshot during SSR", () => {
    const html = renderToString(<Toaster />);
    expect(html).toContain('data-theme="light"'); // useSyncExternalStore getServerSnapshot
  });
});
