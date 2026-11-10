import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * GDX-1456 in Chromium, against the real stylesheet: a console with more rows than the window,
 * opened on a page near the end of the list, painted the current row half under the nav's fold
 * (/system/ai/quotas at 1024×900: 8.6px of a 32px row cut). The nav now scrolls by the least amount
 * that shows the current row whole, inside its own scroller; a row already in view moves nothing,
 * and a consumer's `scrollRef` still receives the scroller.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Sidebar } from "./src/components/layout/sidebar";
const items = (n, from) => Array.from({ length: n }, (_, i) => ({ id: "r" + (from + i), label: "行 " + (from + i), href: "#r" + (from + i) }));
const sections = [
  { label: "システム", items: items(6, 1) },
  { label: "AI", items: items(6, 7) },
];
const active = new URLSearchParams(location.search).get("active") ?? "r1";
function App() {
  const ref = React.useRef(null);
  React.useEffect(() => { document.body.dataset.scrollRef = ref.current?.className ?? "none"; }, []);
  return (
    <div id="rail" style={{ inlineSize: "240px", blockSize: "300px", display: "flex", flexDirection: "column" }}>
      <Sidebar sections={sections} activeId={active} scrollRef={ref} />
    </div>
  );
}
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}><App /></AppProvider>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

async function measure(active: string) {
  const page = await fixture.open(`?active=${active}`, { width: 1024, height: 900 });
  await page.waitForTimeout(100);
  const m = await page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>(".sb-nav-scroll")!;
    const row = nav.querySelector<HTMLElement>('[aria-current="page"]')!;
    const v = nav.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    return {
      scrolls: nav.scrollHeight > nav.clientHeight,
      scrollTop: nav.scrollTop,
      viewTop: v.top + nav.clientTop,
      viewBottom: v.top + nav.clientTop + nav.clientHeight,
      rowTop: r.top,
      rowBottom: r.bottom,
      pageScroll: document.scrollingElement!.scrollTop,
      scrollRef: document.body.dataset.scrollRef,
    };
  });
  await page.close();
  return m;
}

describe("Sidebar shows the current row whole (GDX-1456)", { timeout: 60_000 }, () => {
  it("a current row below the fold is scrolled into the nav's view, the page does not move", async () => {
    const m = await measure("r12");
    expect(m.scrolls, JSON.stringify(m)).toBe(true);
    expect(m.scrollTop).toBeGreaterThan(0);
    expect(m.rowTop).toBeGreaterThanOrEqual(m.viewTop);
    expect(m.rowBottom, JSON.stringify(m)).toBeLessThanOrEqual(m.viewBottom);
    expect(m.pageScroll).toBe(0);
    expect(m.scrollRef).toContain("sb-nav-scroll");
  });

  it("a current row already in view moves nothing", async () => {
    const m = await measure("r2");
    expect(m.scrolls).toBe(true);
    expect(m.scrollTop).toBe(0);
  });
});
