import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, userEvent } from "@/test/render";

import { AppProvider } from "../../../app/app-provider";

import { AppShell } from "../app-shell";
import { PageContainer } from "../page-container";
import { PageErrorBoundary } from "../page-error-boundary";

/**
 * gh#1494 — a page that threw while rendering took the whole shell down (sidebar and topbar gone,
 * a white screen), and Back through history stayed white because nothing reset. AppShell now wraps
 * its page in a boundary that keeps the shell, draws an ErrorSurface, and resets on navigation.
 */
function Broken({ when = true }: { when?: boolean }): React.ReactElement {
  if (when) throw new Error("page exploded");
  return <PageContainer title="Recovered page" />;
}

function renderIn(ui: React.ReactElement, locale = "en") {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppProvider persist={false} defaultLocale={locale}>
        {children}
      </AppProvider>
    ),
  });
}

let consoleError: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  // React logs every caught render error; the assertions below are about the DOM.
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  consoleError.mockRestore();
  window.history.replaceState(null, "", "/");
});

const shell = (
  page: React.ReactNode,
  extra: Partial<React.ComponentProps<typeof AppShell>> = {},
) => (
  <AppShell sidebar={<nav aria-label="Primary">menu</nav>} topbar={<span>topbar</span>} {...extra}>
    {page}
  </AppShell>
);

describe("AppShell page error boundary (gh#1494)", () => {
  it("a throwing page keeps the shell and shows the localized ErrorSurface as the page heading", () => {
    renderIn(shell(<Broken />));
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByText("topbar")).toBeInTheDocument();
    const main = screen.getByRole("main");
    expect(main).toContainElement(
      screen.getByRole("heading", { level: 1, name: "This page could not be displayed" }),
    );
    expect(screen.getByRole("button", { name: "Reload page" })).toBeInTheDocument();
  });

  it("resets when the URL changes (the router re-renders the shell on the next visit)", () => {
    window.history.replaceState(null, "", "/broken");
    const { rerender } = renderIn(shell(<Broken />));
    expect(
      screen.getByRole("heading", { name: "This page could not be displayed" }),
    ).toBeInTheDocument();
    window.history.pushState(null, "", "/other");
    rerender(shell(<Broken when={false} />));
    expect(screen.getByRole("heading", { name: "Recovered page" })).toBeInTheDocument();
  });

  it("does NOT reset on a re-render under the same URL and the same resetKey (negative case)", () => {
    const { rerender } = renderIn(shell(<Broken />, { errorBoundary: { resetKey: "a" } }));
    rerender(shell(<Broken when={false} />, { errorBoundary: { resetKey: "a" } }));
    expect(
      screen.getByRole("heading", { name: "This page could not be displayed" }),
    ).toBeInTheDocument();
    rerender(shell(<Broken when={false} />, { errorBoundary: { resetKey: "b" } }));
    expect(screen.getByRole("heading", { name: "Recovered page" })).toBeInTheDocument();
  });

  it("errorBoundary={false} leaves error handling to the app (the error propagates)", () => {
    expect(() => renderIn(shell(<Broken />, { errorBoundary: false }))).toThrow("page exploded");
  });

  it("onError receives the error; a render-prop fallback can reset without a reload", async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    let shouldThrow = true;
    function Flaky() {
      if (shouldThrow) throw new Error("flaky");
      return <p>ok now</p>;
    }
    renderIn(
      <PageErrorBoundary
        onError={onError}
        fallback={({ reset }) => (
          <button type="button" onClick={reset}>
            Try again
          </button>
        )}
      >
        <Flaky />
      </PageErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "flaky" }),
      expect.anything(),
    );
    shouldThrow = false;
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("ok now")).toBeInTheDocument();
  });

  it("renders the localized fallback in Japanese", () => {
    renderIn(
      <PageErrorBoundary>
        <Broken />
      </PageErrorBoundary>,
      "ja",
    );
    expect(
      screen.getByRole("heading", { name: "このページを表示できませんでした" }),
    ).toBeInTheDocument();
  });
});
