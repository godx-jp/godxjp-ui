import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/** A horizontal FormField with `labelHidden` gives the control the whole row (no empty label track). */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { FormField } from "./src/components/data-entry/form-field";
import { Input } from "./src/components/data-entry/input";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready" style={{ width: 600 }}>
    <div id="h"><FormField label="Device code" labelHidden layout="horizontal"><Input /></FormField></div>
    <div id="v"><FormField label="Device code" labelHidden><Input /></FormField></div>
  </div></AppProvider>,
);
`;

let fixture: ChromiumFixture;
beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);
afterAll(async () => {
  await fixture?.close();
});

describe("FormField labelHidden layout", { timeout: 60_000 }, () => {
  it("lets the control span the row, horizontal and vertical", async () => {
    const page = await fixture.open("", { width: 1280, height: 600 });
    await page.waitForTimeout(150);
    const m = await page.evaluate(() =>
      ["h", "v"].map((id) => {
        const field = document
          .querySelector(`#${id} [data-slot="form-field"]`)!
          .getBoundingClientRect();
        const control = document
          .querySelector(`#${id} [data-slot="form-field-control"]`)!
          .getBoundingClientRect();
        return { start: control.left - field.left, width: field.width - control.width };
      }),
    );
    await page.close();
    for (const r of m) {
      expect(Math.abs(r.start)).toBeLessThanOrEqual(1);
      expect(Math.abs(r.width)).toBeLessThanOrEqual(1);
    }
  });
});
