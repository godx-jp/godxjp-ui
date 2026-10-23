/**
 * useMediaQuery must be hydration-safe (TCG-M consumer report: TanStack Start + Cloudflare Workers SSR).
 *
 * The server cannot evaluate a media query, so it renders the "no match" branch. If the FIRST client
 * render reads `window.matchMedia` — which the old `useState(getMatch())` did — a phone hydrates a
 * different tree than the server sent: AppShell published `data-navigation="docked"` from the server
 * and `"drawer"` on the client, and React logged "A tree hydrated but some attributes of the server
 * rendered HTML didn't match" (an attribute mismatch React does NOT patch up). The hook has to hand
 * React the server value during hydration and switch to the live match right after.
 */
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "../../components/layout/app-shell";
import { useMediaQuery } from "../hooks";

function Probe() {
  return (
    <div data-testid="probe" data-mode={useMediaQuery("(width <= 56.25rem)") ? "narrow" : "wide"} />
  );
}

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

/** Server-render with no match, then hydrate on a client whose query DOES match. */
async function hydrateOnNarrowClient(ui: React.ReactElement) {
  stubMatchMedia(false);
  const html = renderToString(ui);
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);

  stubMatchMedia(true);
  const errors: string[] = [];
  const spy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    errors.push(args.map(String).join(" "));
  });
  const recoverable: unknown[] = [];
  await act(async () => {
    hydrateRoot(container, ui, { onRecoverableError: (e) => recoverable.push(e) });
  });
  spy.mockRestore();
  return { container, errors, recoverable };
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("useMediaQuery — SSR hydration", () => {
  it("hydrates with the server value, then switches to the live match without a mismatch", async () => {
    const { container, errors, recoverable } = await hydrateOnNarrowClient(<Probe />);
    expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
    expect(recoverable).toEqual([]);
    // After hydration the live media query wins.
    expect(container.querySelector("[data-testid=probe]")?.getAttribute("data-mode")).toBe(
      "narrow",
    );
  });

  it("AppShell's data-navigation hydrates without an attribute mismatch on a phone", async () => {
    const shell = (
      <AppShell sidebar={<nav aria-label="Main">nav</nav>}>
        <p>content</p>
      </AppShell>
    );
    const { container, errors } = await hydrateOnNarrowClient(shell);
    expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
    expect(container.querySelector(".app-root")?.getAttribute("data-navigation")).toBe("drawer");
  });
});
