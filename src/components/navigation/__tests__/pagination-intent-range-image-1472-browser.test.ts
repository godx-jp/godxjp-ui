import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bootChromium, type ChromiumFixture } from "@/test/chromium-fixture";
const ENTRY = `
import * as React from "react";
import {createRoot} from "react-dom/client";
import {AppProvider} from "./src/app/app-provider";
import {Pagination} from "./src/components/navigation/pagination";
import {DatePicker} from "./src/components/data-entry/date-picker";
import {Image} from "./src/components/data-display/image";
window.__intents=[]; window.__changes=[];
function App(){
 const [range,setRange]=React.useState({from:new Date(2026,9,1),to:new Date(2026,9,24)});
 const [showImage,setShowImage]=React.useState(false); window.__showImage=()=>setShowImage(true);
 const q=new URLSearchParams(location.search);
 return <AppProvider defaultLocale="en" persist={false}>
 <Pagination value={3} total={100} simple={q.get("simple")==="1"} onPageIntent={p=>window.__intents.push(p)} />
 <DatePicker range value={range} defaultPickerValue={new Date(2026,8,1)} onValueChange={r=>{window.__changes.push(r);if(r?.from && r.to)setRange(r);}} />
 {showImage && <Image src="https://example.test/pending.png" alt="Pending" preview={false} width={135} height={142} placeholder={<img alt="" style={{width:"100%",height:"100%"}} src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='135' height='190'%3E%3C/svg%3E" />} />}
 </AppProvider>;
}createRoot(document.getElementById("root")).render(<App />);`;
let fx: ChromiumFixture;
beforeAll(async () => {
  fx = await bootChromium(ENTRY);
}, 180000);
afterAll(async () => {
  await fx?.close();
});
describe("range draft / page intent / placeholder (Chromium)", { timeout: 60000 }, () => {
  it.each([320, 390, 1280])("works in LTR/RTL at %s", async (width) => {
    for (const dir of ["ltr", "rtl"]) {
      const page = await fx.open("", { width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (["error", "warning"].includes(m.type())) errors.push(m.text());
      });
      await page.emulateMedia({ reducedMotion: "reduce" });
      // AppProvider sets document direction in an effect; mirror only after that first write.
      await page.waitForFunction(() => document.documentElement.dir === "ltr");
      await page.evaluate((d) => (document.documentElement.dir = d), dir);
      const next = page.getByRole("button", { name: "Next page", exact: true });
      await next.hover();
      await next.focus();
      await next.dispatchEvent("touchstart");
      expect(
        await page.evaluate(() => (window as unknown as { __intents: number[] }).__intents),
      ).toEqual([4, 4, 4]);
      await page.getByRole("textbox").first().click();
      const grid = page.getByRole("grid").first();
      await grid.getByRole("button", { name: /Tuesday, September 1st, 2026/ }).click();
      expect(
        await page.evaluate(() => (window as unknown as { __changes: unknown[] }).__changes.length),
      ).toBe(0);
      await grid.getByRole("button", { name: /Wednesday, September 30th, 2026/ }).click();
      expect(await page.getByRole("textbox").first().inputValue()).toBe("2026-09-01");
      expect(await page.getByRole("textbox").nth(1).inputValue()).toBe("2026-09-30");
      expect(
        await page.evaluate(() => (window as unknown as { __changes: unknown[] }).__changes.length),
      ).toBe(1);
      await page.route("https://example.test/pending.png", () => {});
      await page.evaluate(() => (window as unknown as { __showImage: () => void }).__showImage());
      await page.locator(".ui-image-placeholder").waitFor();
      const dims = await page.locator(".ui-image-placeholder").evaluate((el) => {
        const f = el.getBoundingClientRect();
        const r = el.firstElementChild!.getBoundingClientRect();
        return { frame: f.height, child: r.height };
      });
      expect(dims).toEqual({ frame: 142, child: 142 });
      expect(errors).toEqual([]);
      await page.close();
    }
  });
});
