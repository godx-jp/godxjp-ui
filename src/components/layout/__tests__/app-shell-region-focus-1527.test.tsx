import { fireEvent, render } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "../app-shell";
import { MobileShell } from "../mobile-shell";

/*
 * gh#1527 — clicking empty content focuses `.app-main` (tabIndex 0); the next key press flips it to
 * :focus-visible and the whole content region grew a near-black inset frame. The origin is now
 * recorded when focus ARRIVES and the CSS ring is gated on it. jsdom cannot evaluate
 * :focus-visible, so the browser heuristic is stubbed per case.
 */
const realMatches = HTMLElement.prototype.matches;
function stubFocusVisible(value: boolean) {
  vi.restoreAllMocks();
  const real = realMatches;
  vi.spyOn(HTMLElement.prototype, "matches").mockImplementation(function (
    this: HTMLElement,
    sel: string,
  ) {
    return sel === ":focus-visible" ? value : real.call(this, sel);
  });
}

afterEach(() => vi.restoreAllMocks());

const shells: Array<[string, () => HTMLElement]> = [
  [
    "AppShell .app-main",
    () => render(<AppShell>content</AppShell>).container.querySelector<HTMLElement>(".app-main")!,
  ],
  [
    "MobileShell main",
    () =>
      render(<MobileShell>content</MobileShell>).container.querySelector<HTMLElement>(
        ".ui-mobile-shell-main",
      )!,
  ],
];

describe.each(shells)("%s records how focus arrived (gh#1527)", (_name, mount) => {
  it("pointer arrival → data-focus-origin=pointer, and a later key press does not change it", () => {
    const main = mount();
    stubFocusVisible(false);
    main.focus();
    expect(main.getAttribute("data-focus-origin")).toBe("pointer");
    fireEvent.keyDown(main, { key: "a" });
    expect(main.getAttribute("data-focus-origin")).toBe("pointer");
  });

  it("keyboard arrival (Tab / skip link) → data-focus-origin=keyboard", () => {
    const main = mount();
    stubFocusVisible(true);
    main.focus();
    expect(main.getAttribute("data-focus-origin")).toBe("keyboard");
  });

  it("leaving the region clears the mark, so the next arrival is judged afresh", () => {
    const main = mount();
    stubFocusVisible(false);
    main.focus();
    main.blur();
    expect(main.hasAttribute("data-focus-origin")).toBe(false);
    stubFocusVisible(true);
    main.focus();
    expect(main.getAttribute("data-focus-origin")).toBe("keyboard");
  });

  it("a click on the region while it holds keyboard focus re-marks it as pointer focus", () => {
    const main = mount();
    stubFocusVisible(true);
    main.focus();
    fireEvent.pointerDown(main);
    expect(main.getAttribute("data-focus-origin")).toBe("pointer");
  });

  it("focus landing on a descendant does not mark the region", () => {
    const main = mount();
    const button = document.createElement("button");
    main.appendChild(button);
    stubFocusVisible(false);
    button.focus();
    expect(main.hasAttribute("data-focus-origin")).toBe(false);
  });
});

describe("the region ring is gated on a keyboard arrival (gh#1527)", () => {
  const css = fs.readFileSync(path.resolve(__dirname, "../../../styles/shell-layout.css"), "utf8");
  it.each([".app-main", ".ui-mobile-shell-main"])(
    "%s paints its ring only off a pointer origin",
    (sel) => {
      const esc = sel.replace(/[.]/g, "\\.");
      // Every rule that paints the region ring excludes a pointer arrival…
      const painting = [
        ...css.matchAll(new RegExp(`${esc}:focus-visible[^{]*\\{[^}]*box-shadow`, "g")),
      ];
      expect(painting.length).toBeGreaterThan(0);
      for (const m of painting) expect(m[0]).toContain(':not([data-focus-origin="pointer"])');
      // …while the UA outline is suppressed for every arrival, pointer included.
      expect(css).toMatch(new RegExp(`${esc}:focus-visible\\s*\\{\\s*outline:\\s*none;\\s*\\}`));
    },
  );
});
