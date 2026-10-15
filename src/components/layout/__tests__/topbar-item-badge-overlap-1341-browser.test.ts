import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * gh#1341 in Chromium, against the real stylesheet: the `TopbarItem` count pill was 16px on a 16px
 * glyph and pushed out by only 4px, so it covered 144/256 px² = 56% of the bell it counted. Per
 * Material 3 badges and Apple HIG the pill is anchored at the glyph's top-end corner and mostly
 * OUTSIDE it — at most a quarter of the glyph covered — and a longer count ("99+") grows away from
 * the glyph, not across it.
 *
 * Measured in every host the cell renders in — the bar, the shell's nav rail on each edge, the
 * Dock's fixed 40px rail (a rail with no shell above it), the drawer's rail strip, MobileShell's
 * header — in both directions, because moving the pill outward is exactly what an `overflow`
 * ancestor would shave.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { Bell, MessageSquare } from "lucide-react";
import { AppProvider } from "./src/app/app-provider";
import { AppShell } from "./src/components/layout/app-shell";
import { MobileShell } from "./src/components/layout/mobile-shell";
import { Topbar } from "./src/components/layout/topbar";
import { TopbarItem } from "./src/components/layout/topbar-item";
const q = new URLSearchParams(location.search);
const host = q.get("host");
const items = (
  <>
    <TopbarItem aria-label="Notifications" data-case="one" badge={3} badgeTone="destructive" icon={<Bell aria-hidden="true" />} />
    <TopbarItem aria-label="Messages" data-case="many" badge="99+" icon={<MessageSquare aria-hidden="true" />} />
  </>
);
const body = <div style={{ blockSize: 200 }}>Body</div>;
let tree;
if (host === "bar") {
  tree = <AppShell topbar={<Topbar end={items} />}>{body}</AppShell>;
} else if (host === "rail-start" || host === "rail-end" || host === "rail-top") {
  tree = <AppShell navRail={items} navRailPosition={host.slice(5)} topbar={<Topbar />}>{body}</AppShell>;
} else if (host === "drawer") {
  tree = <AppShell navRail={items} mobileNavOpen onMobileNavOpenChange={() => {}} topbar={<Topbar />}>{body}</AppShell>;
} else if (host === "dock") {
  // The GoDX Dock's own rail (platform packages/dock/src/bar.tsx): the shell's rail class, fixed,
  // 40px, no .app-root above it.
  tree = (
    <nav className="app-nav-rail" data-orientation="vertical" data-edge="start"
      style={{ position: "fixed", insetBlock: 0, insetInlineStart: 0, inlineSize: 40, display: "flex",
        flexDirection: "column", alignItems: "center", gap: 2, paddingBlock: "var(--space-3)" }}>
      {items}
    </nav>
  );
} else {
  tree = <MobileShell height="fill" header={<div style={{ display: "flex", justifyContent: "flex-end" }}>{items}</div>}>{body}</MobileShell>;
}
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div id="ready">{tree}<span>ready</span></div>
  </AppProvider>,
);
`;

type Measure = {
  overlap: number;
  clipped: string | null;
  dir: string;
  topEnd: boolean;
  ring: number;
};

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

async function measure(host: string, dir: "ltr" | "rtl", width = 1280, noBoxAlign = false) {
  const page = await fixture.open(`?host=${host}&dir=${dir}`, { width, height: 800 });
  await page.locator('[data-case="many"] [data-slot="topbar-item-badge"]').last().waitFor();
  // AppProvider writes `dir` from the locale on mount; flip it afterwards, as an RTL app would.
  await page.evaluate((d) => {
    document.documentElement.dir = d;
  }, dir);
  // A browser without box alignment for absolutely positioned boxes (before Chrome 122 /
  // Firefox 134 / Safari 26): the placement must not depend on it.
  if (noBoxAlign) {
    await page.addStyleTag({
      content: ".ui-topbar-item-badge{justify-self:auto!important;align-self:auto!important}",
    });
  }
  // The drawer slides in; measure where it comes to rest.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running"),
  );
  const out = await page.evaluate(() => {
    const result: Record<string, Measure> = {};
    for (const key of ["one", "many"]) {
      // The drawer renders the rail twice (docked track hidden + drawer strip); take the visible one.
      const cell = [...document.querySelectorAll<HTMLElement>(`[data-case="${key}"]`)].find(
        (el) => el.getBoundingClientRect().width > 0,
      )!;
      const icon = cell.querySelector("svg")!.getBoundingClientRect();
      const pill = cell.querySelector<HTMLElement>('[data-slot="topbar-item-badge"]')!;
      const badge = pill.getBoundingClientRect();
      // The surface ring is part of what must stay visible: grow the box by its spread.
      const spread = parseFloat(getComputedStyle(pill).boxShadow.split(" ").at(-1) ?? "0") || 0;
      const outer = {
        left: badge.left - spread,
        right: badge.right + spread,
        top: badge.top - spread,
        bottom: badge.bottom + spread,
      };
      const ix = Math.max(0, Math.min(icon.right, badge.right) - Math.max(icon.left, badge.left));
      const iy = Math.max(0, Math.min(icon.bottom, badge.bottom) - Math.max(icon.top, badge.top));
      // Any ancestor that clips: its box, grown by `overflow-clip-margin` only for `clip`.
      let clipped: string | null = null;
      for (let el = cell.parentElement; el && !clipped; el = el.parentElement) {
        const cs = getComputedStyle(el);
        const clipsX = cs.overflowX !== "visible";
        const clipsY = cs.overflowY !== "visible";
        if (!clipsX && !clipsY) continue;
        const m =
          cs.overflowX === "clip" || cs.overflowY === "clip"
            ? parseFloat(cs.getPropertyValue("overflow-clip-margin")) || 0
            : 0;
        // Overflow clips at the PADDING box (and `overflow-clip-margin` grows from it).
        const b = el.getBoundingClientRect();
        const r = {
          left: b.left + parseFloat(cs.borderLeftWidth),
          right: b.right - parseFloat(cs.borderRightWidth),
          top: b.top + parseFloat(cs.borderTopWidth),
          bottom: b.bottom - parseFloat(cs.borderBottomWidth),
        };
        const out =
          (clipsX && (outer.left < r.left - m - 0.5 || outer.right > r.right + m + 0.5)) ||
          (clipsY && (outer.top < r.top - m - 0.5 || outer.bottom > r.bottom + m + 0.5));
        if (out) {
          const d = (n: number) => Math.round(n * 10) / 10;
          clipped =
            `${el.tagName.toLowerCase()}.${[...el.classList].join(".")} ` +
            `[pill ${d(outer.left)},${d(outer.top)}→${d(outer.right)},${d(outer.bottom)} ` +
            `clip ${d(r.left - m)},${d(r.top - m)}→${d(r.right + m)},${d(r.bottom + m)}]`;
        }
      }
      result[key] = {
        overlap: Math.round(((ix * iy) / (icon.width * icon.height)) * 1000) / 1000,
        clipped,
        dir: getComputedStyle(cell).direction,
        // On the glyph's TOP-END corner: above its top edge, and past its centre toward inline-end.
        topEnd:
          badge.top < icon.top &&
          (getComputedStyle(cell).direction === "rtl"
            ? badge.left < icon.left + icon.width / 2
            : badge.right > icon.right - icon.width / 2),
        ring: spread,
      };
    }
    return result;
  });
  await page.close();
  return out;
}

const CASES: Array<[string, number]> = [
  ["bar", 1280],
  ["rail-start", 1280],
  ["rail-end", 1280],
  ["rail-top", 1280],
  ["dock", 1280],
  ["drawer", 390],
  ["mobile-shell", 390],
];

describe(
  "TopbarItem count pill sits off its glyph's corner (gh#1341)",
  { timeout: 120_000 },
  () => {
    for (const [host, width] of CASES) {
      for (const dir of ["ltr", "rtl"] as const) {
        it(`${host} · ${dir}: covers at most 25% of the glyph and is not clipped`, async () => {
          const m = await measure(host, dir, width);
          for (const key of ["one", "many"] as const) {
            expect(m[key].dir, `${key} direction`).toBe(dir);
            expect(m[key].topEnd, `${key} on the top-end corner`).toBe(true);
            expect(m[key].ring, `${key} surface ring`).toBeGreaterThan(0);
            expect(m[key].overlap, `${key} overlap`).toBeLessThanOrEqual(0.25);
            expect(m[key].overlap, `${key} still on the corner`).toBeGreaterThan(0);
            expect(m[key].clipped, `${key} clipped by`).toBeNull();
          }
        });
      }
    }
  },
);

describe(
  "…and without box alignment on abspos (older Safari / Firefox)",
  { timeout: 120_000 },
  () => {
    for (const [host, width] of CASES) {
      it(`${host}: "99+" is still not clipped and covers at most 25%`, async () => {
        const m = await measure(host, "ltr", width, true);
        for (const key of ["one", "many"] as const) {
          expect(m[key].overlap, `${key} overlap`).toBeLessThanOrEqual(0.25);
          expect(m[key].clipped, `${key} clipped by`).toBeNull();
        }
      });
    }
  },
);
