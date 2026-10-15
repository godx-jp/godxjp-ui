import { afterEach, describe, expect, it } from "vitest";

import { getActiveElement } from "../active-element";
import { parseShortcut, shouldHandleShortcut } from "../shortcut";

/**
 * gh#1340 — inside a shadow root `document.activeElement` is the HOST, and a key reaching a
 * `document` listener has its target retargeted to the host. jsdom retargets for a real
 * `attachShadow` tree as a browser does.
 */
function mountShadow(mode: ShadowRootMode = "open") {
  const host = document.createElement("div");
  document.body.append(host);
  const shadow = host.attachShadow({ mode });
  const input = document.createElement("input");
  const button = document.createElement("button");
  shadow.append(input, button);
  return { host, shadow, input, button };
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("getActiveElement (gh#1340)", () => {
  it("descends through an open shadow root to the element that really has focus", () => {
    const { host, input } = mountShadow();
    input.focus();
    expect(document.activeElement).toBe(host);
    expect(getActiveElement()).toBe(input);
  });

  it("with a scope, reads that node's own root — a CLOSED shadow root included", () => {
    const { input, button } = mountShadow("closed");
    input.focus();
    expect(getActiveElement()).not.toBe(input);
    expect(getActiveElement(button)).toBe(input);
  });

  it("with a scope whose root does not hold focus, returns null", () => {
    const { button } = mountShadow();
    const outside = document.createElement("input");
    document.body.append(outside);
    outside.focus();
    expect(getActiveElement(button)).toBeNull();
    expect(getActiveElement()).toBe(outside);
  });

  it("in the light DOM it is document.activeElement", () => {
    const outside = document.createElement("input");
    document.body.append(outside);
    outside.focus();
    expect(getActiveElement()).toBe(outside);
    expect(getActiveElement(outside)).toBe(outside);
  });
});

describe("shouldHandleShortcut from inside a shadow root (gh#1340)", () => {
  function decide(target: Element, key: string) {
    const spec = parseShortcut("/")!;
    let verdict: boolean | undefined;
    const listener = (event: KeyboardEvent) => {
      verdict = shouldHandleShortcut(spec, event);
    };
    document.addEventListener("keydown", listener);
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, composed: true }));
    document.removeEventListener("keydown", listener);
    return verdict;
  }

  it('a bare "/" typed into a shadow-root input is text, not the shortcut', () => {
    const { input } = mountShadow();
    expect(decide(input, "/")).toBe(false);
  });

  it('a bare "/" from a non-editable element in the shadow root still fires', () => {
    const { button } = mountShadow();
    expect(decide(button, "/")).toBe(true);
  });
});
