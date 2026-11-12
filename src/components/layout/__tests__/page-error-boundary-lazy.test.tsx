/**
 * PageErrorBoundary's default fallback loads ErrorSurface LAZILY (33.30.2): an accessible inline
 * alert — same heading, sentence and reload action — is on screen at once, and the full surface
 * replaces it when its chunk arrives.
 */
import { describe, expect, it, vi } from "vitest";

import { AppProvider } from "@/app/app-provider";
import { render, screen } from "@/test/render";
import { PageErrorBoundary } from "../page-error-boundary";

function Thrower(): never {
  throw new Error("boom");
}

describe("PageErrorBoundary default fallback (lazy ErrorSurface)", () => {
  it("shows an accessible inline alert at once, then the ErrorSurface", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <AppProvider defaultLocale="en" persist={false}>
        <PageErrorBoundary onError={() => {}}>
          <Thrower />
        </PageErrorBoundary>
      </AppProvider>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("data-slot", "page-error-fallback");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
    // The full surface lands when the chunk resolves.
    await vi.waitFor(() =>
      expect(container.querySelector('[data-slot="error-surface"]')).not.toBeNull(),
    );
    expect(container.querySelector('[data-slot="page-error-fallback"]')).toBeNull();
    vi.restoreAllMocks();
  });
});
