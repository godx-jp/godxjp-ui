import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * THE LOCKUP MUST FIT ITS CONTAINER (gh#912).
 *
 * Measured on a consumer (godx-jp/id#1797), `<Logo mark="godx-lockup" productSuffix="ID" />` at a
 * 320px viewport with `html { font-size: 200% }`: the artwork ended at x=336 and the "ID" suffix
 * at x=397, so the whole page scrolled sideways. The height is a rem token and the width followed
 * it with no ceiling; `.ui-logo`'s `flex: 0 0 auto` forbade shrinking; the lockup could not wrap.
 *
 * jsdom does no layout, so this reads the cascade the browser would apply. The geometry itself
 * was checked in Chromium on the consumer: scrollWidth 397 -> 320 with these rules and no other
 * change.
 */
const css = readFileSync(resolve(process.cwd(), "src/styles/logo-layout.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

/** Every declaration of every rule whose selector list contains `selector` exactly, in order. */
function declarationsFor(selector: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const [, list, body] of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    const selectors = list.split(",").map((s) => s.trim().replace(/\s+/g, " "));
    if (!selectors.includes(selector)) continue;
    for (const declaration of body.split(";")) {
      const [property, ...value] = declaration.split(":");
      if (property.trim() !== "") found.set(property.trim(), value.join(":").trim());
    }
  }
  return found;
}

describe("godx-lockup reflow (gh#912)", () => {
  it("lets the lockup wrap its suffix and never grow past its container", () => {
    const lockup = declarationsFor(".ui-logo-lockup");
    expect(lockup.get("flex-wrap")).toBe("wrap");
    expect(lockup.get("max-inline-size")).toBe("100%");
    expect(lockup.get("min-inline-size")).toBe("0");
  });

  it("lets the artwork box shrink below its tier width instead of holding it", () => {
    const mark = declarationsFor('.ui-logo[data-mark="godx-lockup"]');
    expect(mark.get("flex-shrink")).toBe("1");
    expect(mark.get("min-inline-size")).toBe("0");
    expect(mark.get("max-inline-size")).toBe("100%");

    const artwork = declarationsFor('.ui-logo[data-mark="godx-lockup"] [data-slot="logo-artwork"]');
    expect(artwork.get("max-inline-size")).toBe("100%");
    // The height rule stays: a lockup that fits keeps its tier size to the pixel.
    expect(artwork.get("height")).toBe("100%");
  });
});
