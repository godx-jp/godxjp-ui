import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "@/test/chromium-fixture";

/**
 * v32 #1223 — Thumbnail → `<Image fit="intrinsic">`, measured in real Chromium with the real
 * stylesheet: fixed block size on the Thumbnail scale, the picture's OWN width (never cropped), the
 * hairline frame, the muted backdrop, the 100% clamp in a narrow column, and the width reserved
 * from the `width`/`height` attributes BEFORE the bytes land.
 *
 * PARITY FIRST. This file was written against the retired `Thumbnail` and compared the two side by
 * side in every case below; it was red (the Image frame took 1000×800 from the pixel attributes)
 * until `fit="intrinsic"` existed, then green, and only then was Thumbnail deleted. The boxes
 * below are the ones Thumbnail drew, recorded from that run. Colour and radius are compared with
 * the tokens rather than pinned, so a theme default changing elsewhere cannot fail this.
 */
const svg = (w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#888"/></svg>`)}`;

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Image } from "./src/components/data-display";
const LAND = ${JSON.stringify(svg(1280, 800))};
const PORT = ${JSON.stringify(svg(600, 900))};
function App() {
  const q = new URLSearchParams(location.search);
  const size = q.get("size") || undefined, narrow = q.get("narrow") === "1";
  const pending = q.get("pending") === "1";
  return (
    <AppProvider defaultLocale="en" persist={false}>
      <div id="row" style={{ display: "flex", flexWrap: "wrap", gap: 8, inlineSize: narrow ? 120 : 1000 }}>
        {[[LAND, 1280, 800], [PORT, 600, 900]].map(([src, w, h], i) => (
          <Image key={i} src={pending ? "about:blank#never" : src} width={w} height={h} alt="" size={size} preview={false} fit="intrinsic" />
        ))}
      </div>
      <div id="probe" style={{ background: "hsl(var(--muted))", borderRadius: "var(--radius)" }} />
    </AppProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
`;

let fx: ChromiumFixture;
beforeAll(async () => {
  fx = await bootChromium(ENTRY);
}, 180_000);
afterAll(async () => {
  await fx?.close();
});

async function measure(search: string) {
  const page = await fx.open(search);
  await page.waitForFunction(() =>
    [...document.querySelectorAll("#row img")].every((img) => (img as HTMLImageElement).complete),
  );
  const out = await page.evaluate(() => {
    const probe = getComputedStyle(document.getElementById("probe")!);
    return [...document.querySelectorAll("#row > *")].map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const round = (n: number) => Math.round(n * 10) / 10;
      return {
        box: [round(r.width), round(r.height)],
        border: `${cs.borderTopWidth} ${cs.borderTopStyle}`,
        mutedBackdrop: cs.backgroundColor === probe.backgroundColor,
        radiusToken: cs.borderTopLeftRadius === probe.borderTopLeftRadius,
        fit: getComputedStyle(el.querySelector("img")!).objectFit,
      };
    });
  });
  await page.close();
  return out;
}

const frame = (w: number, h: number) => ({
  box: [w, h],
  border: "1px solid",
  mutedBackdrop: true,
  radiusToken: true,
  fit: "contain",
});

describe(
  "Thumbnail → <Image fit='intrinsic'> parity (Chromium, #1223)",
  { timeout: 60_000 },
  () => {
    // [case, landscape 1280×800 box, portrait 600×900 box] — as the retired Thumbnail drew them.
    const golden: Array<[string, [number, number], [number, number]]> = [
      ["size=md", [152.4, 96], [64.7, 96]],
      ["size=sm", [101.2, 64], [43.3, 64]],
      ["size=lg", [254.8, 160], [107.3, 160]],
      ["size=md&narrow=1", [120, 96], [64.7, 96]],
      ["size=md&pending=1", [152.4, 96], [64.7, 96]],
    ];
    for (const [c, land, port] of golden) {
      it(c, async () => {
        expect(await measure(`?${c}`)).toEqual([frame(...land), frame(...port)]);
      });
    }
  },
);
