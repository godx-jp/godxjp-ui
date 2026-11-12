import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * CollapseGroup in Chromium: a row removed from the array stays in place, inert and aria-hidden,
 * while its height and opacity fall to 0 — the row under it slides up instead of jumping — and is
 * then gone. Under reduced motion it goes at once.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { CollapseGroup } from "./src/components/general/collapse-group";
function App() {
  const [items, setItems] = React.useState(["a", "b", "c"]);
  window.__remove = (id) => flushSync(() => setItems((xs) => xs.filter((x) => x !== id)));
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none", width: 300 }}>
      <CollapseGroup onExited={(k) => { window.__exited = k; }}>
        {items.map((id) => <li key={id} id={id} style={{ height: 48, padding: "4px 0" }}>{id}</li>)}
      </CollapseGroup>
    </ul>
  );
}
createRoot(document.getElementById("root")).render(<div id="ready"><App /></div>);
`;

let fixture: ChromiumFixture;
beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);
afterAll(async () => {
  await fixture?.close();
});

describe("CollapseGroup", { timeout: 60_000 }, () => {
  it("collapses a removed row, sliding the next one up, then unmounts it", async () => {
    const page = await fixture.open("", { width: 800, height: 600 });
    const { before, rowH } = await page.evaluate(() => ({
      before: document.getElementById("c")!.getBoundingClientRect().top,
      rowH: document.getElementById("b")!.getBoundingClientRect().height,
    }));
    const during = await page.evaluate(
      () =>
        new Promise<Record<string, unknown>>((resolve) => {
          (window as unknown as { __remove: (id: string) => void }).__remove("b");
          setTimeout(() => {
            const b = document.getElementById("b");
            resolve({
              present: !!b,
              inert: b?.hasAttribute("inert"),
              hidden: b?.getAttribute("aria-hidden"),
              height: b?.getBoundingClientRect().height,
              cTop: document.getElementById("c")!.getBoundingClientRect().top,
            });
          }, 120);
        }),
    );
    await page.waitForTimeout(700);
    const after = await page.evaluate(() => ({
      present: !!document.getElementById("b"),
      cTop: document.getElementById("c")!.getBoundingClientRect().top,
      exited: (window as unknown as { __exited?: string }).__exited,
    }));
    await page.close();
    expect(during.present).toBe(true);
    expect(during.inert).toBe(true);
    expect(during.hidden).toBe("true");
    expect(during.height as number).toBeGreaterThan(0);
    expect(during.height as number).toBeLessThan(rowH);
    expect(during.cTop as number).toBeLessThan(before);
    expect(during.cTop as number).toBeGreaterThan(after.cTop);
    expect(after.present).toBe(false);
    expect(before - after.cTop).toBeCloseTo(rowH, 0);
    expect(after.exited).toBe("b");
  });

  it("removes at once under prefers-reduced-motion", async () => {
    const page = await fixture.open("", { width: 800, height: 600 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const present = await page.evaluate(
      () =>
        new Promise<boolean>((resolve) => {
          (window as unknown as { __remove: (id: string) => void }).__remove("b");
          requestAnimationFrame(() => resolve(!!document.getElementById("b")));
        }),
    );
    await page.close();
    expect(present).toBe(false);
  });
});
